import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "About Jordan Templeton | JT Football Physiotherapy - Kilmarnock Clinic",
  description: "Meet Jordan Templeton, MSc Physiotherapist. With 7+ years in professional football at Kilmarnock, Hearts, experience across Ayrshire and Kilmarnock. Expert physiotherapy for footballers.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Jordan Templeton | JT Football Physiotherapy - Kilmarnock Clinic",
    description: "Meet Jordan Templeton, MSc Physiotherapist. With 7+ years in professional football at Kilmarnock, Hearts, experience across Ayrshire and Kilmarnock. Expert physiotherapy for footballers.",
    url: "https://www.jtfootballphysiotherapy.co.uk/about",
    images: [
      {
        url: "https://www.jtfootballphysiotherapy.co.uk/jt-football-physiotherapy-jordan-templeton-ayrhsire-kilmarnock-physiotherapy-clinic.webp",
        width: 600,
        height: 750,
        alt: "Jordan Templeton - MSc Physiotherapist at JT Football Physiotherapy Kilmarnock Ayrshire",
      }
    ],
  },
  keywords: ["Jordan Templeton", "physiotherapist", "MSc", "Kilmarnock", "football physio", "Ayrshire physio", "professional physiotherapy", "sports injury specialist", "football rehabilitation", "JT Football Physiotherapy Kilmarnock", "Hearts FC physio", "Kilmarnock FC physio"],
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main>
        <section className="relative border-b border-slate-100 bg-[radial-gradient(at_20%_0%,rgba(0,138,252,0.16)_0%,transparent_60%)] py-16 pb-7" aria-labelledby="jt-about-title">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
             <p className="mb-2.5 inline-block text-xs font-bold uppercase tracking-widest text-blue-600">About Us</p>
            <h1 id="jt-about-title" className="mb-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Football-first physiotherapy in Kilmarnock, built for physical health, pain relief and performance
            </h1>
            <p className="mb-8 max-w-3xl text-lg leading-relaxed text-slate-600">
              JT Football Physiotherapy helps footballers and active people across Ayrshire and Kilmarnock recover from injury, reduce pain,
              restore mobility, and return to sport with confidence — with expert physiotherapy using a practical, evidence-led approach that treats the
              cause, not just the symptoms.
            </p>

            <div className="my-5 flex flex-wrap gap-3" role="group" aria-label="Primary actions">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-6 py-3 text-sm font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
              >
                Book a free discovery call
              </Link>
              <Link 
                href="/blogs" 
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-50 hover:shadow-lg"
              >
                Read our blogs
              </Link>
            </div>

            <ul className="mt-3.5 flex flex-wrap gap-2.5 p-0 list-none" aria-label="Highlights">
              <li className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-2 text-sm text-slate-900">In-person & online</li>
              <li className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-2 text-sm text-slate-900">Football-specific rehab</li>
              <li className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-2 text-sm text-slate-900">Pain & mobility focused Ayrshire Physiotherapy</li>
            </ul>
            </FadeIn>
          </div>
        </section>

        {/* Meet Jordan Section */}
        <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#4C6CD6] to-[#1e3a8a] text-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-center lg:items-start">
              <FadeIn>
                <Image
                  src="/jt-football-physiotherapy-jordan-templeton-ayrhsire-kilmarnock-physiotherapy-clinic.webp"
                  alt="Jordan Templeton MSc Physiotherapist - Professional headshot - JT Football Physiotherapy Kilmarnock Ayrshire clinic specialist"
                  title="Jordan Templeton - Football Physiotherapist in Kilmarnock, Ayrshire"
                  width={500}
                  height={625}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                />
              </FadeIn>
              <FadeIn delay={100}>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-blue-100 mb-3">Meet the Founder</p>
                  <h2 className="text-3xl font-bold text-white mb-4">Jordan Templeton</h2>
                  <p className="text-lg font-semibold text-blue-100 mb-4">MSc Physiotherapist & Founder</p>
                  <div className="space-y-4 text-blue-50 leading-relaxed">
                    <p>
                      With over 7 years of professional experience in elite football, Jordan combines practical expertise from Kilmarnock FC and Hearts of Midlothian FC with evidence-based rehabilitation principles.
                    </p>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">Professional Experience</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>4 years coaching at Kilmarnock FC Academy</li>
                        <li>Academy Physiotherapist at Kilmarnock FC</li>
                        <li>Professional Development Phase Physiotherapist at Hearts of Midlothian FC</li>
                        <li>Current: Full-time Physiotherapist at Kilmarnock FC</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">Qualifications</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li><strong>MSc Physiotherapy (Pre-Registration)</strong> — Glasgow Caledonian University</li>
                        <li><strong>BSc Sport & Exercise Science (First Class)</strong> — University of the West of Scotland</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-6 pb-16 lg:grid-cols-[1.25fr_0.85fr]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            <FadeIn>
            <section className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-labelledby="jt-story-title">
              <h2 id="jt-story-title" className="mb-2.5 text-xl font-bold tracking-tight text-slate-900">Why JT Football Physiotherapy exists</h2>
              <p className="mb-2.5 leading-relaxed text-slate-600">
                Traditional “clinic-only” rehab can miss the real demands of football — sprinting, cutting, tackling, repeated
                loading, and returning to match intensity. JT Football Physiotherapy in Kilmarnock, Ayrshire was created to bridge that gap with
                physiotherapy-led health assessment and step-by-step rehab that carries over to the pitch.
              </p>
              <p className="mb-0 leading-relaxed text-slate-600">
                We welcome all activity levels too — from football players to light joggers and seasonal athletes — with the
                same goal: reduce pain, improve mobility, rebuild confidence, and help you move better for the long term.
              </p>
            </section>
            </FadeIn>

            <FadeIn>
            <section className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-labelledby="jt-approach-title">
              <h2 id="jt-approach-title" className="mb-2.5 text-xl font-bold tracking-tight text-slate-900">Our physiotherapy approach to health</h2>

              <div className="mt-3 grid gap-3">
                <article className="rounded-xl border border-slate-200 bg-white p-3" role="listitem">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">1) Assess the root cause</h3>
                  <p className="m-0 text-slate-600">
                    We look beyond the painful area to understand movement patterns, strength deficits, mobility limitations,
                    and the training load that’s keeping the issue going.
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3" role="listitem">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">2) Build a pain-informed plan</h3>
                  <p className="m-0 text-slate-600">
                    You’ll get a clear rehab roadmap from our physiotherapy team in Ayrshire: what to do, what to avoid, and how to progress safely without constant
                    flare-ups.
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3" role="listitem">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">3) Restore mobility, strength & control</h3>
                  <p className="m-0 text-slate-600">
                    Rehab at our Kilmarnock physiotherapy clinic isn’t just “stretching”. We rebuild mobility where needed, strength where it counts, and control
                    for real-world football actions with our physiotherapy.
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3" role="listitem">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">4) Return to play with confidence</h3>
                  <p className="m-0 text-slate-600">
                    We progress you from rehab to performance: running, sprint work, change of direction, and sport-specific
                    return-to-play testing where appropriate.
                  </p>
                </article>
              </div>
            </section>
            </FadeIn>

            <FadeIn>
            <section className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-labelledby="jt-services-title">
              <h2 id="jt-services-title" className="mb-2.5 text-xl font-bold tracking-tight text-slate-900">Football Physio Services in <span className="text-blue-600">Kilmarnock & Ayrshire</span></h2>
              <p className="mb-4 leading-relaxed text-slate-600">
                Whether you're a competitive footballer, active player, or dealing with pain that's affecting your sport, we provide tailored physiotherapy assessment and rehabilitation.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">Injuries we specialise in</h3>
                  <ul className="m-0 list-disc pl-4 leading-relaxed text-slate-600 text-sm">
                    <li className="my-0.5">Ankle sprains & instability</li>
                    <li className="my-0.5">Hamstring pain & strains</li>
                    <li className="my-0.5">Knee ligament & ACL injuries</li>
                    <li className="my-0.5">Hip & groin pain</li>
                    <li className="my-0.5">Lower back pain</li>
                    <li className="my-0.5">Calf, foot & leg pain</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="mb-1.5 text-base font-bold text-slate-900">Who we help</h3>
                  <ul className="m-0 list-disc pl-4 leading-relaxed text-slate-600 text-sm">
                    <li className="my-0.5">Footballers at all levels</li>
                    <li className="my-0.5">Runners, gym-goers & athletes</li>
                    <li className="my-0.5">Active adults managing pain</li>
                    <li className="my-0.5">Return-to-play rehabilitation</li>
                    <li className="my-0.5">Injury prevention & performance</li>
                    <li className="my-0.5">Online consultations available</li>
                  </ul>
                </div>
              </div>
            </section>
            </FadeIn>

            <FadeIn>
            <section className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm" aria-labelledby="jt-cta-title">
              <h2 id="jt-cta-title" className="mb-2.5 text-xl font-bold tracking-tight text-slate-900">Ready to reduce pain and move better?</h2>
              <p className="mb-3 leading-relaxed text-slate-600">
                Based in <strong>Kilmarnock</strong>, serving Ayrshire and surrounding areas with expert physio. If you’re dealing with pain,
                discomfort, or a recurring injury, book a quick discovery call and we’ll guide the next step.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
                >
                  Book a free Kilmarnock physiotherapy discovery call
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-50 hover:shadow-lg"
                >
                  Back to home
                </Link>
              </div>
            </section>
            </FadeIn>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="flex flex-col gap-5" aria-label="Frequently asked questions">
            <FadeIn>
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm" aria-labelledby="jt-faq-title">
              <h2 id="jt-faq-title" className="mb-1 text-xl font-bold tracking-tight text-slate-900">FAQ</h2>
              <p className="mb-4 text-sm text-slate-500">
                Quick answers to common questions about pain, mobility, rehab, and return to play.
              </p>

              <div className="grid gap-2.5">
                {/* FAQ Items */}
                {[
                  { q: "What should I do if my pain hasn’t improved with rest?", a: "If pain hasn’t settled after rest, it often means something is still irritating the area (load, movement pattern, strength deficit, or limited mobility). A physiotherapy assessment helps identify the driver and gives you a clear plan to progress without guesswork." },
                  { q: "How long does pain relief usually take with physiotherapy?", a: "Timelines vary depending on the injury, your training load, and how long symptoms have been present. Some people feel improvement quickly, while persistent pain usually takes a structured programme over weeks. The goal is steady progress you can maintain." },
                  { q: "Can physiotherapy improve long-term health and pain?", a: "Yes. Physiotherapy can help you manage persistent pain by improving movement, building strength and tolerance, and restoring confidence. We focus on practical changes that reduce flare-ups and improve everyday function and sport performance." },
                  { q: "Is it normal to feel pain during rehabilitation exercises?", a: "Mild discomfort can be normal, but rehab shouldn’t significantly increase your pain or leave you worse afterwards. We guide exercise choice and progressions so the load is appropriate and symptoms remain manageable." },
                  { q: "Should I stop training completely if I’m in pain?", a: "Not always. Often we can adjust intensity, volume, or specific movements so you keep training safely. Stopping everything can sometimes slow recovery — the key is choosing the right type and amount of load." },
                  { q: "When should I see a physiotherapist about my physical health?", a: "If pain is limiting your movement, affecting sport or sleep, recurring regularly, or not improving with a short period of rest, it’s worth getting assessed. Early guidance can prevent a small problem becoming a longer-term issue." },
                  { q: "Do you help with mobility as well as pain relief?", a: "Yes. Mobility restrictions are often part of why pain persists or injuries keep returning. We improve mobility where needed, but always connect it to strength, control, and sport-specific movement." },
                  { q: "What happens in the first appointment?", a: "We’ll talk through your injury story, what triggers pain, what helps, and your goals. Then a physiotherapy health assessment helps identify the likely cause and create a plan with clear next steps." },
                  { q: "Can you help if I’m not a footballer?", a: "Absolutely. While we specialise in football, we work with people of all activity levels — from casual joggers to gym-goers and active adults — using the same structured, practical approach." },
                  { q: "Do you offer online physiotherapy sessions?", a: "Yes. Online sessions can work well for guidance, exercise prescription, progression, and return-to-play planning — especially when you can’t attend in person." },
                  { q: "How many sessions will I need?", a: "It depends on the injury and your goals. Some issues improve with a single consultation and a clear plan, while others benefit from a structured rehab block. You’ll get honest guidance after assessment." },
                  { q: "What makes football-specific physiotherapy different?", a: "Football places unique demands on the body — acceleration, deceleration, cutting, kicking, and repeated high loads. We tailor rehab to match those demands so your return to play is realistic, not theoretical." },
                  { q: "Can physiotherapy help prevent injuries as well as treat them?", a: "Yes. Prevention is a huge part of performance. We identify risk factors (strength imbalances, mobility restrictions, load spikes) and build a plan that reduces your chances of repeat injuries." },
                  { q: "What's the cost of physiotherapy sessions in Kilmarnock?", a: "Session costs vary depending on whether it's a consultation, assessment, or follow-up treatment. We aim to keep prices competitive and fair for all levels of footballer and active individuals. Contact us directly for pricing details and package options." },
                  { q: "How long are physiotherapy appointments?", a: "Initial assessments typically last 45-60 minutes so we can thoroughly understand your injury and history. Follow-up sessions are usually 30-45 minutes focused on treatment, exercises, and progression. We'll confirm timing when you book." },
                  { q: "Do you offer a free consultation?", a: "Yes! We offer a free discovery session in Kilmarnock where you can discuss your injury, goals, and treatment options without commitment. It's a great way to meet the team and understand our approach." },
                  { q: "What's your cancellation and rescheduling policy?", a: "We require at least 24 hours notice for cancellations or rescheduling. This allows us to offer the appointment to other patients. If you need to cancel, simply get in touch as soon as possible." },
                  { q: "Do you treat injuries other than sports and football-related?", a: "Yes. While we specialise in football, we work with people across all activity levels and injury types — runners, gym-goers, active adults, and anyone managing pain or mobility issues. Our principles apply to any physical challenge." },
                  { q: "Will I need imaging, X-rays, or scans before treatment?", a: "Not always. A good assessment often gives us enough information to begin treatment. If we believe imaging is necessary to rule out serious issues or confirm a diagnosis, we'll advise and refer you appropriately. Imaging isn't always needed to start rehab safely." }
                ].map((item, i) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white p-3 open:bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900 outline-none">
                      {item.q}
                      <span className="ml-3 text-lg font-normal text-blue-600 group-open:hidden">+</span>
                      <span className="ml-3 text-lg font-normal text-blue-600 hidden group-open:block">–</span>
                    </summary>
                    <div className="mt-2.5 border-t border-slate-100 pt-2.5 text-slate-600">
                      <p className="m-0">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-200 pt-3">
                <Link
                  href="/faq"
                  className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                >
                  View the full physiotherapy FAQ page for more information
                </Link>
              </div>
            </section>
            </FadeIn>
          </aside>
        </div>

        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What should I do if my pain hasn’t improved with rest?",
                  "acceptedAnswer": { "@type": "Answer", "text": "If pain hasn’t settled after rest, it often means something is still irritating the area (load, movement pattern, strength deficit, or limited mobility). A physiotherapy assessment helps identify the driver and gives you a clear plan to progress without guesswork." }
                },
                {
                  "@type": "Question",
                  "name": "How long does pain relief usually take with physiotherapy?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Timelines vary depending on the injury, your training load, and how long symptoms have been present. Some people feel improvement quickly, while persistent pain usually takes a structured programme over weeks. The goal is steady progress you can maintain." }
                },
                {
                  "@type": "Question",
                  "name": "Can physiotherapy improve long-term health and pain?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes. Physiotherapy can help you manage persistent pain by improving movement, building strength and tolerance, and restoring confidence. We focus on practical changes that reduce flare-ups and improve everyday function and sport performance." }
                },
                {
                  "@type": "Question",
                  "name": "Is it normal to feel pain during rehabilitation exercises?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Mild discomfort can be normal, but rehab shouldn’t significantly increase your pain or leave you worse afterwards. We guide exercise choice and progressions so the load is appropriate and symptoms remain manageable." }
                },
                {
                  "@type": "Question",
                  "name": "Should I stop training completely if I’m in pain?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Not always. Often we can adjust intensity, volume, or specific movements so you keep training safely. Stopping everything can sometimes slow recovery — the key is choosing the right type and amount of load." }
                },
                {
                  "@type": "Question",
                  "name": "When should I see a physiotherapist about my physical health?",
                  "acceptedAnswer": { "@type": "Answer", "text": "If pain is limiting your movement, affecting sport or sleep, recurring regularly, or not improving with a short period of rest, it’s worth getting assessed. Early guidance can prevent a small problem becoming a longer-term issue." }
                },
                {
                  "@type": "Question",
                  "name": "Do you help with mobility as well as pain relief?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes. Mobility restrictions are often part of why pain persists or injuries keep returning. We improve mobility where needed, but always connect it to strength, control, and sport-specific movement." }
                },
                {
                  "@type": "Question",
                  "name": "What happens in the first appointment?",
                  "acceptedAnswer": { "@type": "Answer", "text": "We’ll talk through your injury story, what triggers pain, what helps, and your goals. Then a physiotherapy health assessment helps identify the likely cause and create a plan with clear next steps." }
                },
                {
                  "@type": "Question",
                  "name": "Can you help if I’m not a footballer?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. While we specialise in football, we work with people of all activity levels — from casual joggers to gym-goers and active adults — using the same structured, practical approach." }
                },
                {
                  "@type": "Question",
                  "name": "Do you offer online physiotherapy sessions?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes. Online sessions can work well for guidance, exercise prescription, progression, and return-to-play planning — especially when you can’t attend in person." }
                },
                {
                  "@type": "Question",
                  "name": "How many sessions will I need?",
                  "acceptedAnswer": { "@type": "Answer", "text": "It depends on the injury and your goals. Some issues improve with a single consultation and a clear plan, while others benefit from a structured rehab block. You’ll get honest guidance after assessment." }
                },
                {
                  "@type": "Question",
                  "name": "What makes football-specific physiotherapy different?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Football places unique demands on the body — acceleration, deceleration, cutting, kicking, and repeated high loads. We tailor rehab to match those demands so your return to play is realistic, not theoretical." }
                },
                {
                  "@type": "Question",
                  "name": "Can physiotherapy help prevent injuries as well as treat them?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes. Prevention is a huge part of performance. We identify risk factors (strength imbalances, mobility restrictions, load spikes) and build a plan that reduces your chances of repeat injuries." }
                }
              ]
            })
          }}
        />

        {/* Person Schema - Jordan Templeton */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Jordan Templeton",
              "image": "https://www.jtfootballphysiotherapy.co.uk/jt-football-physiotherapy-jordan-templeton-ayrhsire-kilmarnock-physiotherapy-clinic.webp",
              "jobTitle": "MSc Physiotherapist, Founder & Lead Physiotherapist",
              "email": "contact@jtfootballphysiotherapy.co.uk",
              "telephone": "+44",
              "url": "https://www.jtfootballphysiotherapy.co.uk/about",
              "sameAs": [
                "https://www.linkedin.com/in/jordan-templeton-53530a137/"
              ],
              "affiliation": {
                "@type": "Organization",
                "name": "JT Football Physiotherapy",
                "url": "https://www.jtfootballphysiotherapy.co.uk"
              },
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Kilmarnock, Ayrshire",
                "addressCountry": "GB"
              },
              "description": "Football physiotherapist with 7+ years of professional experience in elite football. Specialist in football-specific injury assessment, rehabilitation, and return-to-play protocols.",
              "educationalCredential": [
                {
                  "@type": "EducationalOccupationalCredential",
                  "credentialCategory": "degree",
                  "name": "MSc Physiotherapy (Pre-Registration)",
                  "educationalLevel": "Master's degree",
                  "issuingOrganization": {
                    "@type": "EducationalOrganization",
                    "name": "Glasgow Caledonian University"
                  },
                  "dateIssued": "2022"
                },
                {
                  "@type": "EducationalOccupationalCredential",
                  "credentialCategory": "degree",
                  "name": "BSc Sport & Exercise Science (First Class Honours)",
                  "educationalLevel": "Bachelor's degree",
                  "issuingOrganization": {
                    "@type": "EducationalOrganization",
                    "name": "University of the West of Scotland"
                  },
                  "dateIssued": "2018"
                }
              ]
            })
          }}
        />
      </main>


      <Footer />
    </div>
  );
}