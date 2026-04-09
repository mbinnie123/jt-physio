import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Injury Assessment & Diagnosis | JT Football Physiotherapy",
  description: "Comprehensive injury assessment and diagnosis services in Kilmarnock, Ayrshire.",
  alternates: {
    canonical: "/services/injury-assessment",
  },
};

export default function InjuryAssessmentPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.jordanphysiotherapyayrshire.co.uk",
        "name": "JT Football Physiotherapy",
        "image": "https://www.jordanphysiotherapyayrshire.co.uk/logo.png",
        "description": "Expert physiotherapy services in Kilmarnock specialising in injury assessment, rehabilitation, sports massage, and recovery.",
        "telephone": "+441563544449",
        "url": "https://www.jordanphysiotherapyayrshire.co.uk",
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
        "@id": "https://www.jordanphysiotherapyayrshire.co.uk/services/injury-assessment",
        "name": "Injury Assessment & Diagnosis",
        "description": "Comprehensive injury assessment and diagnostic evaluation to identify the root cause of your pain and guide effective treatment in Kilmarnock and Ayrshire.",
        "provider": {
          "@id": "https://www.jordanphysiotherapyayrshire.co.uk"
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
            "item": "https://www.jordanphysiotherapyayrshire.co.uk"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://www.jordanphysiotherapyayrshire.co.uk/services"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Injury Assessment",
            "item": "https://www.jordanphysiotherapyayrshire.co.uk/services/injury-assessment"
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

        {/* About your physiotherapist */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  Injury assessment led by an experienced football physiotherapist
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Your assessment is carried out by <span className="font-semibold">Jordan Templeton, MSc
                  Physiotherapist</span>, who has over 7 years of experience working in professional football in
                  Ayrshire and Scotland. That experience means your diagnosis and plan are based on what works
                  on the pitch as well as in the treatment room.
                </p>
                <p className="text-lg text-slate-600">
                  You can learn more about Jordan&apos;s background, qualifications and approach to physiotherapy on
                  our
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
                <h3 className="text-base font-semibold text-slate-900 mb-3">Who this assessment is for</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>New injuries that need a clear diagnosis and plan.</li>
                  <li>Long-standing niggles that have never fully settled.</li>
                  <li>Players and active adults who need to know if and when they can return to sport.</li>
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

        {/* Real examples of injury assessment in Kilmarnock */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Real examples of injury assessment in Kilmarnock
              </h2>
              <p className="text-lg text-slate-600">
                These anonymised examples show how an assessment can give you clear answers and a plan.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: ankle injury after a weekend match
                </h3>
                <p className="mb-2">
                  A local footballer arrived unsure whether they had “just a sprain” or something more serious
                  after rolling their ankle during a tackle.
                </p>
                <p className="mb-2">
                  Through specific ligament tests, strength checks and balance assessment, we confirmed a
                  moderate sprain without signs of fracture and outlined how long different phases of recovery
                  were likely to take.
                </p>
                <p>
                  They left with clear guidelines on walking, icing, loading, and when we expected them to be
                  ready to start running again.
                </p>
              </FadeIn>
              <FadeIn
                delay={150}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: long-standing back pain in a desk-based worker
                </h3>
                <p className="mb-2">
                  Someone working full-time at a desk came in with months of low back pain and no clear
                  diagnosis despite trying rest and painkillers.
                </p>
                <p className="mb-2">
                  The assessment highlighted stiffness in the hips, reduced trunk strength and a big jump in
                  weekend activity compared to weekday sitting.
                </p>
                <p>
                  We explained the likely diagnosis, ruled out red flags and created a simple starting plan for
                  movement breaks and graded strengthening, which then fed into a longer-term rehab programme.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* When an assessment might not be the first step */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                When to seek urgent medical advice instead
              </h2>
              <p className="text-lg text-slate-600">
                Most muscle, joint and tendon problems are suitable for physiotherapy assessment. However,
                there are times when you should speak to your GP, NHS 24 or emergency services first.
              </p>
            </FadeIn>
            <FadeIn className="max-w-3xl mx-auto bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Contact a doctor or NHS service urgently if:</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>You have severe, sudden or unexplained pain that is rapidly getting worse.</li>
                <li>You notice changes in bladder or bowel control, or numbness around the groin area.</li>
                <li>You have had a significant fall or trauma and suspect a fracture or serious injury.</li>
                <li>You feel generally unwell with symptoms such as fever, unexplained weight loss or night sweats.</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                If you are unsure whether an injury assessment is appropriate, you can contact us and we will
                help you decide whether a medical opinion or physio assessment is the best first step.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Injury assessment FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Injury assessment: common questions
              </h2>
              <p className="text-lg text-slate-600">
                These are some of the questions people in Kilmarnock and Ayrshire often ask before booking an
                initial assessment.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Do I need a GP referral?</h3>
                <p>
                  No. You can book directly with us for an injury assessment. If we feel you need further
                  medical investigations or a scan, we will explain why and help you plan the next steps.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Will I get treatment at my first appointment?</h3>
                <p>
                  In most cases, yes. As long as it is safe to do so, we will start hands-on treatment and give
                  you initial advice and exercises as part of the assessment session.
                </p>
              </FadeIn>
              <FadeIn delay={200} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">What should I bring?</h3>
                <p>
                  Please wear or bring comfortable clothing, and if you have any scan reports or letters related
                  to your injury, bring those too. A list of medications can also be helpful.
                </p>
              </FadeIn>
              <FadeIn delay={300} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How long does an assessment last?</h3>
                <p>
                  An initial injury assessment typically lasts around 45–60 minutes. This gives us time to hear
                  your story, carry out the assessment and start your plan.
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
                Want to know what others think of our assessments and treatment?
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
                Injury assessment at our Kilmarnock clinic
              </h2>
              <p>
                JT Football Physiotherapy is based in Kilmarnock, serving people from across Ayrshire and the
                surrounding areas. When you book, your confirmation email includes directions, parking details
                and guidance on what to bring.
              </p>
              <p>
                If you are unsure whether to book a full injury assessment or start with a shorter
                conversation, you can also choose our
                <Link
                  href="/services/free-discovery-session"
                  className="text-[#1e3a8a] font-semibold hover:underline mx-1"
                >
                  free discovery session
                </Link>
                to talk through your goals and the options available.
              </p>
            </FadeIn>
            <FadeIn>
              <div className="rounded-3xl bg-[#1e3a8a] text-white py-16 px-6 sm:px-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Ready to get answers?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Do not let pain hold you back. Book your initial assessment at our Kilmarnock clinic today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Assessment
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
