import Image from "next/image";
import { notFound } from "next/navigation";

import { wixClient } from "../../lib/wix";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

type BlogPost = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  // Wix can return coverImage/content in different shapes depending on API/version
  coverImage?: any;
  content?: any;
  richContent?: any;
  firstPublishedDate?: string | number | Date | null;
  contentId?: string | null;
  media?: any;
  _id: string;
};

function resolveWixMediaUrl(input: unknown): string | null {
  if (!input) return null;

  // Already a normal URL
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) return input;

    // Wix media URIs often look like:
    // wix:image://v1/<mediaId>/<fileName>#originWidth=...&originHeight=...
    // wix:vector://v1/<mediaId>/<fileName>
    const v1Match = input.match(/wix:(image|vector):\/\/v1\/([^/]+)(?:\/[^#?]+)?/i);
    if (v1Match?.[2]) {
      return `https://static.wixstatic.com/media/${v1Match[2]}`;
    }

    // Some Wix APIs return just the mediaId; handle that too
    if (/^[0-9a-f]{6,}_.+~mv2\./i.test(input)) {
      return `https://static.wixstatic.com/media/${input}`;
    }

    return null;
  }

  // Object shapes (common in Wix SDK responses)
  // e.g. { url: "..." } or { file: { url: "..." } }
  const asAny = input as any;
  const url = asAny?.url || asAny?.file?.url || asAny?.image?.url;
  return resolveWixMediaUrl(url);
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyTextDecorations(text: string, decorations: any[] | undefined): string {
  if (!decorations?.length) return text;
  return decorations.reduce((acc, deco) => {
    const t = String(deco?.type || "").toUpperCase();
    if (t === "BOLD") return `<strong>${acc}</strong>`;
    if (t === "ITALIC") return `<em>${acc}</em>`;
    if (t === "UNDERLINE") return `<u>${acc}</u>`;
    if (t === "CODE") return `<code>${acc}</code>`;
    if (t === "STRIKETHROUGH") return `<s>${acc}</s>`;
    return acc;
  }, text);
}

function ricosToHtml(rich: any): string {
  if (!rich) return "";

  // Some SDKs return rich content as a JSON string
  if (typeof rich === "string") {
    try {
      const parsed = JSON.parse(rich);
      return ricosToHtml(parsed);
    } catch {
      return "";
    }
  }

  const nodes: any[] =
    rich?.nodes ||
    rich?.document?.nodes ||
    rich?.richContent?.nodes ||
    rich?.content?.nodes ||
    [];

  const renderChildren = (node: any): string =>
    Array.isArray(node?.nodes) ? node.nodes.map(renderNode).join("") : "";

  const renderTextNode = (node: any): string => {
    const text = escapeHtml(String(node?.textData?.text ?? ""));
    return applyTextDecorations(text, node?.textData?.decorations);
  };

  const renderNode = (node: any): string => {
    const type = String(node?.type || "").toUpperCase();

    if (type === "TEXT") return renderTextNode(node);

    if (type === "PARAGRAPH") {
      const inner = renderChildren(node);
      // Avoid empty <p></p>
      return inner.trim() ? `<p>${inner}</p>` : "";
    }

    if (type === "HEADING") {
      const level = Number(node?.headingData?.level) || 2;
      const safeLevel = Math.min(6, Math.max(1, level));
      const inner = renderChildren(node);
      return inner.trim() ? `<h${safeLevel}>${inner}</h${safeLevel}>` : "";
    }

    if (type === "BULLETED_LIST" || type === "ORDERED_LIST") {
      const tag = type === "ORDERED_LIST" ? "ol" : "ul";
      const items = renderChildren(node);
      return items.trim() ? `<${tag}>${items}</${tag}>` : "";
    }

    if (type === "LIST_ITEM") {
      const inner = renderChildren(node);
      return inner.trim() ? `<li>${inner}</li>` : "";
    }

    if (type === "LINK") {
      const href = node?.linkData?.link?.url || node?.linkData?.url;
      const inner = renderChildren(node) || escapeHtml(String(node?.linkData?.text || ""));
      if (!href) return inner;
      return `<a href="${escapeHtml(String(href))}" rel="noopener noreferrer" target="_blank">${inner}</a>`;
    }

    if (type === "IMAGE") {
      // Ricos image shapes vary a bit; try a few
      const src =
        node?.imageData?.image?.src?.url ||
        node?.imageData?.image?.src?.id ||
        node?.imageData?.image?.src ||
        node?.imageData?.src?.url ||
        node?.imageData?.src?.id ||
        node?.imageData?.src;

      const url = resolveWixMediaUrl(src);
      if (!url) return "";

      const alt =
        node?.imageData?.altText ||
        node?.imageData?.image?.alt ||
        node?.imageData?.image?.altText ||
        "";

      const caption = node?.imageData?.caption || "";

      const img = `<img src="${escapeHtml(url)}" alt="${escapeHtml(String(alt))}" loading="lazy" />`;
      if (caption) {
        return `<figure>${img}<figcaption>${escapeHtml(String(caption))}</figcaption></figure>`;
      }
      return img;
    }

    // Fallback: just render children so we don’t lose everything
    return renderChildren(node);
  };

  return nodes.map(renderNode).join("");
}

function normaliseHtmlContent(post: BlogPost): string {
  // 1) If we already have HTML, use it
  const rawHtml =
    typeof post.content === "string"
      ? post.content
      : post.content?.html || post.content?.body || post.content?.text || post.richContent?.html || "";

  let html = String(rawHtml || "");

  // If Wix returns rich content as an object accidentally stringified, avoid rendering [object Object]
  if (html === "[object Object]") html = "";

  // 2) If no HTML, try converting Ricos rich content JSON to HTML
  if (!html.trim()) {
    const ricosHtml = ricosToHtml(post.richContent || post.content);
    if (ricosHtml.trim()) html = ricosHtml;
  }

  // 3) Convert wix media URIs inside HTML to https URLs so they actually render
  // Example: <img src="wix:image://v1/11062b_xxx~mv2.jpg/...">
  html = html.replace(
    /wix:(image|vector):\/\/v1\/([^/]+)(?:\/[^"'>#?]+)?/gi,
    (_m, _type, mediaId) => `https://static.wixstatic.com/media/${mediaId}`
  );

  // Some exports may use data-wix-src
  html = html.replace(
    /data-wix-src="wix:(image|vector):\/\/v1\/([^/]+)(?:\/[^"'>#?]+)?"/gi,
    (_m, _type, mediaId) => `src=\"https://static.wixstatic.com/media/${mediaId}\"`
  );

  return html;
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items } = await wixClient.posts.queryPosts().eq("slug", slug).find();

  const post = items?.[0] as BlogPost | undefined;
  if (!post) return {};

  return {
    title: `${post.title ?? "Blog"} | JT Football Physiotherapy`,
    description: post.excerpt ?? "",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items } = await wixClient.posts.queryPosts().eq("slug", slug).find();
  const initialPost = items?.[0];

  if (!initialPost) notFound();

  let post = initialPost as BlogPost;

  // Try to get the full post record
  try {
    const { post: fullPost } = await wixClient.posts.getPost(post._id);
    if (fullPost) post = fullPost as BlogPost;
  } catch (e) {
    console.error("Failed to fetch full post", e);
  }

  // Some Wix SDK versions don’t include the body unless you explicitly request fields.
  // Your SDK exposes `posts.Field` / `posts.PostFieldField`, so we’ll try those enums instead of string literals.
  try {
    const postsAny = (wixClient as any).posts;
    const FieldEnum = postsAny?.PostFieldField || postsAny?.Field;

    if (FieldEnum) {
      console.log("WIX Field enum keys", Object.keys(FieldEnum));

      const wanted = ["CONTENT", "RICH_CONTENT", "URL", "MEDIA"]
        .filter((k) => FieldEnum[k])
        .map((k) => FieldEnum[k]);

      if (wanted.length) {
        // Try a few option shapes (SDKs differ)
        const attempts: Array<{ name: string; fn: () => Promise<any> }> = [
          { name: "getPost({ fields })", fn: () => postsAny.getPost(post._id, { fields: wanted }) },
          { name: "getPost({ fieldsets })", fn: () => postsAny.getPost(post._id, { fieldsets: wanted }) },
          { name: "getPostBySlug({ fields })", fn: () => postsAny.getPostBySlug(post.slug, { fields: wanted }) },
          { name: "getPostBySlug({ fieldsets })", fn: () => postsAny.getPostBySlug(post.slug, { fieldsets: wanted }) },
        ];

        for (const a of attempts) {
          try {
            console.log("Trying body fetch via", a.name);
            const res = await a.fn();
            const p = res?.post || res;
            if (p && (p.content || p.richContent)) {
              post = { ...(post as any), ...(p as any) } as BlogPost;
              console.log("Body fetch success via", a.name);
              break;
            }
          } catch (err) {
            console.log("Body fetch failed via", a.name, err);
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch post body via fields", e);
  }

  // NOTE: Your SDK doesn’t expose any postContents/content endpoints (postContents/blog are empty),
  // so we fetch the body via posts field selection above.

  console.log("FULL POST KEYS", Object.keys(post));
  console.log("contentId", (post as any).contentId);
  console.log("post.content", post.content);
  console.log("post.richContent", post.richContent);
  const coverUrl =
    resolveWixMediaUrl(post.coverImage) ||
    resolveWixMediaUrl(post.media?.image) ||
    resolveWixMediaUrl(post.media?.coverImage) ||
    resolveWixMediaUrl(post.media?.mainMedia) ||
    resolveWixMediaUrl(post.media?.image?.url) ||
    resolveWixMediaUrl(post.media?.image?.id);
  const html = normaliseHtmlContent(post);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 py-24">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {post.title}
              </h1>

              {post.firstPublishedDate && (
                <time className="text-sm text-slate-500">
                  {new Date(post.firstPublishedDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
            </div>

            {coverUrl && (
              <div className="relative mb-10 h-[400px] w-full overflow-hidden rounded-3xl shadow-sm">
                <Image
                  src={coverUrl}
                  alt={post.title || "Blog post"}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            )}

            <div className="prose prose-slate prose-lg mx-auto max-w-none">
              {html ? (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              ) : post.excerpt ? (
                <p>{post.excerpt}</p>
              ) : (
                <p>This post doesn’t have body content available.</p>
              )}
            </div>
          </FadeIn>
        </article>
      </main>

      <Footer />
    </div>
  );
}
