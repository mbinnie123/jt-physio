import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900">
            <Image
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

        <nav className="hidden gap-8 text-sm font-medium md:flex items-center">
          <Link href="/about" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">
            About Us
          </Link>
          <Link href="/reviews" className="text-slate-600 hover:text-[#1e3a8a] transition-colors">
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
            className="rounded-full bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 transition-all hover:shadow-md"
          >
            Book Now
          </Link>
        </nav>

        <Link href="/contact" className="md:hidden rounded-full bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white">
          Book
        </Link>
      </div>
    </header>
  );
}