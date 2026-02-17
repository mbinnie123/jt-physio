"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        const header = document.querySelector("header");
        const headerOffset = header?.offsetHeight ?? 64;
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
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900" onClick={() => setIsServicesOpen(false)}>
            <img
              src="/jt-football-physio-logo.svg"
              alt="JT Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            Football Physiotherapy
          </Link>
          <span className="hidden lg:block text-xs font-medium text-slate-500 border-l border-slate-200 pl-6">
            Ayrshire Based Physio Clinic in Kilmarnock 
          </span>
        </div>

        <nav className="hidden gap-8 text-sm font-medium lg:flex items-center">
          <Link href="/" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            Home
          </Link>
          <Link href="/about" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            About Us
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isServicesOpen}
              className="flex items-center gap-1 text-slate-600 hover:text-[#1e3a8a] transition-colors outline-none py-2"
              onClick={() => setIsServicesOpen((v) => !v)}
              onFocus={() => setIsServicesOpen(true)}
            >
              Services
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              role="menu"
              className={
                `absolute left-1/2 -translate-x-1/2 top-full w-64 z-50 pt-2 ` +
                `transition-all duration-200 ease-out transform ` +
                (isServicesOpen
                  ? "opacity-100 visible translate-y-0 pointer-events-auto"
                  : "opacity-0 invisible -translate-y-1 pointer-events-none")
              }
            >
              <div className="rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-slate-900/5">
                <Link
                  role="menuitem"
                  href="/services/free-discovery-session"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsServicesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Free Discovery Session</span>
                  <span className="text-xs text-slate-500">Discuss Your Injury</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/services/injury-assessment"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsServicesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Injury Assessment</span>
                  <span className="text-xs text-slate-500">Diagnosis & Plan</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/services/rehabilitation"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsServicesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Rehabilitation</span>
                  <span className="text-xs text-slate-500">Return to Play</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/services/sports-massage"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsServicesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Sports Massage</span>
                  <span className="text-xs text-slate-500">Recovery & Prevention</span>
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/#reviews"
            className="text-slate-600 hover:text-[#1e3a8a] transition-colors"
            onClick={(e) => {
              handleScroll(e, "/#reviews");
              setIsServicesOpen(false);
            }}
          >
            Reviews
          </Link>
          <Link href="/blogs" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            Blogs
          </Link>
          <Link href="/contact" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            Contact
          </Link>
          <a
            href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
            className="rounded-full bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all hover:shadow-md text-center"
            onClick={() => setIsServicesOpen(false)}
          >
            Book Now
          </a>
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <a href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service" className="rounded-full bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
            Book
          </a>
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
            <Link href="/" className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/about" className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
              About Us
            </Link>
            <div className="py-2">
              <button
                type="button"
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
                onClick={() => setIsMobileServicesOpen((v) => !v)}
                aria-expanded={isMobileServicesOpen}
              >
                <span>Services</span>
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMobileServicesOpen && (
                <div className="mt-1">
                  <Link
                    href="/services/free-discovery-session"
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 pl-6"
                    onClick={() => {
                      setIsMobileServicesOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Free Discovery Session
                  </Link>
                  <Link
                    href="/services/injury-assessment"
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 pl-6"
                    onClick={() => {
                      setIsMobileServicesOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Injury Assessment
                  </Link>
                  <Link
                    href="/services/rehabilitation"
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 pl-6"
                    onClick={() => {
                      setIsMobileServicesOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Rehabilitation
                  </Link>
                  <Link
                    href="/services/sports-massage"
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 pl-6"
                    onClick={() => {
                      setIsMobileServicesOpen(false);
                      setIsMenuOpen(false);
                    }}
                  >
                    Sports Massage
                  </Link>
                </div>
              )}
            </div>
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