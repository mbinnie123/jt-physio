import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Private Physiotherapy in Kilmarnock | JT Football Physiotherapy",
  description:
    "Private physiotherapy in Kilmarnock and Ayrshire. One-to-one assessment, hands-on treatment and personalised rehab plans to help you move without pain.",
  alternates: {
    canonical: "/services/private-physiotherapy",
  },
};

export default function PrivatePhysiotherapyPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.jtfootballphysiotherapy.co.uk",
        "name": "JT Football Physiotherapy",
        "image": "https://www.jtfootballphysiotherapy.co.uk/logo.png",
        "description": "Expert physiotherapy services in Kilmarnock specialising in injury assessment, rehabilitation, sports massage, and recovery.",
        "telephone": "+441563544449",
        "url": "https://www.jtfootballphysiotherapy.co.uk",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kilmarnock",
          "addressRegion": "Ayrshire",
          "postalCode": "KA1",
          "addressCountry": "UK"
        },
        "areaServed": "Kilmarnock, Ayrshire, Scotland",
        "priceRange": "£50-£150"
      },
      {
        "@type": "Service",
        "@id": "https://www.jtfootballphysiotherapy.co.uk/services/private-physiotherapy",
        "name": "Private Physiotherapy",
        "description": "One-to-one private physiotherapy assessment, hands-on treatment and personalised rehabilitation plans in Kilmarnock and Ayrshire.",
        "provider": {
          "@id": "https://www.jtfootballphysiotherapy.co.uk"
        },
        "areaServed": "Kilmarnock, Ayrshire",
        "availableLanguage": "en"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.jtfootballphysiotherapy.co.uk"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://www.jtfootballphysiotherapy.co.uk/services"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Private Physiotherapy",
            "item": "https://www.jtfootballphysiotherapy.co.uk/services/private-physiotherapy"
          }
        ]
      }
    ]
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
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

        {/* About your physiotherapist */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  Private physiotherapy led by an experienced football physiotherapist
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Your private physiotherapy sessions are delivered by <span className="font-semibold">Jordan
                  Templeton, MSc Physiotherapist</span>, with over 7 years of experience working in professional
                  football in Ayrshire and Scotland. That means your assessment and rehab plan are grounded in
                  real match and training demands, not just theory.
                </p>
                <p className="text-lg text-slate-600">
                  If you would like to learn more about Jordan&apos;s background, qualifications and experience in
                  professional football, you can read the full story on our
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
                <h3 className="text-base font-semibold text-slate-900 mb-3">Who this service is for</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>People in Kilmarnock and Ayrshire who want one-to-one, private assessment and treatment.</li>
                  <li>Footballers and active adults who need a clear, structured plan instead of guesswork.</li>
                  <li>Anyone who values having time to ask questions and understand what is really going on.</li>
                </ul>
              </FadeIn>
            </div>
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
            <FadeIn className="mt-10 max-w-3xl text-sm text-slate-600">
              <p>
                If you are unsure whether your pain or injury is suitable for private physiotherapy, you are
                welcome to book a
                <Link
                  href="/services/free-discovery-session"
                  className="text-[#1e3a8a] font-semibold hover:underline mx-1"
                >
                  free discovery session
                </Link>
                so we can discuss the best next step for you.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* When private physiotherapy might not be right for you */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                When private physiotherapy might not be the first step
              </h2>
              <p className="text-lg text-slate-600">
                Your safety comes first. In some situations, we may recommend that you speak to your GP, NHS
                24 or emergency services before or alongside private physiotherapy.
              </p>
            </FadeIn>
            <FadeIn className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Seek medical advice urgently if:</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>You have severe, unexplained pain that is rapidly getting worse.</li>
                <li>You notice changes in bladder or bowel control, or numbness around the groin area.</li>
                <li>You have had a recent fall or accident and are concerned about a fracture.</li>
                <li>You feel unwell with symptoms such as fever, unexplained weight loss or night sweats.</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                If you are unsure whether private physiotherapy is appropriate, you can contact us and we will
                help you decide whether an assessment here or a medical opinion is the best first step.
              </p>
            </FadeIn>
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
              <FadeIn
                delay={200}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">Private physiotherapy that fits around you</h3>
                <p className="text-slate-600 text-sm">
                  Appointments are one‑to‑one and unhurried, with time to ask questions and check you are happy with each step. Many people notice small changes even after the first session, while longer‑term issues often need a short block of treatment.
                </p>
                <p className="text-slate-600 text-sm">
                  If we feel another healthcare professional – such as your GP or a consultant – needs to be involved, we will always explain why and help you plan the next steps.
                </p>
                <div className="pt-3 border-t border-slate-100 mt-2">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Practical details</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    <li>Sessions typically last around 45–60 minutes for a full assessment and treatment.</li>
                    <li>Wear comfortable clothing that allows you to move freely and for the area to be assessed.</li>
                    <li>
                      Bring any scan or imaging reports you have, plus a list of medications if relevant.
                    </li>
                    <li>
                      We agree the likely number of sessions together after the first appointment, based on
                      your goals and how long the problem has been present.
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Real case examples */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Real examples of private physiotherapy in Kilmarnock
              </h2>
              <p className="text-lg text-slate-600">
                These anonymised examples give you a feel for how private physiotherapy can look in real life.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-8">
              <FadeIn className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-sm text-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: long-standing knee pain in a recreational footballer
                </h3>
                <p className="mb-2">
                  A recreational player in their 30s came in with on–off knee pain that had been limiting their
                  ability to play a full match.
                </p>
                <p className="mb-2">
                  After assessing strength, movement control and training load, we identified weakness through
                  the quads and hips plus a rapid jump in weekly game time.
                </p>
                <p>
                  Over 6 sessions we used education, progressive strength work and load management to gradually
                  build tolerance. By the end of the block they were playing 90 minutes without the familiar
                  flare-up afterwards.
                </p>
              </FadeIn>
              <FadeIn
                delay={150}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-sm text-slate-700"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: back pain in a desk-based worker who plays 5-a-side
                </h3>
                <p className="mb-2">
                  A desk-based professional was struggling with lower back pain that worsened after 5-a-side and
                  long days at work.
                </p>
                <p className="mb-2">
                  We combined hands‑on treatment, simple movement breaks at work and a short home exercise
                  programme to build strength and confidence in bending and twisting.
                </p>
                <p>
                  Within a few weeks they reported less stiffness in the mornings and were able to play
                  regularly again, with a clear plan for keeping symptoms under control.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Private physiotherapy FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Private physiotherapy: common questions
              </h2>
              <p className="text-lg text-slate-600">
                These are some of the questions people in Kilmarnock and Ayrshire often ask before booking
                private physiotherapy.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is private physiotherapy worth it?</h3>
                <p>
                  For many people, the value is in having fast access, longer one‑to‑one time and a clear plan
                  that fits around work, family and sport. We will always be honest if we do not think private
                  physiotherapy is the right option for you.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Do I need to stop all activity?</h3>
                <p>
                  Not always. Often we can modify training load, intensity or specific movements so that you keep
                  active safely while things settle and strengthen. We will agree this together at your
                  appointment.
                </p>
              </FadeIn>
              <FadeIn delay={200} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Can you help if I am not a footballer?</h3>
                <p>
                  Yes. While we have strong experience in football, we regularly work with people who simply
                  want to walk, work, exercise and live with less pain and more confidence.
                </p>
              </FadeIn>
              <FadeIn delay={300} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How many sessions will I need?</h3>
                <p>
                  It depends on the type of problem, how long you have had it and what you want to get back to
                  doing. Some people need only one or two sessions with a clear plan, while others benefit from
                  a short block of treatment and rehab.
                </p>
              </FadeIn>
              <FadeIn delay={400} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Can I use health insurance?</h3>
                <p>
                  If you have private health insurance, please contact us before booking so we can let you know
                  whether your policy can be used for sessions at JT Football Physiotherapy.
                </p>
              </FadeIn>
              <FadeIn delay={500} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">What if I am nervous about pain during treatment?</h3>
                <p>
                  We will always work within your comfort levels and explain what to expect before we do
                  anything. You are in control throughout the session, and we can adapt or pause treatment at
                  any time.
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
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-700">
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-white text-xs font-bold">
                    G
                  </span>
                  <a
                    href="https://www.google.com/search?q=JT+Football+Physiotherapy+Kilmarnock+reviews"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1e3a8a] font-semibold hover:underline"
                  >
                    Read more reviews on Google
                  </a>
                </span>
              </div>
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

        {/* Clinic location and practical info */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="space-y-4 text-sm text-slate-700">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
                Private physiotherapy clinic in Kilmarnock
              </h2>
              <p>
                JT Football Physiotherapy is based in Kilmarnock, serving people from across Ayrshire and the
                surrounding areas. When you book, your confirmation email will include full directions, parking
                details and what to bring.
              </p>
              <p>
                If you are unsure whether to book a full private physiotherapy session or start with a
                shorter conversation, you can also choose our
                <Link
                  href="/services/free-discovery-session"
                  className="text-[#1e3a8a] font-semibold hover:underline mx-1"
                >
                  free discovery session
                </Link>
                to talk through your goals and the options available.
              </p>
            </FadeIn>
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
