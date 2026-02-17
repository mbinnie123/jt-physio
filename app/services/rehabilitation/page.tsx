import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Rehabilitation & Return to Play | JT Football Physiotherapy",
  description: "Expert rehabilitation and return to play programs in Kilmarnock, Ayrshire.",
};

export default function RehabilitationPage() {
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
                Expert Rehabilitation & Return to Play Programs
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Get back in the game with confidence. Our tailored rehabilitation programs help you recover from injury and achieve peak performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Your Rehabilitation
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
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">What to expect from our rehabilitation programs?</h2>
                <div className="space-y-6 text-lg text-slate-600">
                  <p>
                    Effective rehabilitation is more than just exercises. At JT Football Physiotherapy in Kilmarnock, we focus on restoring function, building strength, and preventing future injuries.
                  </p>
                  <p>
                    Whether you&apos;re a professional athlete or a weekend warrior, our programs are designed to meet your specific needs and goals.
                  </p>
                </div>
              </FadeIn>
              <div className="space-y-8">
                {[
                  { title: "1. Comprehensive Assessment", desc: "We start with a thorough assessment to understand your injury, movement patterns, and any underlying issues contributing to your pain or dysfunction." },
                  { title: "2. Personalized Treatment Plan", desc: "Based on our assessment, we develop a customized treatment plan that addresses your specific needs and goals. This may include manual therapy, exercise prescription, and education." },
                  { title: "3. Progressive Rehabilitation", desc: "We guide you through a progressive rehabilitation program, gradually increasing the intensity and complexity of exercises to restore strength, mobility, and function." },
                  { title: "4. Return-to-Play Planning", desc: "We work with you to develop a safe and effective return-to-play plan, ensuring you're fully prepared to return to your sport or activity without re-injury." }
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

        {/* Common Techniques */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Rehabilitation Techniques We Use</h2>
              <p className="text-lg text-slate-600">
                We utilize a variety of evidence-based rehabilitation techniques to help you recover from injury and improve performance.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Manual Therapy",
                "Therapeutic Exercise",
                "Neuromuscular Retraining",
                "Proprioceptive Training",
                "Strength & Conditioning",
                "Functional Movement Training",
                "Sport-Specific Rehabilitation"
              ].map((technique, i) => (
                <FadeIn key={i} delay={i * 50} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <svg className="h-5 w-5 text-[#1e3a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-slate-900">{technique}</span>
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
                Ready to get back in the game?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Don&apos;t let an injury keep you sidelined. Book your rehabilitation program at our Kilmarnock clinic today.
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