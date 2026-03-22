"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "./FadeIn";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatRelativeTime(value: string) {
  return value.replace(/^a\s/i, "1 ").replace(/^an\s/i, "1 ");
}

export function Reviews() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [rating, setRating] = useState(5);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const manualReviews: GoogleReview[] = [
    {
      author_name: "Jimmy Preston",
      rating: 5,
      text: "Jordan is an outstanding physio. From my initial appointment to my assessment, he was professional, knowledgeable, and reassuring. He clearly explained my hand injury and the proposed treatment approach. I left feeling confident and well informed.",
      relative_time_description: "2 months ago",
      profile_photo_url: "",
    },
    {
      author_name: "Del Bonds",
      rating: 5,
      text: "After a long time away from playing football, I decided to get back into it and had some frustrating injuries getting in the way. After my first assessment from Jordan, he identified my underlying issues and set out a recovery and rehab plan.",
      relative_time_description: "9 months ago",
      profile_photo_url: "",
    },
    {
      author_name: "Craig Wilson",
      rating: 5,
      text: "I have been struggling with knee pain for 2 years and after a block of treatment with Jordan my pain is all but gone. Would absolutely recommend him to anyone.",
      relative_time_description: "Edited 10 months ago",
      profile_photo_url: "",
    },
    {
      author_name: "Sharon Murray",
      rating: 5,
      text: "Excellent service and very clear on what the issue is and a plan going forward. Thanks very much.",
      relative_time_description: "a month ago",
      profile_photo_url: "",
    },
    {
      author_name: "Erin Hanlon",
      rating: 5,
      text: "I had a great experience with Jordan, who was honest, professional, and quickly diagnosed my full ACL tear just one day after the injury. I then saw Jordan for pre-op physio, where I seen massive improvements in my knee extension.",
      relative_time_description: "5 days ago",
      profile_photo_url: "",
    },
    {
      author_name: "Robert Robertson",
      rating: 5,
      text: "Really good experience when attending Jordan, very knowledgeable and put our minds at ease.",
      relative_time_description: "a week ago",
      profile_photo_url: "",
    },
  ];

  const mergedReviews = [
    ...reviews,
    ...manualReviews.filter(
      (manual) =>
        !reviews.some((review) => review.author_name === manual.author_name)
    ),
  ];

  const INITIAL_DISPLAY_COUNT = 6;
  const displayedReviews = showAll
    ? mergedReviews
    : mergedReviews.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMoreReviews = mergedReviews.length > INITIAL_DISPLAY_COUNT;

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        
        if (data.reviews) {
          setReviews(data.reviews);
        }
        if (data.rating) {
          setRating(data.rating);
        }
        if (data.user_ratings_total) {
          setTotalRatings(data.user_ratings_total);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <section id="reviews" className="bg-slate-50 py-24 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Client Success Stories
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            See what our patients in Kilmarnock and Ayrshire have to say about their recovery journey with JT Football Physiotherapy.
          </p>
          <div className="mt-6 flex justify-center items-center gap-2">
             <span className="text-2xl font-bold text-slate-900">{rating}</span>
             <StarRating rating={Math.round(rating)} />
             <span className="text-slate-600 text-sm">({totalRatings} Google Reviews)</span>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-64 animate-pulse"></div>
            ))
          ) : displayedReviews.map((review, i) => (
            <FadeIn
              key={i}
              delay={i * 100} className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] font-bold text-lg">
                {review.author_name.split(" ").length > 1 ? `${review.author_name.split(" ")[0][0]}${review.author_name.split(" ").slice(-1)[0][0]}` : review.author_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{review.author_name}</h3>
                  <p className="text-xs text-slate-500">{formatRelativeTime(review.relative_time_description)}</p>
                </div>
              </div>
              <div className="mb-4">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed flex-grow line-clamp-4">
                "{review.text}"
              </p>
              {review.text && (
                <button
                  type="button"
                  onClick={() => setSelectedReviewIndex(i)}
                  className="mt-2 text-xs font-semibold text-[#1e3a8a] hover:underline self-start"
                >
                  Read full review
                </button>
              )}
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                 <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                 <span className="text-xs text-slate-400 font-medium">Google Review</span>
              </div>
            </FadeIn>
          ))}
        </div>

        {hasMoreReviews && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1e3a8a] px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#1e3a8a]/90 transition-all duration-200"
            >
              {showAll
                ? "Show Less"
                : `Show More Reviews (${mergedReviews.length - INITIAL_DISPLAY_COUNT} more)`}
              <svg 
                className={`h-4 w-4 transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}

        {selectedReviewIndex !== null && mergedReviews[selectedReviewIndex] && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4"
            onClick={() => setSelectedReviewIndex(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                onClick={() => setSelectedReviewIndex(null)}
                aria-label="Close full review"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {(() => {
                const review = mergedReviews[selectedReviewIndex];
                return (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] font-bold text-lg">
                        {review.author_name.split(" ").length > 1
                          ? `${review.author_name.split(" ")[0][0]}${review.author_name.split(" ").slice(-1)[0][0]}`
                          : review.author_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{review.author_name}</h3>
                        <p className="text-xs text-slate-500">{formatRelativeTime(review.relative_time_description)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line mb-4">
                      "{review.text}"
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                      <span className="font-medium">Google Review</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <FadeIn className="mt-16 text-center">
          <a
            href="https://www.google.com/search?q=JT+Football+Physiotherapy+Kilmarnock+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-[#1e3a8a] transition-all"
          >
            Read All Reviews on Google
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}