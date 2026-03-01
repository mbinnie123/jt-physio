import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Free Discovery Session | JT Football Physiotherapy Kilmarnock",
  description: "Book a free discovery session with our expert physiotherapists in Kilmarnock. Discuss your injury, get advice, and find out if we are the right fit for you.",
  alternates: {
    canonical: "/services/free-discovery-session",
  },
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

        {/* About your physiotherapist */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  Speak directly with an experienced physiotherapist
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Your free discovery session is with <span className="font-semibold">Jordan Templeton, MSc
                  Physiotherapist</span>. It is a chance to talk through your story, ask questions and understand
                  how physiotherapy could help – before you decide to book a full assessment.
                </p>
                <p className="text-lg text-slate-600">
                  To learn more about Jordan&apos;s background in professional football and physiotherapy, visit our
                  <Link href="/about" className="text-[#1e3a8a] font-semibold hover:underline ml-1">
                    About page
                  </Link>
                  .
                </p>
              </FadeIn>
              <FadeIn
                delay={100}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700"
              >
                <h3 className="text-base font-semibold text-slate-900 mb-3">What this session is – and is not</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>It is a conversation to help you decide on the best next step.</li>
                  <li>It is not a formal assessment, diagnosis or treatment session.</li>
                  <li>There is no obligation to book paid sessions afterwards.</li>
                </ul>
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

        {/* Real examples of how a discovery session can help */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Real examples of how a free discovery session can help
              </h2>
              <p className="text-lg text-slate-600">
                These anonymised examples show how a short conversation has helped people in Ayrshire decide
                on the right next step.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: unsure whether to see a physio or GP
                </h3>
                <p className="mb-2">
                  Someone contacted us with recurring knee pain but was unsure whether to speak to their GP
                  first or book an assessment.
                </p>
                <p className="mb-2">
                  During the discovery session we talked through their history, current symptoms and any
                  warning signs.
                </p>
                <p>
                  We agreed that a physiotherapy assessment was appropriate, and they felt more confident
                  booking in knowing what to expect and what we would look for.
                </p>
              </FadeIn>
              <FadeIn
                delay={150}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: had physio before and worried it would be “the same again”
                </h3>
                <p className="mb-2">
                  Another person had tried physiotherapy elsewhere and felt they had just been given generic
                  exercises without much explanation.
                </p>
                <p className="mb-2">
                  In the discovery session we explained how our assessment and rehab process works, how we
                  tailor plans and what honest outcomes might look like for their situation.
                </p>
                <p>
                  They chose to start with one full assessment to see the difference, rather than committing to
                  a long block upfront.
                </p>
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

        {/* When a discovery session is not appropriate */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                When you may need urgent medical help instead
              </h2>
              <p className="text-lg text-slate-600">
                A discovery session is not suitable for emergencies or serious medical concerns. In these
                situations, please contact your GP, NHS 24 or emergency services instead.
              </p>
            </FadeIn>
            <FadeIn className="max-w-3xl mx-auto bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Get medical help urgently if:</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>You have severe, sudden or worsening pain, especially after a fall or accident.</li>
                <li>You notice changes in bladder or bowel control, or numbness around the groin.</li>
                <li>You feel unwell with symptoms such as fever, unexplained weight loss or night sweats.</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                Once any urgent issues have been checked and managed, we can then discuss whether physiotherapy
                is right for you.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Discovery session FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Free discovery session: common questions
              </h2>
              <p className="text-lg text-slate-600">
                A few quick answers so you know exactly what to expect.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is it really free?</h3>
                <p>
                  Yes. There is no charge for the discovery session and no requirement to book follow-up
                  appointments. It is simply a chance to talk things through.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">What happens after the session?</h3>
                <p>
                  We will summarise your options, which might include an injury assessment, private
                  physiotherapy, self-management advice or, in some cases, seeing another professional. You
                  choose what feels right for you.
                </p>
              </FadeIn>
              <FadeIn delay={200} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Can I bring someone with me?</h3>
                <p>
                  Yes. If it helps you feel more comfortable or you would like a parent, partner or friend to
                  hear the information too, you are welcome to bring someone along.
                </p>
              </FadeIn>
              <FadeIn delay={300} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Will you try to “sell” me physiotherapy?</h3>
                <p>
                  No. Our job is to explain what we can and cannot help with, and to give you an honest view on
                  whether working together makes sense.
                </p>
              </FadeIn>
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

        {/* Google reviews CTA */}
        <section className="py-12 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-700">
              <p className="text-center sm:text-left">
                Want to see what others say about working with us before you decide?
              </p>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 border border-slate-200 shadow-sm">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-white text-xs font-bold">
                  G
                </span>
                <a
                  href="https://www.google.com/search?q=JT+Football+Physiotherapy+Kilmarnock+reviews"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1e3a8a] font-semibold hover:underline"
                >
                  Read our reviews on Google
                </a>
              </span>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}