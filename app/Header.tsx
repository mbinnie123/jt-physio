"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        const headerOffset = 64;
        const elementPosition = elem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, "", href);
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900">
            <img
              src="/jt-football-physio-logo.svg"
              alt="JT Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            Football Physiotherapy
          </Link>
          <span className="hidden lg:block text-sm font-medium text-slate-500 border-l border-slate-200 pl-6">
            Ayrshire Based Physio Clinic in Kilmarnock
          </span>
        </div>

        <nav className="hidden gap-8 text-sm font-medium lg:flex items-center">
          <Link href="/about" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">
            About Us
          </Link>
          <Link
            href="/#reviews"
            className="text-slate-600 hover:text-[#1e3a8a] transition-colors"
            onClick={(e) => handleScroll(e, "/#reviews")}
          >
            Reviews
          </Link>
          <Link href="/blogs" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">
            Blogs
          </Link>
          <Link href="/contact" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">
            Contact
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all hover:shadow-md text-center"
          >
            Book Now
          </Link>
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <Link href="/contact" className="rounded-full bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
            Book
          </Link>
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="space-y-1 px-4 py-6">
            <Link href="/about" className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <Link
              href="/#reviews"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
              onClick={(e) => handleScroll(e, "/#reviews")}
            >
              Reviews
            </Link>
            <Link href="/blogs" className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
              Blogs
            </Link>
            <Link href="/contact" className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}