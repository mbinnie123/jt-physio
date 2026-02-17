import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Free Discovery Session | JT Football Physiotherapy Kilmarnock",
  description: "Book a free discovery session with our expert physiotherapists in Kilmarnock. Discuss your injury, get advice, and find out if we are the right fit for you.",
};

export default function FreeDiscoverySessionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/20 py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <FadeIn>
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2"></span>
                  No Cost • No Obligation • Expert Advice
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
                  Free <span className="text-[#1e3a8a]">Discovery Session</span> in Kilmarnock
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Unsure if physiotherapy is right for you? Suffering from an injury and don't know the best next step? Come in for a free, no-pressure chat with a specialist to discuss your needs.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Book Your Free Session
                  </a>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* What is it? */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  What is a Discovery Session?
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>
                    A Discovery Session is a complimentary 20-minute consultation designed for people who are unsure about physiotherapy or have been let down by previous treatments. It’s a chance for you to meet us, tell us your story, and see if we are the right fit to help you get back to full fitness.
                  </p>
                  <p>
                    We understand that committing to a treatment plan can be daunting, especially if you don't know the cause of your pain. This session removes the financial risk and gives you clarity on your injury.
                  </p>
                  <ul className="space-y-3 mt-6">
                    {[
                      "Discuss your injury history and current symptoms",
                      "Understand the potential causes of your pain",
                      "Get honest advice on the best treatment options",
                      "Learn how our football-specific approach works",
                      "No pressure to book a paid appointment"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="h-6 w-6 text-[#1e3a8a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
              <FadeIn delay={200} className="relative">
                 <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden shadow-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                    {/* Icon: Chat Bubble (Heroicons - MIT License) */}
                    <svg className="w-32 h-32 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.42-4.03 8-9 8a9.86 9.86 0 01-4.26-.95L3 20l1.4-3.72C3.51 15.04 3 13.57 3 12c0-4.42 4.03-8 9-8s9 3.58 9 8z" />
                    </svg>
                 </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
             <FadeIn className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Discovery Session vs. Full Assessment
                </h2>
             </FadeIn>
             <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                   <h3 className="text-xl font-bold text-slate-900 mb-4">Free Discovery Session</h3>
                   <ul className="space-y-3 text-slate-600">
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> 20 minute chat</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Discuss your history</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Determine if physio can help</li>
                      <li className="flex gap-2 items-center"><span className="text-red-500 font-bold">✕</span> No hands-on treatment</li>
                      <li className="flex gap-2 items-center"><span className="text-red-500 font-bold">✕</span> No formal diagnosis</li>
                   </ul>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 relative overflow-hidden shadow-sm">
                   <div className="absolute top-0 right-0 bg-[#1e3a8a] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                   <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">Initial Injury Assessment</h3>
                   <ul className="space-y-3 text-slate-700">
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> 45-60 minute comprehensive session</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Full physical examination</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Formal diagnosis & prognosis</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Hands-on treatment started</li>
                      <li className="flex gap-2 items-center"><span className="text-green-500 font-bold">✓</span> Personalised rehab plan</li>
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* Who is this for? */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Who Is This For?
              </h2>
              <p className="text-lg text-slate-600">
                This session is perfect for anyone in Kilmarnock or Ayrshire who wants to make an informed decision about their health and recovery.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Unsure About Physio?",
                  desc: "If you've never seen a physio before or are skeptical about whether it can help your specific issue, this is the perfect starting point."
                },
                {
                  title: "Persistent Pain?",
                  desc: "Struggling with an old injury that won't go away? We can give you a fresh perspective on why it's lingering and how to fix it."
                },
                {
                  title: "Footballers & Athletes",
                  desc: "Need to know if you can play this weekend? We can discuss your injury and give you guidance on return-to-play safety."
                }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 100} className="bg-slate-50 p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
            <div className="mt-16 text-center">
                <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="inline-block rounded-full bg-[#1e3a8a] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5"
                >
                    Book Your Free Discovery Session
                </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}