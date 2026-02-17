import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Injury Assessment & Diagnosis | JT Football Physiotherapy",
  description: "Comprehensive injury assessment and diagnosis services in Kilmarnock, Ayrshire.",
};

export default function InjuryAssessmentPage() {
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
                Expert Injury Assessment & Diagnosis
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Stop guessing and start recovering. Our comprehensive physiotherapy assessment identifies the root cause of your pain so we can build a plan that works.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Your Assessment
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">What happens during your assessment?</h2>
                <div className="space-y-6 text-lg text-slate-600">
                  <p>
                    An accurate diagnosis is the foundation of successful recovery. At JT Football Physiotherapy in Kilmarnock, we don&apos;t just treat symptoms; we investigate <em>why</em> they are happening.
                  </p>
                  <p>
                    Whether you&apos;ve suffered a fresh injury on the pitch or have been dealing with nagging pain for months, our assessment process is designed to give you clarity and confidence.
                  </p>
                </div>
              </FadeIn>
              <div className="space-y-8">
                {[
                  { title: "1. Your Story", desc: "We start by listening. Understanding how your injury happened, your medical history, and your goals is crucial for tailoring our approach." },
                  { title: "2. Physical Examination", desc: "We perform specific movement tests, strength assessments, and hands-on palpation to isolate the injured structure and identify contributing factors." },
                  { title: "3. Clear Diagnosis", desc: "No medical jargon. We explain exactly what is going on in plain English, so you understand your injury." },
                  { title: "4. Action Plan", desc: "You leave with a clear roadmap: what to do immediately, how to manage pain, and the steps we'll take to get you back to full fitness." }
                ].map((step, i) => (
                  <FadeIn key={i} delay={i * 100} className="flex gap-4">
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[#1e3a8a] font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Common Conditions */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">What We Assess & Treat</h2>
              <p className="text-lg text-slate-600">
                While we specialise in football injuries, our expertise covers a wide range of musculoskeletal conditions affecting active individuals in Ayrshire.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Ankle Sprains & Instability",
                "Hamstring & Calf Strains",
                "Knee Ligament Injuries (ACL, MCL)",
                "Meniscus Tears",
                "Groin & Hip Pain",
                "Lower Back Pain",
                "Achilles Tendinopathy",
                "Shin Splints",
                "Post-Surgical Rehabilitation"
              ].map((condition, i) => (
                <FadeIn key={i} delay={i * 50} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <svg className="h-5 w-5 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-slate-900">{condition}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#1e3a8a] text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Ready to get answers?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Don&apos;t let pain hold you back. Book your initial assessment at our Kilmarnock clinic today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Appointment
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
