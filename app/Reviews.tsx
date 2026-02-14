"use client";

import { FadeIn } from "./FadeIn";

const reviews = [
  {
    author: "Alan Brown",
    rating: 5,
    text: "Absolutely brilliant service. Jordan really knows his stuff when it comes to football injuries. Got me back playing sooner than expected.",
    date: "1 month ago",
  },
  {
    author: "Sarah Jenkins",
    rating: 5,
    text: "I was struggling with knee pain for months. After a few sessions and a tailored gym plan, I'm pain-free. Highly recommend!",
    date: "2 months ago",
  },
  {
    author: "David Ross",
    rating: 5,
    text: "Professional, knowledgeable and friendly. The clinic in Kilmarnock is great. Best physio I've been to.",
    date: "3 weeks ago",
  },
  {
    author: "Mark Thompson",
    rating: 5,
    text: "Great experience. The focus on strength and conditioning alongside the hands-on treatment made a huge difference to my recovery.",
    date: "4 months ago",
  },
  {
    author: "Emma Wilson",
    rating: 5,
    text: "Jordan is fantastic. He explains everything clearly and the treatment is top notch. 5 stars!",
    date: "5 months ago",
  },
  {
    author: "Gary Smith",
    rating: 5,
    text: "If you need a physio in Ayrshire, look no further. Helped me sort out a recurring hamstring issue.",
    date: "1 week ago",
  }
];

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

export function Reviews() {
  return (
    <section id="reviews" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Client Success Stories
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See what our patients in Kilmarnock and Ayrshire have to say about their recovery journey with JT Football Physiotherapy.
          </p>
          <div className="mt-6 flex justify-center items-center gap-2">
             <span className="text-2xl font-bold text-slate-900">5.0</span>
             <StarRating rating={5} />
             <span className="text-slate-600 text-sm">(Based on Google Reviews)</span>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <FadeIn key={i} delay={i * 100} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] font-bold text-lg">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{review.author}</h4>
                  <p className="text-xs text-slate-500">{review.date}</p>
                </div>
              </div>
              <div className="mb-4">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                "{review.text}"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                 <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                 <span className="text-xs text-slate-400 font-medium">Google Review</span>
              </div>
            </FadeIn>
          ))}
        </div>

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