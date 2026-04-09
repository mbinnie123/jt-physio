"use client";

import Link from "next/link";
import { useState } from "react";
import { useTopContactBarVisibility } from "./TopContactBar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileAboutOpen, setIsMobileAboutOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const isContactBarVisible = useTopContactBarVisibility();

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
    <header className={`sticky z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300 ease-in-out ${
      isContactBarVisible ? "top-[3.35rem] sm:top-12" : "top-0"
    }`}>
      <div className="mx-auto flex h-16 lg:h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <span className="hidden xl:block text-xs font-medium text-slate-500 border-l border-slate-200 pl-6">
            Ayrshire Based Physio Clinic in Kilmarnock
          </span>
        </div>

        <nav className="hidden lg:gap-5 xl:gap-7 text-sm font-medium lg:flex items-center">
          <Link href="/" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setIsAboutOpen(true)}
            onMouseLeave={() => setIsAboutOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isAboutOpen}
              className="flex items-center gap-1 text-slate-600 hover:text-[#1e3a8a] transition-colors outline-none py-2"
              onClick={() => setIsAboutOpen((v) => !v)}
              onFocus={() => setIsAboutOpen(true)}
            >
              About
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isAboutOpen ? "rotate-180" : ""}`}
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
                (isAboutOpen
                  ? "opacity-100 visible translate-y-0 pointer-events-auto"
                  : "opacity-0 invisible -translate-y-1 pointer-events-none")
              }
            >
              <div className="rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-slate-900/5">
                <Link
                  role="menuitem"
                  href="/about"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsAboutOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">About JT Football Physio</span>
                  <span className="text-xs text-slate-500">Who we are & how we work</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/faq"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsAboutOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Physiotherapy FAQ</span>
                  <span className="text-xs text-slate-500">Common questions answered</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/prices"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsAboutOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Pricing</span>
                  <span className="text-xs text-slate-500">Clear, transparent rates</span>
                </Link>
              </div>
            </div>
          </div>
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
                <Link
                  role="menuitem"
                  href="/services/private-physiotherapy"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => {
                    setIsServicesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-semibold block text-slate-900">Private Physiotherapy</span>
                  <span className="text-xs text-slate-500">Why choose private care</span>
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
          <div
            className="relative"
            onMouseEnter={() => setIsResourcesOpen(true)}
            onMouseLeave={() => setIsResourcesOpen(false)}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isResourcesOpen}
              className="flex items-center gap-1 text-slate-600 hover:text-[#1e3a8a] transition-colors outline-none py-2"
              onClick={() => setIsResourcesOpen((v) => !v)}
              onFocus={() => setIsResourcesOpen(true)}
            >
              Resources
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isResourcesOpen ? "rotate-180" : ""}`}
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
                `absolute right-0 top-full w-64 z-50 pt-2 ` +
                `transition-all duration-200 ease-out transform ` +
                (isResourcesOpen
                  ? "opacity-100 visible translate-y-0 pointer-events-auto"
                  : "opacity-0 invisible -translate-y-1 pointer-events-none")
              }
            >
              <div className="rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-slate-900/5">
                <Link
                  role="menuitem"
                  href="/blogs"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => { setIsResourcesOpen(false); setIsMenuOpen(false); }}
                >
                  <span className="font-semibold block text-slate-900">Blogs</span>
                  <span className="text-xs text-slate-500">Physio tips & insights</span>
                </Link>
                <Link
                  role="menuitem"
                  href="/case-studies"
                  className="block rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition-colors"
                  onClick={() => { setIsResourcesOpen(false); setIsMenuOpen(false); }}
                >
                  <span className="font-semibold block text-slate-900">Case Studies</span>
                  <span className="text-xs text-slate-500">Real patient journeys</span>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/contact" className="text-slate-600 hover:text-[#1e3a8a] transition-colors" onClick={() => setIsServicesOpen(false)}>
            Contact
          </Link>
          <a
            href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
            className="rounded-full bg-[#1e3a8a] lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all hover:shadow-md whitespace-nowrap"
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
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="px-4 py-4">
            <Link href="/" className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 border-b border-slate-100" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <div className="border-b border-slate-100">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl"
                onClick={() => setIsMobileAboutOpen((v) => !v)}
                aria-expanded={isMobileAboutOpen}
              >
                <span>About</span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isMobileAboutOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileAboutOpen && (
                <div className="pb-2 pl-2">
                  {[
                    { href: "/about", label: "About JT Football Physio", sub: "Who we are & how we work" },
                    { href: "/faq", label: "Physiotherapy FAQ", sub: "Common questions answered" },
                    { href: "/prices", label: "Pricing", sub: "Clear, transparent rates" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col rounded-xl px-3 py-3 hover:bg-slate-50"
                      onClick={() => { setIsMobileAboutOpen(false); setIsMenuOpen(false); }}
                    >
                      <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{item.sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="border-b border-slate-100">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl"
                onClick={() => setIsMobileServicesOpen((v) => !v)}
                aria-expanded={isMobileServicesOpen}
              >
                <span>Services</span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileServicesOpen && (
                <div className="pb-2 pl-2">
                  {[
                    { href: "/services/free-discovery-session", label: "Free Discovery Session", sub: "Discuss your injury" },
                    { href: "/services/injury-assessment", label: "Injury Assessment", sub: "Diagnosis & plan" },
                    { href: "/services/rehabilitation", label: "Rehabilitation", sub: "Return to play" },
                    { href: "/services/sports-massage", label: "Sports Massage", sub: "Recovery & prevention" },
                    { href: "/services/private-physiotherapy", label: "Private Physiotherapy", sub: "Why choose private care" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col rounded-xl px-3 py-3 hover:bg-slate-50"
                      onClick={() => { setIsMobileServicesOpen(false); setIsMenuOpen(false); }}
                    >
                      <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{item.sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/#reviews"
              className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 border-b border-slate-100"
              onClick={(e) => handleScroll(e, "/#reviews")}
            >
              Reviews
            </Link>
            <div className="border-b border-slate-100">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50 rounded-xl"
                onClick={() => setIsMobileResourcesOpen((v) => !v)}
                aria-expanded={isMobileResourcesOpen}
              >
                <span>Resources</span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isMobileResourcesOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileResourcesOpen && (
                <div className="pb-2 pl-2">
                  {[
                    { href: "/blogs", label: "Blogs", sub: "Physio tips & insights" },
                    { href: "/case-studies", label: "Case Studies", sub: "Real patient journeys" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col rounded-xl px-3 py-3 hover:bg-slate-50"
                      onClick={() => { setIsMobileResourcesOpen(false); setIsMenuOpen(false); }}
                    >
                      <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{item.sub}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/contact"
              className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-3 pb-1">
              <a
                href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                className="block w-full rounded-full bg-[#1e3a8a] px-6 py-3.5 text-center text-base font-semibold text-white shadow hover:bg-blue-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Your Appointment
              </a>
            </div>
          </div>
        </div>
      )}
    </header>




  );
}