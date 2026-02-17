import Link from "next/link";

const SocialIcon = ({ href, label, children }: { href: string, label: string, children: React.ReactNode }) => (
  <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1e3a8a] transition-colors">
    {children}
  </a>
);

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#4C6CD6] text-white rounded-2xl p-8 text-center mb-12 shadow-lg">
          <h3 className="text-2xl font-bold">Ayrshire | Kilmarnock</h3>
          <p className="mt-2 mb-4 text-blue-100">Ready to start your recovery journey?</p>
          <a
            href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
            className="rounded-full bg-white px-6 py-3 text-base font-bold text-[#1e3a8a] hover:bg-slate-100 transition-colors"
          >
            BOOK A FREE DISCOVERY CALL
          </a>
        </div>

        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
             <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-slate-900">
              <img
                src="/jt-football-physio-logo.svg"
                alt="JT Logo"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
              Football Physiotherapy
            </Link>
            <div className="flex space-x-4">
              <SocialIcon href="https://www.facebook.com/people/JT-Football-Physiotherapy/61576375958276/" label="Facebook"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></SocialIcon>
              <SocialIcon href="https://x.com/TempletonJ_" label="X (formerly Twitter)"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></SocialIcon>
              <SocialIcon href="https://www.instagram.com/jtfootballphysiotherapy/" label="Instagram"><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" /></svg></SocialIcon>
            </div>
            <div className="mt-6 text-sm text-slate-500 space-y-2">
              <p className="font-semibold text-slate-900">JT Football Physiotherapy</p>
              <p>5 Bunting Pl, Kilmarnock KA1 3LE</p>
              <p>
                <a href="tel:07841430205" className="hover:text-[#1e3a8a] transition-colors">07841 430205</a>
              </p>
              <p>
                <a href="mailto:jtfootballphysiotherapy@gmail.com" className="hover:text-[#1e3a8a] transition-colors">jtfootballphysiotherapy@gmail.com</a>
              </p>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/privacy" className="text-sm text-slate-600 hover:text-[#1e3a8a]">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-sm text-slate-600 hover:text-[#1e3a8a]">Terms and conditions</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="/accessibility" className="text-sm text-slate-600 hover:text-[#1e3a8a]">Accessibility</Link></li>
                  <li><Link href="/refund" className="text-sm text-slate-600 hover:text-[#1e3a8a]">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-900/10 pt-8">
          <p className="text-xs leading-5 text-slate-600">&copy; {new Date().getFullYear()} JT Football Physiotherapy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}