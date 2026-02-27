import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Private Physiotherapy in Kilmarnock | JT Football Physiotherapy",
  description:
    "Private physiotherapy in Kilmarnock and Ayrshire. One-to-one assessment, hands-on treatment and personalised rehab plans to help you move without pain.",
};

export default function PrivatePhysiotherapyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/10 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl">
              <p className="text-[#1e3a8a] font-semibold tracking-wide uppercase text-sm mb-4">
                Private Physiotherapy | Kilmarnock
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                Private Physiotherapy in Kilmarnock
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Get expert, one-to-one private physiotherapy in Kilmarnock and Ayrshire. We help you reduce pain, move better and get back to the activities you love with clear, personalised treatment.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Private Physiotherapy
                </a>
                <Link
                  href="/services/free-discovery-session"
                  className="rounded-full border border-[#1e3a8a]/20 bg-white px-8 py-4 text-base font-semibold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-slate-50"
                >
                  Try a Free Discovery Session
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* What is private physiotherapy? */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
                  What is private physiotherapy?
                </h2>
                <div className="space-y-6 text-lg text-slate-600">
                  <p>
                    Private physiotherapy gives you longer, dedicated one-to-one time with a specialist. There is no rushing, no waiting list and no generic exercise sheet – just clear assessment, hands-on treatment and a plan tailored to you.
                  </p>
                  <p>
                    At JT Football Physiotherapy in Kilmarnock, we combine sports physiotherapy expertise with a friendly, straightforward approach. Whether you are recovering from a football injury, struggling with persistent back pain or simply want to move more freely, private physiotherapy can help.
                  </p>
                </div>
              </FadeIn>
              <div className="space-y-8">
                {[
                  {
                    title: "1. Dedicated one-to-one time",
                    desc: "You work directly with a physiotherapist for the whole session – no being passed between people or left on machines.",
                  },
                  {
                    title: "2. Clear, personalised plan",
                    desc: "We explain exactly what is going on, what private physiotherapy can do for you and the step-by-step plan to get you better.",
                  },
                  {
                    title: "3. Hands-on treatment ",
                    desc: "Where appropriate, we use joint mobilisation, soft tissue techniques and targeted exercises alongside education and advice.",
                  },
                  {
                    title: "4. Sport and everyday life focused",
                    desc: "Whether you want to play 90 minutes, walk without pain or lift the kids comfortably, your goals shape your treatment.",
                  },
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

        {/* Who is private physiotherapy for? */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Who is private physiotherapy for?
              </h2>
              <p className="text-lg text-slate-600">
                Private physiotherapy is ideal if you want fast access to expert help, clear answers and a plan designed around football, sport and day-to-day life in Ayrshire.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Footballers & athletes",
                  desc: "You need to know when you can train and play again – and how to reduce the risk of breaking down.",
                },
                {
                  title: "Busy professionals",
                  desc: "You want efficient, private physiotherapy sessions that fit around work and family without long waiting lists.",
                },
                {
                  title: "Everyday aches & pains",
                  desc: "Back, neck, knee or shoulder pain that keeps coming back and needs more than a quick painkiller.",
                },
              ].map((item, i) => (
                <FadeIn
                  key={i}
                  delay={i * 100}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Conditions we commonly treat */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Conditions private physiotherapy can help with
              </h2>
              <p className="text-lg text-slate-600">
                If pain, stiffness or reduced movement is affecting your everyday life, private physiotherapy can help you move more comfortably and confidently again.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Back, neck and shoulder pain",
                "Knee pain (including ligament and meniscus issues)",
                "Ankle sprains and instability",
                "Hip and groin pain",
                "Sports injuries and muscle strains",
                "Work-related or postural pain",
                "Post-surgical rehabilitation",
                "Long-standing niggles that keep returning",
                "Balance or confidence issues with walking",
              ].map((condition, i) => (
                <FadeIn
                  key={i}
                  delay={i * 50}
                  className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3"
                >
                  <svg
                    className="h-5 w-5 text-[#1e3a8a]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-slate-900">{condition}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* What to expect at your first appointment */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                What to expect at your first private physiotherapy appointment
              </h2>
              <p className="text-lg text-slate-600">
                Your first session is all about understanding you – your symptoms, your goals and what “better” looks like in real life.
              </p>
            </FadeIn>
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                {[
                  {
                    title: "1. Detailed conversation about your story",
                    desc: "We start with a full history of your pain or injury, your medical background and what you need your body to do – whether that is playing football, working a manual job or keeping up with family life.",
                  },
                  {
                    title: "2. Movement and strength assessment",
                    desc: "We assess how you move, your joint range of motion and muscle strength. This might include functional tests like squats, balance work or sport‑specific movements so we can see what is really limiting you.",
                  },
                  {
                    title: "3. Clear explanation of what is going on",
                    desc: "We bring together your story and the assessment findings to explain the likely diagnosis in plain English – and, if helpful, using physio terms like load tolerance, tissue healing times and movement control so you fully understand the plan.",
                  },
                  {
                    title: "4. Personalised treatment and rehab plan",
                    desc: "You leave with a clear, written or app‑based plan for private physiotherapy – including hands‑on treatment, specific exercises, how often to do them and when we expect to review your progress.",
                  },
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
              <FadeIn delay={200} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Private physiotherapy that fits around you</h3>
                <p className="text-slate-600 text-sm">
                  Appointments are one‑to‑one and unhurried, with time to ask questions and check you are happy with each step. Many people notice small changes even after the first session, while longer‑term issues often need a short block of treatment.
                </p>
                <p className="text-slate-600 text-sm">
                  If we feel another healthcare professional – such as your GP or a consultant – needs to be involved, we will always explain why and help you plan the next steps.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Testimonials based on Google reviews */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a] mb-2">
                5-Star Private Physiotherapy in Kilmarnock
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                What people say about our private physiotherapy
              </h2>
              <p className="text-lg text-slate-600">
                Our Google reviews highlight clear explanations, friendly support and real results for people in Kilmarnock and across Ayrshire.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "From the first private physiotherapy assessment I felt like my injury was finally understood. Jordan broke down what was happening in my hand, explained the treatment plan in simple terms and talked me through the rehab exercises step by step.",
                  detail:
                    "We covered everything from swelling management and load tolerance to how long tissue healing normally takes, so I left the session feeling reassured instead of guessing.",
                  name: "Private patient with hand injury",
                },
                {
                  quote:
                    "After years of on–off knee pain, a structured block of private physiotherapy has made a huge difference. We used a mix of manual therapy, progressive strengthening and gait retraining to get my knee loading properly again.",
                  detail:
                    "Jordan explained terms like ‘patellofemoral joint’, ‘quad activation’ and ‘progressive overload’ in plain English, and each week my pain reduced and my confidence in walking and squatting improved.",
                  name: "Patient with long‑standing knee pain",
                },
                {
                  quote:
                    "Getting back into football after a long break was tough on my body. Through regular private physio sessions we identified the root causes of my repeated strains and built a rehab and return‑to‑play programme around my fixtures.",
                  detail:
                    "We combined pitch‑based conditioning, strength and conditioning in the gym, and clear pre‑ and post‑match routines so I could train, recover and stay fit for longer.",
                  name: "Adult footballer returning to play",
                },
              ].map((review, i) => (
                <FadeIn
                  key={i}
                  delay={i * 100}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-4 text-[#fbbf24]">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <svg
                          key={idx}
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.384 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.538 1.118l-3.385-2.459a1 1 0 00-1.175 0l-3.385 2.46c-.783.57-1.838-.197-1.538-1.119l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-3">“{review.quote}”</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{review.detail}</p>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{review.name}</p>
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
                Ready to start private physiotherapy?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                If you are in Kilmarnock or Ayrshire and want expert, private physiotherapy with clear guidance and support, we are here to help.
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
