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

        {/* About your physiotherapist */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  Rehabilitation guided by professional football physiotherapy experience
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Your rehabilitation is led by <span className="font-semibold">Jordan Templeton, MSc
                  Physiotherapist</span>, with extensive experience supporting players at Kilmarnock FC and
                  Hearts of Midlothian FC. That background helps us design realistic, step-by-step rehab plans
                  that bridge the gap between the treatment room and the demands of your sport or daily life.
                </p>
                <p className="text-lg text-slate-600">
                  To read more about Jordan&apos;s pathway in football and physiotherapy, visit our
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
                <h3 className="text-base font-semibold text-slate-900 mb-3">Who our rehab programs are for</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>People recovering from recent injuries who want a clear, progressive plan.</li>
                  <li>Those returning to football or sport after time out through injury.</li>
                  <li>Anyone who has finished NHS treatment but still does not feel “match ready”.</li>
                </ul>
              </FadeIn>
            </div>
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
                  { title: "2. Personalised Treatment Plan", desc: "Based on our assessment, we develop a customised treatment plan that addresses your specific needs and goals. This may include manual therapy, exercise prescription, and education." },
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

        {/* Real examples of rehabilitation and return to play */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Real examples of rehabilitation and return to play
              </h2>
              <p className="text-lg text-slate-600">
                These anonymised examples show how structured rehab helped people move from injury back to the
                activities they care about.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: hamstring strain in an amateur footballer
                </h3>
                <p className="mb-2">
                  A player came to us two weeks after a sprint-related hamstring strain, worried about rushing
                  back too soon and “doing it again”.
                </p>
                <p className="mb-2">
                  We built a phased plan that started with pain-free strength work, then added running
                  progressions, change-of-direction drills and football-specific conditioning.
                </p>
                <p>
                  Over several weeks they progressed from light jogging to full training and eventually 90
                  minutes, following clear criteria at each stage rather than guesswork.
                </p>
              </FadeIn>
              <FadeIn
                delay={150}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: post-surgical knee rehab for an active parent
                </h3>
                <p className="mb-2">
                  An active parent recovering from knee surgery wanted to get back to walking longer distances
                  and playing with their children.
                </p>
                <p className="mb-2">
                  Working alongside the surgeon&apos;s guidance, we focused on restoring range of motion,
                  rebuilding strength and confidence in stairs, uneven ground and gentle running.
                </p>
                <p>
                  By the end of the programme they were walking comfortably, managing day-to-day tasks and had
                  a clear plan for future gym work to keep progress going.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* When rehab might not be the first step */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                When you may need medical input before rehab
              </h2>
              <p className="text-lg text-slate-600">
                Physiotherapy-led rehabilitation is suitable for most muscle, joint and tendon problems, but
                some situations are better assessed first by your GP, NHS 24 or emergency services.
              </p>
            </FadeIn>
            <FadeIn className="max-w-3xl mx-auto bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Seek urgent medical advice if:</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>You have severe, unexplained pain that is worsening quickly.</li>
                <li>You notice changes in bladder or bowel control, or numbness around the groin area.</li>
                <li>You have had a recent significant injury and have not yet ruled out a fracture.</li>
                <li>You feel systemically unwell with symptoms such as fever, unexplained weight loss or night sweats.</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                If you are unsure whether to start rehab now or seek medical advice first, you can contact us
                and we will help you choose the safest and most appropriate next step.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Rehabilitation FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Rehabilitation and return to play: common questions
              </h2>
              <p className="text-lg text-slate-600">
                Here are some of the questions people in Kilmarnock and Ayrshire often ask about rehab and
                returning to sport.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Do I need to be pain-free to start rehab?</h3>
                <p>
                  Not necessarily. Many people start rehab while they still have some symptoms. We will guide
                  what level of discomfort is acceptable and how to adjust exercises if things flare.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Can I do rehab if I am also under NHS or consultant care?</h3>
                <p>
                  Yes. We are happy to complement existing care. Where appropriate, we can align our rehab plan
                  with any surgical or consultant recommendations you have been given.
                </p>
              </FadeIn>
              <FadeIn delay={200} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How will I know when it is safe to return to play?</h3>
                <p>
                  We use simple, practical tests and clear criteria to guide your return to training and
                  matches, so the decision is based on more than just “how it feels on the day”.
                </p>
              </FadeIn>
              <FadeIn delay={300} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How often will I need sessions?</h3>
                <p>
                  Frequency depends on your injury, stage of recovery and goals. We will agree a realistic plan
                  together after your assessment, so you know what to expect.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Google reviews CTA */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-700">
              <p className="text-center sm:text-left">
                Want to hear how others have found their rehab and return-to-play journey with us?
              </p>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 border border-slate-200 shadow-sm">
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

        {/* Clinic location and CTA */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="space-y-4 text-sm text-slate-700 mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Rehabilitation at our Kilmarnock clinic
              </h2>
              <p>
                JT Football Physiotherapy is based in Kilmarnock and supports people from across Ayrshire and
                the surrounding areas. Your booking confirmation includes directions, parking information and
                what to expect from your first rehab session.
              </p>
              <p>
                Not sure whether to book rehab, an injury assessment or a shorter chat first? You can also
                start with our
                <Link
                  href="/services/free-discovery-session"
                  className="text-[#1e3a8a] font-semibold hover:underline mx-1"
                >
                  free discovery session
                </Link>
                to talk through your situation and goals.
              </p>
            </FadeIn>
            <FadeIn>
              <div className="rounded-3xl bg-[#1e3a8a] text-white py-16 px-6 sm:px-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Ready to get back in the game?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Do not let an injury keep you sidelined. Book your rehabilitation program at our Kilmarnock
                  clinic today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Rehab
                  </a>
                  <Link
                    href="/contact"
                    className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}