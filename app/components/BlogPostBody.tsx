import { RicosViewer } from "@wix/ricos";
import "@wix/ricos/dist/styles.css";

type BlogPost = {
  title: string;
  richContent?: any | null;
  contentText?: string | null;
  htmlBody?: string | null;
  contentFormat?: "ricos" | "html" | "plainText" | "none";
};

/**
 * BlogPostBody component handles rendering blog post content in multiple formats.
 * Priority: richContent (Ricos) > htmlBody (HTML) > contentText (plain text)
 * 
 * Wix published posts only return contentText (plain text).
 * Draft posts would return richContent (Ricos format).
 */
export function BlogPostBody({ post }: { post: BlogPost }) {
  // Try richContent first (Ricos format - full structured content)
  if (post.richContent) {
    return (
      <div className="prose prose-lg max-w-none">
        <RicosViewer content={post.richContent} />
      </div>
    );
  }

  // Fallback to HTML body if richContent unavailable
  if (post.htmlBody) {
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.htmlBody }}
      />
    );
  }

  // Final fallback to plain text
  if (post.contentText) {
    return (
      <div className="prose prose-lg max-w-none">
        {post.contentText.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4">
            {para}
          </p>
        ))}
      </div>
    );
  }

  // No content available
  return (
    <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
      <p>📌 No content available yet.</p>
      <p className="text-sm mt-2">
        This post may not have any body content, or content could not be retrieved from Wix.
      </p>
    </div>
  );
}

/**
 * Helper function to determine content format priority
 */
export function getContentFormat(post: BlogPost): BlogPost["contentFormat"] {
  if (post.richContent) return "ricos";
  if (post.htmlBody) return "html";
  if (post.contentText) return "plainText";
  return "none";
}
