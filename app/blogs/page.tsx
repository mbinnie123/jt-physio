import Link from "next/link";
import Image from "next/image";
import { wixClient } from "../lib/wix";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

type BlogPost = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  firstPublishedDate?: string | number | Date | null;
  minutesToRead?: number | null;
  featured?: boolean | null;
  pinned?: boolean | null;
  // Wix often returns image info under media
  media?: any;
  // Some SDKs include coverImage
  coverImage?: any;
};

export const metadata = {
  title: "Blogs | JT Football Physiotherapy",
  description: "Latest news and articles from JT Football Physiotherapy.",
};

export const revalidate = 0;

function resolveWixMediaUrl(input: unknown): string | null {
  if (!input) return null;

  // Already a normal URL
  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) return input;

    // Wix media URIs like: wix:image://v1/<mediaId>/<fileName>#...
    const v1Match = input.match(/wix:(image|vector):\/\/v1\/([^/]+)(?:\/[^#?]+)?/i);
    if (v1Match?.[2]) return `https://static.wixstatic.com/media/${v1Match[2]}`;

    // Sometimes it’s already a media filename/id
    if (/^[0-9a-f]{6,}_.+~mv2\./i.test(input)) {
      return `https://static.wixstatic.com/media/${input}`;
    }

    return null;
  }

  // Object shapes
  const asAny = input as any;
  const url =
    asAny?.url ||
    asAny?.file?.url ||
    asAny?.image?.url ||
    asAny?.src?.url ||
    asAny?.src?.id ||
    asAny?.src;

  return resolveWixMediaUrl(url);
}

function getFeaturedImageUrl(post: BlogPost): string | null {
  // Try a bunch of likely places Wix stores the featured/cover image
  return (
    resolveWixMediaUrl((post as any).coverImage) ||
    resolveWixMediaUrl((post as any).media?.image) ||
    resolveWixMediaUrl((post as any).media?.coverImage) ||
    resolveWixMediaUrl((post as any).media?.mainMedia) ||
    resolveWixMediaUrl((post as any).media?.image?.url) ||
    resolveWixMediaUrl((post as any).media?.image?.id) ||
    resolveWixMediaUrl((post as any).media?.wixMedia?.image) ||
    null
  );
}

export default async function BlogsPage() {
  let posts: BlogPost[] = [];

  try {
    // Fetch posts. Some Wix SDK versions omit media unless requested;
    // your SDK exposes posts.Field / posts.PostFieldField, so we attempt to request MEDIA/URL.
    const postsAny = (wixClient as any).posts;
    const FieldEnum = postsAny?.PostFieldField || postsAny?.Field;

    const wanted = FieldEnum
      ? (["MEDIA", "URL"].filter((k) => FieldEnum[k]).map((k) => FieldEnum[k]) as any[])
      : [];

    const query = wixClient.posts.queryPosts();

    let response: any;
    // Try a couple of option shapes depending on SDK
    if (wanted.length) {
      try {
        response = await (query as any).find({ fields: wanted });
      } catch {
        response = await (query as any).find({ fieldsets: wanted });
      }
    } else {
      response = await query.find();
    }

    posts = (response?.items || []) as BlogPost[];

    // Prefer pinned/featured first
    posts.sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (bp !== ap) return bp - ap;
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (bf !== af) return bf - af;
      const ad = a.firstPublishedDate ? new Date(a.firstPublishedDate).getTime() : 0;
      const bd = b.firstPublishedDate ? new Date(b.firstPublishedDate).getTime() : 0;
      return bd - ad;
    });
  } catch (err) {
    console.error("Failed to fetch blog posts from Wix:", err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Our Blogs
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Insights, tips, and recovery advice for footballers and athletes.
            </p>
          </FadeIn>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const imageUrl = getFeaturedImageUrl(post);
              const dateLabel = post.firstPublishedDate
                ? new Date(post.firstPublishedDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <FadeIn key={post._id} delay={i * 100} className="flex h-full flex-col">
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{ borderColor: "#1e3a8a" }}
                  >
                    {imageUrl ? (
                      <div className="relative h-48 w-full bg-slate-100">
                        <Image
                          src={imageUrl}
                          alt={post.title || "Blog post"}
                          fill
                          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={i < 2}
                        />
                        {(post.pinned || post.featured) && (
                          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                            {post.pinned ? "Pinned" : "Featured"}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex h-48 w-full items-center justify-center bg-slate-100">
                        <span className="text-xl font-bold text-slate-500">No Image</span>
                      </div>
                    )}

                    <div className="flex flex-grow flex-col p-6">
                      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {dateLabel && <span>{dateLabel}</span>}
                        {typeof post.minutesToRead === "number" && post.minutesToRead > 0 && (
                          <span>• {post.minutesToRead} min read</span>
                        )}
                      </div>

                      <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#1e3a8a]">
                        {post.title}
                      </h3>
                      <p className="mb-4 line-clamp-3 flex-grow text-slate-600">{post.excerpt}</p>
                      <span className="text-sm font-medium" style={{ color: "#1e3a8a" }}>
                        Read more →
                      </span>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}

            {posts.length === 0 && (
              <div className="col-span-full text-center text-slate-500">
                No blog posts found. Check back soon!
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}