"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function HeroVideoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lock / unlock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Pause & reset when closing
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer inline-flex items-center gap-2.5 rounded-full border border-[#1e3a8a]/30 bg-white/80 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:scale-95"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e3a8a] shrink-0">
          <svg className="h-3 w-3 text-white translate-x-px" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </span>
        Inside the Clinic — See How We Work
      </button>

      {/* Modal — rendered into document.body via portal so it always covers the full page */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-slate-900/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Clinic sneak peek video"
        >
          <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-black">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Close video"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video
              ref={videoRef}
              src="/sneak-peak-clinic-ayrshire-physio-physiotherapy.mp4"
              controls
              autoPlay
              playsInline
              className="w-full aspect-video bg-black"
              aria-label="Inside the JT Football Physiotherapy clinic, Kilmarnock, Ayrshire"
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
