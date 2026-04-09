import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";
import { Reviews } from "../Reviews";

export const metadata: Metadata = {
  title: "Physiotherapy in Kilmarnock, Ayrshire | JT Football Physiotherapy",
  description:
    "Expert physiotherapy in Kilmarnock, Ayrshire. Specialist injury assessment, rehabilitation, sports massage and football physio from Jordan Templeton MSc. Book online today.",
  alternates: {
    canonical: "/physiotherapy-kilmarnock-ayrshire",
  },
  openGraph: {
    title: "Physiotherapy in Kilmarnock, Ayrshire | JT Football Physiotherapy",
    description:
      "Expert physiotherapy in Kilmarnock, Ayrshire. Specialist injury assessment, rehabilitation, sports massage and football physio from Jordan Templeton MSc. Book online today.",
    url: "https://www.jordanphysiotherapyayrshire.co.uk/physiotherapy-kilmarnock-ayrshire",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physiotherapy in Kilmarnock, Ayrshire | JT Football Physiotherapy",
    description:
      "Expert physiotherapy in Kilmarnock, Ayrshire. Specialist injury assessment, rehabilitation, sports massage and football physio from Jordan Templeton MSc.",
  },
};

export const revalidate = 86400;

const schemaMarkup = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://www.jordanphysiotherapyayrshire.co.uk/#business",
      "name": "Jordan Physiotherapy Ayrshire",
      "alternateName": "JT Football Physiotherapy",
      "image": "https://www.jordanphysiotherapyayrshire.co.uk/jt-football-physio-logo.svg",
      "description":
        "Expert physiotherapy clinic in Kilmarnock, Ayrshire, specialising in injury assessment, rehabilitation, sports massage and performance coaching for all levels.",
      "telephone": "+447841430205",
      "url": "https://www.jordanphysiotherapyayrshire.co.uk",
      "hasMap": "https://www.google.com/maps/search/?api=1&query=JT+Football+Physiotherapy,+5+Bunting+Pl,+Kilmarnock+KA1+3LE",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "5 Bunting Place",
        "addressLocality": "Kilmarnock",
        "addressRegion": "Ayrshire",
        "postalCode": "KA1 3LE",
        "addressCountry": "GB",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 55.6116,
        "longitude": -4.4959,
      },
      "areaServed": [
        "Kilmarnock",
        "Ayrshire",
        "Irvine",
        "Ayr",
        "Troon",
        "Prestwick",
        "Kilwinning",
        "Galston",
        "Stewarton",
        "Cumnock",
      ],
      "priceRange": "£50–£150",
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday", "opens": "17:00", "closes": "21:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday", "opens": "17:00", "closes": "21:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "17:00", "closes": "21:00" },
      ],
      "sameAs": [
        "https://www.instagram.com/jtfootballphysiotherapy",
        "https://www.facebook.com/jtfootballphysiotherapy",
      ],
    },
    {
      "@type": "Service",
      "name": "Physiotherapy in Kilmarnock, Ayrshire",
      "description":
        "Expert physiotherapy services in Kilmarnock, Ayrshire — including injury assessment, rehabilitation, sports massage, and football-specific physiotherapy.",
      "provider": {
        "@id": "https://www.jordanphysiotherapyayrshire.co.uk",
      },
      "areaServed": "Kilmarnock, Ayrshire",
      "availableLanguage": "en",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Where is JT Football Physiotherapy based in Kilmarnock, Ayrshire?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We are based in Kilmarnock, Ayrshire and offer both face-to-face sessions at our clinic and online consultations. We welcome patients from across Ayrshire including Irvine, Ayr, Troon, Prestwick, Kilwinning, Galston, Stewarton, and Cumnock.",
          },
        },
        {
          "@type": "Question",
          "name": "What physiotherapy services does JT Football Physiotherapy offer in Kilmarnock?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer a full range of physiotherapy services in Kilmarnock, Ayrshire — including injury assessment, rehabilitation and return to play, sports massage, performance coaching, and a free discovery session. Our services are tailored to footballers and active individuals of all levels.",
          },
        },
        {
          "@type": "Question",
          "name": "Do you offer a free physiotherapy consultation in Kilmarnock?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We offer a free discovery session at our Kilmarnock clinic where you can discuss your injury, goals, and treatment options with no commitment. It's the easiest way to get started with physiotherapy in Kilmarnock, Ayrshire.",
          },
        },
        {
          "@type": "Question",
          "name": "How long does physiotherapy take to work in Kilmarnock, Ayrshire?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Timelines vary depending on the injury, its history, and how consistently you engage with your programme. Many patients in Kilmarnock and Ayrshire notice improvement within 1–2 weeks for acute injuries, and within 4–8 weeks for persistent pain. We give you an honest, realistic timeline from the first session.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I book physiotherapy in Kilmarnock online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. You can book physiotherapy appointments at our Kilmarnock, Ayrshire clinic online through our booking system. We also offer online consultations if you can't visit us in person.",
          },
        },
      ],
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
          "name": "Physiotherapy in Kilmarnock, Ayrshire",
          "item": "https://www.jordanphysiotherapyayrshire.co.uk/physiotherapy-kilmarnock-ayrshire",
        },
      ],
    },
  ],
};

export default function KilmarnockAyrshirePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/20 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <FadeIn className="max-w-3xl mx-auto lg:mx-0">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-5 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2"></span>
                  Face-to-Face in Kilmarnock, Ayrshire or Online
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                  Expert{" "}
                  <span className="text-[#1e3a8a]">
                    Physiotherapy in Kilmarnock, Ayrshire
                  </span>{" "}
                  for Peak Performance
                </h1>
                <p className="text-lg sm:text-xl font-medium text-slate-800 mb-4">
                  Recover faster. Move better. Stay injury-free.
                </p>
                <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                  Whether you&apos;re dealing with a recent football injury or persistent pain that won&apos;t settle, our specialist physiotherapy clinic in{" "}
                  <strong>Kilmarnock, Ayrshire</strong> delivers evidence-led assessment and rehabilitation tailored to you.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Your Appointment
                  </a>
                  <Link
                    href="/services/free-discovery-session"
                    className="rounded-full border border-[#1e3a8a]/30 bg-white px-8 py-4 text-base font-semibold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
                  >
                    Free Discovery Session
                  </Link>
                </div>
                <p className="mt-4 text-xs text-slate-400 uppercase tracking-wider">
                  Kilmarnock, Ayrshire · Physiotherapy · Football Physio · Sports Clinic
                </p>
              </FadeIn>
              <FadeIn delay={200} className="relative hidden lg:block">
                <Image
                  src="/jt-football-physio-logo.svg"
                  alt="JT Football Physiotherapy Kilmarnock Ayrshire"
                  width={500}
                  height={500}
                  className="h-auto w-full max-w-md mx-auto"
                  priority
                  fetchPriority="high"
                />
              </FadeIn>
            </div>
          </div>
          <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 opacity-10">
            <img
              src="/jt-football-physio-logo.svg"
              alt=""
              className="w-[800px] h-[800px]"
              fetchPriority="high"
            />
          </div>
        </section>

        {/* Trust Stats */}
        <section className="bg-[#1e3a8a] py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center divide-x divide-white/10">
              {[
                { label: "Years Experience", value: "4+" },
                { label: "Patients Helped", value: "100+" },
                { label: "Google Rating", value: "5.0 ★" },
                { label: "Dedicated Care", value: "100%" },
              ].map((stat, i) => (
                <FadeIn key={i} delay={i * 100} className="px-4">
                  <div className="text-3xl font-bold sm:text-4xl mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-blue-200 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Areas Marquee */}
        <section className="bg-white border-b border-slate-100 py-4 overflow-hidden">
          <p className="sr-only">
            Physiotherapy serving Kilmarnock neighbourhoods: Town Centre, New Farm Loch, Onthank,
            Bellfield, Grange, Beansburn, Riccarton, Shortlees, Bonnyton, Kirkstyle, Loanhead,
            Hurlford, Crookedholm, Kilmaurs, Fenwick, Stewarton, Galston, Crosshouse, Irvine, Ayr,
            Troon, Prestwick, Kilwinning, Cumnock.
          </p>
          <div className="marquee-wrapper w-full overflow-hidden" aria-hidden="true">
            <ul className="marquee-track">
              {[...Array(8)].map((_, copy) =>
                [
                  "Town Centre",
                  "New Farm Loch",
                  "Onthank",
                  "Bellfield",
                  "Grange",
                  "Beansburn",
                  "Riccarton",
                  "Shortlees",
                  "Bonnyton",
                  "Kirkstyle",
                  "Loanhead",
                  "Hurlford",
                  "Crookedholm",
                  "Kilmaurs",
                  "Fenwick",
                  "Stewarton",
                  "Galston",
                  "Crosshouse",
                  "Irvine",
                  "Ayr",
                  "Troon",
                  "Prestwick",
                  "Kilwinning",
                  "Cumnock",
                ].map((area) => (
                  <li
                    key={`${copy}-${area}`}
                    className="flex items-center gap-3 px-6 text-sm font-medium text-slate-500 whitespace-nowrap"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a] shrink-0" />
                    {area}
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* What We Do */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  Physiotherapy & Health Services in{" "}
                  <span className="text-[#1e3a8a]">Kilmarnock, Ayrshire</span>
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>
                    <strong>JT Football Physiotherapy</strong> is a specialist physiotherapy and health clinic based in <strong>Kilmarnock, Ayrshire</strong>. We provide football-specific injury assessment, evidence-led rehabilitation, and performance support for players and active individuals across Ayrshire.
                  </p>
                  <p>
                    Our approach is straightforward: identify the root cause of your problem, build a clear plan, and support you back to full fitness. We treat the cause — not just the symptoms — so you can stay fit, perform better, and get back to doing what you love.
                  </p>
                  <div className="flex gap-4 my-6">
                    <div className="flex-1 h-[360px] relative">
                      <Image
                        src="/physiotherapy-clinic-kilmarnock-1.webp"
                        alt="Physiotherapy assessment in Kilmarnock, Ayrshire — movement analysis at JT Football Physiotherapy clinic"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02] border-4 border-[#1e3a8a]"
                      />
                    </div>
                    <div className="flex-1 h-[360px] relative">
                      <Image
                        src="/physiotherapy-clinic-kilmarnock-2.webp"
                        alt="Rehabilitation session at physiotherapy clinic in Kilmarnock, Ayrshire — JT Football Physiotherapy"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02] border-4 border-[#1e3a8a]"
                      />
                    </div>
                  </div>
                  <p>
                    We welcome patients from <strong>Kilmarnock</strong> and across <strong>Ayrshire</strong> — including Irvine, Ayr, Troon, Prestwick, Kilwinning, Galston, Stewarton, and Cumnock. Both face-to-face appointments and online consultations are available. Learn more on our{" "}
                    <Link href="/about" className="text-[#1e3a8a] hover:underline">
                      About page
                    </Link>
                    .
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={200} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-xl mb-4 text-slate-900">
                  Questions we regularly answer for patients in Kilmarnock & Ayrshire
                </h3>
                <ul className="space-y-3">
                  {[
                    "My pain hasn't improved with rest — what should I do?",
                    "How long will physiotherapy take in Kilmarnock?",
                    "Can physio help with persistent, long-term pain?",
                    "Should I stop playing football while I'm injured?",
                    "What happens during a first physiotherapy assessment?",
                    "When should I see a physiotherapist near me in Ayrshire?",
                  ].map((q, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-slate-600 transition-colors duration-200 hover:text-slate-900"
                    >
                      <svg
                        className="h-6 w-6 text-[#1e3a8a] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-gradient-to-b from-slate-50 to-white py-24 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Our{" "}
                <span className="text-[#1e3a8a]">Physiotherapy Services</span>{" "}
                in Kilmarnock, Ayrshire
              </h2>
              <p className="text-lg text-slate-600">
                Comprehensive physiotherapy services in Kilmarnock and Ayrshire, designed to address pain, restore movement, and get you back to sport.
              </p>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Free Discovery Session",
                  desc: (
                    <>
                      Not sure where to start? Book a{" "}
                      <Link
                        href="/services/free-discovery-session"
                        className="text-[#1e3a8a] hover:underline font-semibold"
                      >
                        free discovery session
                      </Link>{" "}
                      at our Kilmarnock clinic to discuss your injury and goals with no pressure.
                    </>
                  ),
                  href: "/services/free-discovery-session",
                  icon: "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z",
                },
                {
                  title: "Injury Assessment & Diagnosis",
                  desc: "A thorough evaluation of your injury, movement patterns, and root causes — so every treatment decision is well-informed.",
                  href: "/services/injury-assessment",
                  icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
                },
                {
                  title: "Rehabilitation & Return to Play",
                  desc: "Progressive rehab from pain relief and mobility through to strength, conditioning, and a confident return to football and sport.",
                  href: "/services/rehabilitation",
                  icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
                },
                {
                  title: "Sports Massage & Recovery",
                  desc: "Targeted massage therapy to reduce injury risk, support recovery, and enhance physical performance for footballers and active adults in Ayrshire.",
                  href: "/services/sports-massage",
                  icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
                },
              ].map((service, i) => (
                <FadeIn
                  key={i}
                  delay={i * 100}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 hover:border-blue-100"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={service.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    <Link
                      href={service.href}
                      className="hover:text-[#1e3a8a] transition-colors"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 mb-6 flex-grow">{service.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <Link
                      href={service.href}
                      className="text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] hover:underline mr-4"
                    >
                      Learn more
                    </Link>
                    <a
                      href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                      className="font-semibold text-[#1e3a8a] hover:underline"
                    >
                      Book Now &rarr;
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Why Choose Our{" "}
                <span className="text-[#1e3a8a]">Kilmarnock, Ayrshire</span>{" "}
                Physiotherapy Clinic
              </h2>
              <p className="text-lg text-slate-600">
                Every patient receives personalised care based on their injury, goals, and activity level — delivered by a physiotherapist with real professional football experience.
              </p>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Football-Specific Expertise",
                  desc: "Jordan Templeton has worked at Kilmarnock FC and Hearts FC at professional level. That depth of football knowledge shapes every assessment and rehab plan we deliver in Kilmarnock, Ayrshire.",
                },
                {
                  title: "Personalised Care, Every Session",
                  desc: "No generic plans. Every patient in Kilmarnock and Ayrshire receives an individually tailored assessment and a realistic, step-by-step path to recovery based on their unique goals.",
                },
                {
                  title: "Flexible — In-Person or Online",
                  desc: "Choose face-to-face physiotherapy at our Kilmarnock clinic or online consultations. Expert care is available to patients across Ayrshire and beyond.",
                },
                {
                  title: "Root-Cause Approach",
                  desc: "We don't just treat symptoms. We identify the underlying driver of your pain or limitation and address it directly — so problems don't keep coming back.",
                },
                {
                  title: "Clear Communication",
                  desc: "We explain exactly what is wrong, what treatment involves, and what you can realistically expect — so you're always confident in your recovery plan.",
                },
                {
                  title: "Trusted by Ayrshire Athletes",
                  desc: "Patients from Kilmarnock, Irvine, Ayr, Troon, and across Ayrshire trust us to help them recover from injury and perform at their best.",
                },
              ].map((item, i) => (
                <FadeIn
                  key={i}
                  delay={i * 100}
                  className="bg-slate-50 p-8 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-lg hover:bg-white hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* About Jordan */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn className="mx-auto max-w-md lg:max-w-none">
                <Image
                  src="/jordan-templeton-jt-football-physiotherapy-kilmarnock-ayrshire-clinic.jpg"
                  alt="Jordan Templeton MSc Physiotherapist — JT Football Physiotherapy Kilmarnock, Ayrshire"
                  title="Jordan Templeton — Physiotherapist in Kilmarnock, Ayrshire"
                  width={600}
                  height={750}
                  className="w-full h-auto rounded-3xl object-cover shadow-lg"
                />
              </FadeIn>
              <FadeIn delay={200}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  About Jordan — Lead Physiotherapist at{" "}
                  <span className="text-[#1e3a8a]">JT Football Physiotherapy, Kilmarnock</span>
                </h2>
                <div className="space-y-4 text-base text-slate-600">
                  <p>
                    <strong>Jordan Templeton</strong> is a highly experienced football physiotherapist and the founder of JT Football Physiotherapy in <strong>Kilmarnock, Ayrshire</strong>. With over seven years of professional experience in elite football, Jordan delivers specialist physiotherapy that bridges the gap between clinical rehabilitation and real sporting demands.
                  </p>
                  <p>
                    <strong>Professional Experience:</strong> Jordan spent four years as a coach at{" "}
                    <a
                      href="https://kilmarnockfc.co.uk/academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Kilmarnock FC Academy
                    </a>
                    , before progressing into physiotherapy roles at{" "}
                    <a
                      href="https://kilmarnockfc.co.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Kilmarnock FC
                    </a>{" "}
                    and then{" "}
                    <a
                      href="https://www.heartsfc.co.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Hearts of Midlothian FC
                    </a>{" "}
                    as Professional Development Phase Physiotherapist. He currently works full-time at{" "}
                    <a
                      href="https://kilmarnockfc.co.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Kilmarnock FC
                    </a>
                    .
                  </p>
                  <p>
                    <strong>Qualifications:</strong> Jordan holds an MSc in Physiotherapy (Pre-Registration) from{" "}
                    <a
                      href="https://www.gcu.ac.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Glasgow Caledonian University
                    </a>{" "}
                    and a First Class Honours degree in Sport and Exercise Science from the{" "}
                    <a
                      href="https://www.uws.ac.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      University of the West of Scotland
                    </a>
                    .
                  </p>
                  <p>
                    <strong>Professional Accreditation:</strong> Jordan is accredited with the{" "}
                    <a
                      href="https://footballmedicineperformance.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Football Medicine &amp; Performance Association
                    </a>{" "}
                    and is a Chartered Physiotherapist with the{" "}
                    <a
                      href="https://www.csp.org.uk/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e3a8a] hover:underline"
                    >
                      Chartered Society of Physiotherapy
                    </a>
                    .
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-gradient-to-r from-[#1e3a8a] via-[#4C6CD6] to-[#1e3a8a] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Benefits of Physiotherapy in Kilmarnock, Ayrshire
              </h2>
              <p className="text-lg text-slate-100">
                What JT Football Physiotherapy in Kilmarnock, Ayrshire can help you achieve:
              </p>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Reduce Injury Risk",
                  desc: "Lower your chances of getting injured in-season with targeted physiotherapy and prevention programmes in Kilmarnock.",
                },
                {
                  title: "Faster Recovery",
                  desc: "Accelerate healing with expert, evidence-based treatment at our Kilmarnock, Ayrshire clinic and return stronger to the pitch.",
                },
                {
                  title: "Performance Boost",
                  desc: "Improve strength, agility, and sport-specific resilience with physiotherapy coaching in Kilmarnock and Ayrshire.",
                },
                {
                  title: "Ongoing Ayrshire Support",
                  desc: "Stay fit long-term with education, self-management strategies, and expert guidance from your Kilmarnock physiotherapy team.",
                },
              ].map((benefit, i) => (
                <FadeIn
                  key={i}
                  delay={i * 100}
                  className="bg-white/10 p-6 rounded-xl border border-white/10 text-center transition-all duration-300 hover:bg-white/20 hover:scale-105"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-100">{benefit.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 py-24 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Frequently Asked{" "}
                <span className="text-[#1e3a8a]">Questions</span>
              </h2>
              <p className="text-lg text-slate-600">
                Common questions about physiotherapy in Kilmarnock, Ayrshire.
              </p>
            </FadeIn>
            <div className="grid gap-3 max-w-4xl">
              {[
                {
                  q: "Where is JT Football Physiotherapy based in Kilmarnock, Ayrshire?",
                  a: "We are based in Kilmarnock, Ayrshire and offer both face-to-face appointments at our clinic and online consultations. We welcome patients from across Ayrshire, including Irvine, Ayr, Troon, Prestwick, Kilwinning, Galston, Stewarton, and Cumnock.",
                },
                {
                  q: "What physiotherapy services do you offer in Kilmarnock?",
                  a: "We offer a full range of physiotherapy services in Kilmarnock and Ayrshire: injury assessment, rehabilitation and return to play, sports massage, performance coaching, and a free no-commitment discovery session. Our services are tailored to footballers and active individuals of all levels.",
                },
                {
                  q: "Do you offer a free physiotherapy consultation in Kilmarnock?",
                  a: (
                    <>
                      Yes. We offer a{" "}
                      <Link
                        href="/services/free-discovery-session"
                        className="text-[#1e3a8a] hover:underline font-semibold"
                      >
                        free discovery session
                      </Link>{" "}
                      at our Kilmarnock clinic where you can discuss your injury, goals, and treatment options with no commitment. It&apos;s the easiest way to get started with physiotherapy in Kilmarnock, Ayrshire.
                    </>
                  ),
                },
                {
                  q: "How long does physiotherapy take to work in Kilmarnock, Ayrshire?",
                  a: "Timelines vary depending on your injury type, history, and consistency with your programme. Many patients notice improvement within 1–2 weeks for acute injuries and within 4–8 weeks for persistent pain. We give you an honest, realistic timeline from your first session — no guesswork.",
                },
                {
                  q: "Can I book physiotherapy in Kilmarnock online?",
                  a: "Yes. You can book physiotherapy appointments at our Kilmarnock, Ayrshire clinic online through our booking system. Online consultations are also available if you can't attend in person.",
                },
                {
                  q: "Do you only treat footballers, or can anyone book physiotherapy in Ayrshire?",
                  a: "While we specialise in football, we work with people of all activity levels — runners, gym-goers, seasonal athletes, and active adults. If you're in pain or recovering from injury in Kilmarnock or Ayrshire and want expert physiotherapy, we can help.",
                },
                {
                  q: "What should I expect at my first physiotherapy appointment in Kilmarnock?",
                  a: "Your first appointment starts with a thorough conversation about your injury history and goals, followed by a physical assessment to identify movement restrictions, strength imbalances, and root causes. You'll leave with a clear diagnosis, a step-by-step treatment plan, and an honest timeline for recovery.",
                },
                {
                  q: "Should I stop playing football if I'm in pain?",
                  a: "Not necessarily. We often modify your training load — adjusting intensity, volume, and specific movements — so you can continue safely while protecting the injured area. Complete rest can sometimes slow recovery. The key is smart load management: the right activity, at the right amount, at the right time.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-slate-200 bg-white p-4 open:bg-white"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900 outline-none">
                    {item.q}
                    <span className="ml-3 text-lg font-normal text-[#1e3a8a] group-open:hidden">+</span>
                    <span className="ml-3 text-lg font-normal text-[#1e3a8a] hidden group-open:block">–</span>
                  </summary>
                  <div className="mt-2.5 border-t border-slate-100 pt-2.5 text-slate-600">
                    <p className="m-0 text-sm">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
            <FadeIn className="mt-8 text-center">
              <p className="text-slate-600 mb-4">
                Have more questions?{" "}
                <Link
                  href="/about"
                  className="font-semibold text-[#1e3a8a] hover:underline"
                >
                  View our full FAQ on the About page
                </Link>
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Reviews */}
        <Reviews />

        {/* Case Study — Erin */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-4">
              <p className="text-[#1e3a8a] font-semibold tracking-wide uppercase text-sm mb-2">
                Real Patient · Real Results · Kilmarnock, Ayrshire
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Case Study — <span className="text-[#1e3a8a]">Erin&apos;s ACL Prehab Journey</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl">
                Erin tore her ACL and couldn&apos;t walk without a limp. With surgery weeks away, she came to our Kilmarnock clinic for prehab — and left with her knee in the best possible condition for the operation.
              </p>
            </FadeIn>
            <div className="grid lg:grid-cols-2 gap-10 items-start mt-10">
              {/* Video — vertical, autoplay, overlay CTA */}
              <FadeIn>
                <Link href="/case-studies/erin-acl-kilmarnock" className="group relative block mx-auto w-full max-w-xs rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                  <video
                    src="/case-study-acl-injury-physiotherapy-kilmarnock-ayrshire.mp4"
                    className="w-full aspect-[9/16] bg-slate-900 object-cover"
                    playsInline
                    autoPlay
                    muted
                    loop
                    aria-label="ACL prehab session at JT Football Physiotherapy Kilmarnock — Erin case study"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Overlay content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
                      Case Study · ACL Prehab
                    </span>
                    <p className="text-white font-bold text-base leading-snug mb-4">
                      See how Erin got her knee surgery&#8209;ready in Kilmarnock
                    </p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 group-hover:bg-[#1e3a8a] group-hover:text-white group-hover:shadow-xl group-hover:-translate-y-0.5">
                      Read Full Case Study
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </FadeIn>

              {/* Key points + CTA */}
              <FadeIn delay={150} className="flex flex-col justify-between h-full">
                <div className="space-y-5">
                  {[
                    {
                      heading: "Couldn't walk without a limp",
                      body: "After her ACL injury, Erin was on crutches and struggled to walk normally. Within weeks of her prehab programme, she was moving almost normally again.",
                    },
                    {
                      heading: "Prehab gets the knee surgery-ready",
                      body: "\"The exercises I was given — the flexibility — my knee's in the best condition now. Not as it was before, but kind of the best condition it can be going into surgery.\" — Erin",
                    },
                    {
                      heading: "Quad restoration was key",
                      body: "Jordan used inner range quad work, straight leg raises, and a Compex muscle stimulator to fight quad inhibition — the same technique used in elite professional football.",
                    },
                    {
                      heading: "Going in with a clear plan",
                      body: "Erin arrived at surgery knowing exactly what the post-op process looked like. That clarity — knowing where to start and how to build back — made the psychological challenge far more manageable.",
                    },
                  ].map((point, i) => (
                    <div key={i} className="flex gap-3">
                      <svg className="h-5 w-5 text-[#1e3a8a] shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm mb-0.5">{point.heading}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{point.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-blue-800 hover:-translate-y-0.5"
                  >
                    Book an Assessment
                  </a>
                  <Link
                    href="/case-studies/erin-acl-kilmarnock"
                    className="inline-flex items-center gap-2 rounded-full border border-[#1e3a8a]/30 bg-white px-6 py-3 text-sm font-semibold text-[#1e3a8a] transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
                  >
                    Read Full Case Study
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Areas We Serve */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-4">
                Physiotherapy in Kilmarnock, Ayrshire — Who We Serve
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 leading-relaxed mb-10">
                Our clinic is based in <strong>Kilmarnock, Ayrshire</strong>. We regularly see patients from <strong>Irvine, Ayr, Troon, Prestwick, Kilwinning, Galston, Stewarton, and Cumnock</strong>. Whether you&apos;re a competitive footballer or an active adult managing pain, expert physiotherapy in Kilmarnock, Ayrshire is worth the journey.
              </p>
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/ayrshire-landscape.webp"
                  alt="JT Football Physiotherapy serving Kilmarnock and Ayrshire"
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-gradient-to-t from-[#4C6CD6]/10 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                Start Your Recovery Today with{" "}
                <span className="text-[#1e3a8a]">
                  Physiotherapy in Kilmarnock, Ayrshire
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Book an assessment or get in touch to ask a question. Our free discovery session in <strong>Kilmarnock, Ayrshire</strong> lets you meet the team and discuss your injury at no cost. Your recovery starts here.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Your Appointment
                </a>
                <Link
                  href="/contact"
                  className="rounded-full border border-[#1e3a8a]/30 bg-white px-10 py-4 text-lg font-bold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-slate-50 hover:-translate-y-0.5"
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
