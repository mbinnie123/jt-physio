"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { FadeIn } from "./FadeIn";

export interface CarouselPost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  minutesToRead?: number;
  imageUrl?: string | null;
  pinned?: boolean;
  featured?: boolean;
}

export function BlogCarousel({ posts }: { posts: CarouselPost[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Scroll by roughly one item width or container width
      const scrollAmount = current.clientWidth; 
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (posts.length === 0) {
     return (
        <div className="text-center">
          <FadeIn>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Recent Posts</h3>
              <p className="text-slate-600 mb-4">Check out our blog for the latest articles and updates.</p>
              <Link href="/blogs" className="font-semibold text-[#1e3a8a] hover:underline">
                View All Posts &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
     );
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons - Only show if we have enough posts to scroll */}
      {posts.length > 3 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e3a8a] shadow-lg transition-all hover:bg-slate-50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            aria-label="Previous posts"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1e3a8a] shadow-lg transition-all hover:bg-slate-50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            aria-label="Next posts"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto overflow-y-hidden gap-4 sm:gap-8 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post, i) => (
          <div
            key={post._id}
            className="snap-start flex-shrink-0 basis-[85%] sm:basis-[60%] md:basis-[40%] lg:basis-[30%] xl:basis-[25%]"
          >
            <FadeIn delay={i * 100} className="flex h-full flex-col">
              <Link
                href={post.slug ? `/blogs/${post.slug}` : "/blogs"}
                className="group w-full flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100"
              >
                {post.imageUrl ? (
                  <div className="relative aspect-[16/9] w-full bg-slate-100 sm:h-48 sm:aspect-auto">
                    <Image
                      src={post.imageUrl}
                      alt={post.title || "Blog post"}
                      fill
                      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {(post.pinned || post.featured) && (
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                        {post.pinned ? "Pinned" : "Featured"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-slate-100 sm:h-48 sm:aspect-auto">
                    <span className="text-xl font-bold text-slate-500">No Image</span>
                  </div>
                )}

                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {post.date && <span>{post.date}</span>}
                    {typeof post.minutesToRead === "number" && post.minutesToRead > 0 && (
                      <span>• {post.minutesToRead} min read</span>
                    )}
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#1e3a8a]">
                    {post.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 flex-grow text-slate-600">{post.excerpt}</p>
                  <span className="text-sm font-medium text-[#1e3a8a]">
                    Read more →
                  </span>
                </div>
              </Link>
            </FadeIn>
          </div>
        ))}
      </div>
    </div>
  );
}