import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "ACL Injury Case Study — Erin's Prehab Journey | JT Football Physiotherapy Kilmarnock",
  description:
    "Erin tore her ACL and couldn't walk without a limp. See how ACL prehab physiotherapy in Kilmarnock, Ayrshire helped her build strength, restore movement, and get her knee in the best condition for surgery.",
  alternates: {
    canonical: "/case-studies/erin-acl-kilmarnock",
  },
  openGraph: {
    title: "ACL Injury Case Study — Erin's Prehab Journey | JT Football Physiotherapy Kilmarnock",
    description:
      "Erin tore her ACL and couldn't walk without a limp. See how ACL prehab physiotherapy in Kilmarnock helped her restore movement, build quad strength, and reach the best possible condition before surgery.",
    url: "https://www.jordanphysiotherapyayrshire.co.uk/case-studies/erin-acl-kilmarnock",
    locale: "en_GB",
    type: "article",
  },
};

export const revalidate = 86400;

const schemaMarkup = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalCaseStudy",
      "name": "Erin — ACL Prehab Case Study, Kilmarnock",
      "description":
        "Erin injured her ACL and worked with Jordan Templeton at JT Football Physiotherapy in Kilmarnock, Ayrshire on a prehab programme before surgery. Key outcomes included restored walking pattern, improved knee extension and flexion, and optimal pre-surgical conditioning.",
      "study": {
        "@type": "MedicalStudy",
        "healthCondition": {
          "@type": "MedicalCondition",
          "name": "Anterior Cruciate Ligament (ACL) Injury",
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.jordanphysiotherapyayrshire.co.uk",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Case Studies",
          "item": "https://www.jordanphysiotherapyayrshire.co.uk/case-studies",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Erin — ACL Prehab, Kilmarnock",
          "item": "https://www.jordanphysiotherapyayrshire.co.uk/case-studies/erin-acl-kilmarnock",
        },
      ],
    },
  ],
};

export default function ErinACLCaseStudyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/10 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                <Link href="/" className="hover:text-[#1e3a8a] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/kilmarnock-ayrshire" className="hover:text-[#1e3a8a] transition-colors">Kilmarnock, Ayrshire</Link>
                <span>/</span>
                <span className="text-slate-600">Erin — ACL Prehab Case Study</span>
              </nav>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2" />
                Case Study · ACL Injury · Kilmarnock, Ayrshire
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                Erin&apos;s ACL Prehab Journey —{" "}
                <span className="text-[#1e3a8a]">From Barely Walking to Surgery-Ready in Kilmarnock</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                After tearing her ACL, Erin couldn&apos;t walk without a limp and had almost no movement in her knee. With surgery weeks away, she needed a structured prehab programme to restore extension, build quad strength, and get her knee into the best condition possible before going under the knife.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {["ACL Injury", "Prehab", "Knee Rehabilitation", "Quad Strengthening", "Kilmarnock, Ayrshire"].map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Overview */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {[
                { label: "Condition", value: "ACL Tear" },
                { label: "Stage", value: "Pre-Surgery Prehab" },
                { label: "Location", value: "Kilmarnock, Ayrshire" },
              ].map((item) => (
                <FadeIn key={item.label} className="rounded-2xl bg-slate-50 border border-slate-100 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1e3a8a] mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-slate-900">{item.value}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Background */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  The Situation — and Where to <span className="text-[#1e3a8a]">Even Start</span>
                </h2>
                <div className="space-y-5 text-lg text-slate-600 leading-relaxed">
                  <p>
                    Erin sustained an ACL injury and was told she&apos;d need surgery in April. Four weeks after the injury she still had very limited movement — she couldn&apos;t straighten or fully bend the knee, and walking with any kind of normal gait felt out of reach.
                  </p>
                  <p>
                    Like many people facing ACL surgery, Erin knew the operation was coming and knew the recovery would be long — but the gap between injury day and surgery day felt uncertain.
                  </p>
                  <blockquote className="border-l-4 border-[#1e3a8a] pl-5 my-6 italic text-slate-700 text-xl leading-relaxed">
                    &ldquo;I didn&apos;t really know where to start, to be honest. I knew I needed surgery. But before surgery I didn&apos;t know how to move it. I didn&apos;t know how to get the flexibility back or whatnot.&rdquo;
                    <footer className="mt-2 text-base not-italic font-medium text-slate-500">— Erin</footer>
                  </blockquote>
                  <p>
                    This is exactly where prehab physiotherapy in Kilmarnock made a difference: providing a clear, structured programme between injury and operation.
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={150} className="hidden lg:block">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 w-64 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Erin&apos;s starting point</h3>
                  {[
                    "Could barely walk",
                    "Significant limp off crutches",
                    "Minimal knee extension",
                    "Minimal knee flexion",
                    "Surgery 4+ weeks away",
                    "Unsure where to begin",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {point}
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Video 1 — Prehab Session */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                The Prehab Programme — <span className="text-[#1e3a8a]">What Erin Did In Clinic</span>
              </h2>
              <p className="text-lg text-slate-600">
                Jordan walked Erin through a series of targeted exercises designed to restore extension and flexion, activate the quad, and prepare the knee neuromuscularly for surgery. Here&apos;s the session in full.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <video
                  src="/acl-rehab-physio-kilmarnock.mp4"
                  controls
                  playsInline
                  className="w-full aspect-video bg-slate-900"
                  aria-label="ACL prehab physiotherapy session in Kilmarnock — Erin case study"
                />
              </div>
            </FadeIn>

            {/* Exercise breakdown */}
            <div className="mt-12 space-y-8">
              <FadeIn>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Exercises covered in this session</h3>
              </FadeIn>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  {
                    number: "01",
                    title: "Gravity-Assisted Knee Extension & Flexion",
                    desc: "Using gravity as a gentle force to encourage the knee back towards full range — reducing stiffness without overloading the joint.",
                  },
                  {
                    number: "02",
                    title: "Heel Rocks",
                    desc: "Rocking the heel forward and back to use momentum to drive the knee back into extension — a simple but effective early-stage movement drill.",
                  },
                  {
                    number: "03",
                    title: "Inner Range Quad (IRQ)",
                    desc: "Pressing into a pillow and holding an isometric quad contraction — essential for re-establishing quad activation before and after surgery.",
                  },
                  {
                    number: "04",
                    title: "Compex Muscle Stimulation",
                    desc: "Electrical muscle stimulation applied to the quad during straight leg raises and IRQ — the same approach used by professional footballers post-surgery to prevent significant quad atrophy in the first two to three weeks.",
                  },
                  {
                    number: "05",
                    title: "Assisted Terminal Knee Extension (TKE)",
                    desc: "Using a resistance band, Erin bends the knee then controls it back to extension — the quad works hard on the way forward and has to resist the band on the way back, improving both strength and neuromuscular control.",
                  },
                ].map((ex) => (
                  <FadeIn key={ex.number} className="flex gap-4 p-5 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <span className="text-2xl font-black text-[#1e3a8a]/20 shrink-0 leading-none">{ex.number}</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{ex.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{ex.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Erin in her own words + Video 2 */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Erin&apos;s Progress — <span className="text-[#1e3a8a]">In Her Own Words</span>
              </h2>
              <p className="text-lg text-slate-600">
                After completing the prehab programme at our Kilmarnock clinic, Erin shared what had changed — and how she was feeling about surgery.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 mb-12">
                <video
                  src="/case-study-acl-injury-physiotherapy-kilmarnock-ayrshire.mp4"
                  controls
                  playsInline
                  className="w-full aspect-video bg-slate-900"
                  aria-label="Erin talks about her ACL prehab recovery at JT Football Physiotherapy, Kilmarnock"
                />
              </div>
            </FadeIn>

            {/* Pull quotes */}
            <div className="space-y-6">
              {[
                {
                  quote: "Just walking in general — like, I could barely walk at all. I had a really bad limp after I was off the crutches. I can walk pretty normal now. Straightening it, bending it — that's a big thing.",
                  context: "On what had improved",
                },
                {
                  quote: "The exercises I was given — the flexibility — my knee's in the best condition now. Not as it was before, but kind of the best condition it can be going into surgery.",
                  context: "On reaching pre-surgery readiness",
                },
                {
                  quote: "I think psychologically it's gonna be much harder than the physical part. Already I know after surgery it's probably gonna be worse, but the physical part after the injury initially is gonna come back pretty quickly. It'll be tough the first two weeks, but it'll come back in just doing your exercises.",
                  context: "On mindset going into surgery",
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <figure className="rounded-2xl bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 p-6">
                    <blockquote className="text-lg text-slate-800 italic leading-relaxed mb-3">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="text-sm font-semibold text-[#1e3a8a]">
                      Erin — {item.context}
                    </figcaption>
                  </figure>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Key takeaways */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                What This Case Study Shows About <span className="text-[#1e3a8a]">ACL Prehab in Kilmarnock</span>
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  title: "Prehab changes surgical outcomes",
                  desc: "Entering surgery with better range of motion and quad strength is associated with improved post-operative recovery. Erin's prehab was designed specifically to optimise these markers.",
                },
                {
                  title: "Early quad activation is critical",
                  desc: "The quad shuts down rapidly after ACL injury. Inner range quad work and muscle stimulation helps maintain neural drive before surgery — reducing the depth of the post-op 'quad hole'.",
                },
                {
                  title: "You don't have to wait and do nothing",
                  desc: "Many ACL patients sit idle between injury and surgery. That gap is valuable time. Erin used it to restore movement, strengthen the joint, and arrive at surgery in a far better position.",
                },
                {
                  title: "The psychological side is real",
                  desc: "Erin was candid about the mental challenge of ACL rehab. Going into surgery with a plan — not just for the physical side but for your mindset — makes post-op recovery meaningfully easier.",
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 100} className="rounded-xl bg-white border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <svg className="h-5 w-5 text-[#1e3a8a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-8">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Outcomes summary */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Outcomes at a Glance</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Restored near-normal walking pattern — no more limp",
                "Significant improvement in knee extension",
                "Significant improvement in knee flexion",
                "Quad activation restored via IRQ & Compex stimulation",
                "Knee in best possible condition ahead of surgery",
                "Clear, structured plan for post-operative recovery",
              ].map((outcome, i) => (
                <FadeIn key={i} className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                  <svg className="h-5 w-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-slate-700">{outcome}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-t from-[#4C6CD6]/10 to-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Facing an <span className="text-[#1e3a8a]">ACL Injury in Kilmarnock or Ayrshire?</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Whether you&apos;re pre-surgery like Erin or further into your ACL rehabilitation, we can help you build the right programme for where you are right now. Book a free discovery session at our Kilmarnock, Ayrshire clinic — no commitment required.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Your Assessment
                </a>
                <Link
                  href="/services/free-discovery-session"
                  className="rounded-full border border-[#1e3a8a]/30 bg-white px-8 py-4 text-base font-semibold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-slate-50"
                >
                  Free Discovery Session
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                <Link href="/kilmarnock-ayrshire" className="hover:text-[#1e3a8a] underline underline-offset-2">
                  ← Back to Physiotherapy in Kilmarnock, Ayrshire
                </Link>
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
