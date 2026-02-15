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
};

export const metadata = {
  title: "Blogs | JT Football Physiotherapy",
  description: "Latest news and articles from JT Football Physiotherapy.",
};

export default async function BlogsPage() {
  let posts: any[] = [];
  try {
    const response = await wixClient.posts.queryPosts().find();
    posts = response.items;
  } catch (err) {
    console.error("Failed to fetch blog posts from Wix:", err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">Our Blogs</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Insights, tips, and recovery advice for footballers and athletes.
            </p>
          </FadeIn>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <FadeIn key={post._id} delay={i * 100} className="flex flex-col h-full">
                <Link href={`/blogs/${post.slug}`} className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {post.coverImage && (
                    <div className="relative h-48 w-full bg-slate-100">
                      <Image
                        src={post.coverImage}
                        alt={post.title || "Blog post"}
                        fill
                        className="object-cover"
                     />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1e3a8a] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <span className="text-sm font-medium text-[#1e3a8a] mt-auto">Read more &rarr;</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
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