import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Sports Massage Kilmarnock | Prevention & Recovery | JT Physio",
  description: "Professional sports massage in Kilmarnock & Ayrshire. Speed up recovery, reduce muscle tension, and prevent injury with expert soft tissue therapy.",
};

export default function SportsMassagePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/10 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl">
              <p className="text-[#1e3a8a] font-semibold tracking-wide uppercase text-sm mb-4">Kilmarnock Physiotherapy Clinic</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                Sports Massage & Recovery Therapy
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Optimise your recovery and keep your body performing at its best. Our sports massage targets muscle tension, improves flexibility, and helps prevent injuries before they happen.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Sports Massage
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">More Than Just a Massage</h2>
                <div className="space-y-6 text-lg text-slate-600">
                  <p>
                    Sports massage isn't just for elite athletes. Whether you're a footballer, a runner, a gym-goer, or simply suffering from work-related tension, soft tissue therapy is a powerful tool for physical health.
                  </p>
                  <p>
                    At JT Football Physiotherapy in Kilmarnock, we use targeted techniques to release tight spots, flush out metabolic waste, and restore proper movement patterns.
                  </p>
                </div>
              </FadeIn>
              <div className="grid sm:grid-cols-2 gap-6">
                 {[
                    { title: "Accelerate Recovery", desc: "Reduce muscle soreness (DOMS) after matches or heavy training sessions." },
                    { title: "Improve Flexibility", desc: "Restore range of motion by releasing tight muscles and fascia." },
                    { title: "Prevent Injury", desc: "Identify and treat potential problem areas before they become full-blown injuries." },
                    { title: "Pain Relief", desc: "Alleviate chronic tension, back pain, and stiff necks caused by daily life." }
                 ].map((item, i) => (
                    <FadeIn key={i} delay={i * 100} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                       <p className="text-sm text-slate-600">{item.desc}</p>
                    </FadeIn>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* When to book */}
        <section className="py-24 bg-slate-50">
           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">When is the best time for a Sports Massage?</h2>
                 <p className="text-lg text-slate-600">
                    Timing matters. We tailor your session based on your training schedule and goals.
                 </p>
              </FadeIn>
              
              <div className="grid md:grid-cols-3 gap-8">
                 <FadeIn className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Maintenance</h3>
                    <p className="text-slate-600">Regular sessions (e.g., monthly) to keep tissues healthy, address niggles early, and maintain flexibility.</p>
                 </FadeIn>
                 <FadeIn delay={100} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Pre-Event</h3>
                    <p className="text-slate-600">Stimulating massage 24-48 hours before a big match or race to prime muscles and improve circulation without causing fatigue.</p>
                 </FadeIn>
                 <FadeIn delay={200} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Post-Event Recovery</h3>
                    <p className="text-slate-600">Flushing massage 1-2 days after intense activity to reduce soreness, clear metabolic waste, and speed up recovery.</p>
                 </FadeIn>
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#1e3a8a] text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Treat your body right
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Experience the benefits of professional sports massage in Kilmarnock.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Massage
                </a>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                >
                  Contact Us
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}