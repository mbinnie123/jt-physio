import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FadeIn } from "./FadeIn";
import { stringify } from 'flatted';
import { Reviews } from "./Reviews";
import { wixClient } from "./lib/wix";
import { BlogCarousel } from "./BlogCarousel";
import { HeroVideoButton } from "./HeroVideoButton";

type BlogPost = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  firstPublishedDate?: string | number | Date | null;
  minutesToRead?: number | null;
  featured?: boolean | null;
  pinned?: boolean | null;
  media?: any;
  coverImage?: any;
};

function resolveWixMediaUrl(input: unknown): string | null {
  if (!input) return null;

  if (typeof input === "string") {
    if (input.startsWith("http://") || input.startsWith("https://")) return input;
    const v1Match = input.match(/wix:(image|vector):\/\/v1\/([^/]+)(?:\/[^#?]+)?/i);
    if (v1Match?.[2]) return `https://static.wixstatic.com/media/${v1Match[2]}`;
    if (/^[0-9a-f]{6,}_.+~mv2\./i.test(input)) {
      return `https://static.wixstatic.com/media/${input}`;
    }
    return null;
  }

  const asAny = input as any;
  const url =
    asAny?.url ||
    asAny?.file?.url ||
    asAny?.image?.url ||
    asAny?.src?.url ||
    asAny?.src?.id ||
    asAny?.src;

  return resolveWixMediaUrl(url);
}

function getFeaturedImageUrl(post: BlogPost): string | null {
  return (
    resolveWixMediaUrl((post as any).coverImage) ||
    resolveWixMediaUrl((post as any).media?.image) ||
    resolveWixMediaUrl((post as any).media?.coverImage) ||
    resolveWixMediaUrl((post as any).media?.mainMedia) ||
    resolveWixMediaUrl((post as any).media?.image?.url) ||
    resolveWixMediaUrl((post as any).media?.image?.id) ||
    resolveWixMediaUrl((post as any).media?.wixMedia?.image) ||
    null
  );
}

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  title: "Physiotherapy Ayrshire | Jordan Physiotherapy | Kilmarnock & Across Ayrshire",
  description: "Expert physiotherapy across Ayrshire — based in Kilmarnock with mobile appointments available throughout North, East & South Ayrshire. Sports injury, rehabilitation, and performance care tailored to you.",
  keywords: [
    "physiotherapy Ayrshire",
    "physio Kilmarnock",
    "physiotherapist Ayrshire",
    "sports physio Ayrshire",
    "mobile physiotherapy Ayrshire",
    "injury rehabilitation Ayrshire",
    "physiotherapy Troon",
    "physiotherapy Irvine",
    "physiotherapy Prestwick",
    "physiotherapy Ayr",
    "Jordan Physiotherapy Ayrshire",
  ],
  openGraph: {
    title: "Physiotherapy Ayrshire | Jordan Physiotherapy | Kilmarnock & Across Ayrshire",
    description: "Expert physiotherapy across Ayrshire — based in Kilmarnock with mobile appointments available throughout North, East & South Ayrshire. Sports injury, rehabilitation, and performance care tailored to you.",
    url: "https://www.jordanphysiotherapyayrshire.co.uk",
  },
};

export const revalidate = 0;

export default async function HomePage() {
  let blogPosts: BlogPost[] = [];
  const hasWixEnv = !!process.env.WIX_API_KEY &&
    !!process.env.WIX_SITE_ID &&
    !!process.env.WIX_ACCOUNT_ID;

  if (hasWixEnv) {
    try {
      const postsAny = (wixClient as any).posts;
      const FieldEnum = postsAny?.PostFieldField || postsAny?.Field;
      const wanted = FieldEnum ? (["MEDIA", "URL"].filter((k) => FieldEnum[k]).map((k) => FieldEnum[k]) as any[]) : [];
      const query = wixClient.posts.queryPosts();
      let response: any;
      if (wanted.length) {
        try {
          response = await (query as any).find({ fields: wanted });
        } catch {
          response = await (query as any).find({ fieldsets: wanted });
        }
      } else {
        response = await query.find();
      }
      let allPosts = (response?.items || []) as BlogPost[];
      allPosts.sort((a, b) => {
        const ap = a.pinned ? 1 : 0;
        const bp = b.pinned ? 1 : 0;
        if (bp !== ap) return bp - ap;
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (bf !== af) return bf - af;
        const ad = a.firstPublishedDate ? new Date(a.firstPublishedDate).getTime() : 0;
        const bd = b.firstPublishedDate ? new Date(b.firstPublishedDate).getTime() : 0;
        return bd - ad;
      });
      blogPosts = allPosts.slice(0, 9);
    } catch (err: any) {
      // Wix errors often hide us
      console.error("Failed to fetch posts from Wix:", stringify({
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        status: err?.status ?? err?.statusCode,
        code: err?.code,
        details: err?.details,
        data: err?.data,
      }));

      // Also log the raw error (often includes non-enumerable info)
      console.error(err);
    }
  } else {
    // Optional: keep this as a silent fallback in production
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Wix blog fetch skipped: missing WIX_API_KEY/WIX_SITE_ID/WIX_ACCOUNT_ID in .env.local"
      );
    }
  }

  const carouselPosts = blogPosts.map((post) => ({
    _id: post._id,
    title: post.title || "",
    excerpt: post.excerpt || "",
    slug: post.slug || "",
    date: post.firstPublishedDate
      ? new Date(post.firstPublishedDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      : "",
    minutesToRead: post.minutesToRead || 0,
    imageUrl: getFeaturedImageUrl(post),
    pinned: post.pinned || false,
    featured: post.featured || false,
  }));

  const ayrshireAreas = [
    "North Ayrshire", "South Ayrshire", "East Ayrshire",
    "Irvine", "Ayr", "Kilmarnock", "Troon", "Prestwick",
    "Saltcoats", "Ardrossan", "Stevenston", "Kilwinning",
    "Largs", "West Kilbride", "Beith", "Dalry",
    "Stewarton", "Galston", "Darvel", "Newmilns",
    "Mauchline", "Cumnock", "Auchinleck", "Maybole",
    "Girvan", "Alloway", "Dunlop", "Fenwick",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden h-[calc(100vh-64px)] flex items-center">
          {/* Background image — sharp, full cover, no blur/scale */}
          <Image
            src="/ayrshire-landscape.webp"
            alt=""
            fill
            className="absolute inset-0 object-cover object-center"
            priority
            fetchPriority="high"
            aria-hidden="true"
          />
          {/* Gradient overlay — white fade from left, brand blue tint from right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-[#1e3a8a]/30" />
          {/* Top & bottom fade to white to blend cleanly with header/stats bar */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/60 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center justify-center mt-10 lg:mt-10">
              <FadeIn className="max-w-3xl mx-auto lg:mx-0">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-[#1e3a8a] mb-4 sm:mb-4 shadow-sm transition-colors hover:bg-blue-100 cursor-default">
                  <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2"></span>
                  Face-to-Face in Kilmarnock, Ayrshire or Online
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold tracking-tight text-slate-900 mb-6 lg:mb-4 leading-tight">
                  Expert <span className="text-[#1e3a8a]">Physiotherapy Across Ayrshire</span> for Peak Performance
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-lg font-medium text-slate-800 mb-4">
                  Recover faster. Improve your physical health. Stay injury-free.
                </p>
                <p className="text-base sm:text-base md:text-lg lg:text-base text-slate-600 mb-6 lg:mb-4 leading-relaxed max-w-3xl">
                  Whether you’re dealing with acute pain from a recent injury, or persistent discomfort that won’t go away, we provide expert physiotherapy in Kilmarnock and Ayrshire tailored to you.
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-[#1e3a8a] px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Your Appointment
                  </a>
                  <HeroVideoButton />
                </div>
                <p className="mt-3 sm:mt-4 text-xs text-slate-500 uppercase tracking-wider">Kilmarnock Ayrshire Physiotherapy | Physio | Football | Sports Clinic
                </p>
              </FadeIn>
              <FadeIn delay={200} className="relative hidden lg:block">
                <Image
                  src="/jt-football-physio-logo.svg"
                  alt="JT Football Physiotherapy Logo"
                  width={500}
                  height={500}
                  className="h-auto w-64 lg:w-full max-w-md mx-auto"
                  priority
                  fetchPriority="high"
                />
              </FadeIn>
            </div>
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
                  <div className="text-sm font-medium text-blue-200 uppercase tracking-wider">{stat.label}</div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Ayrshire Areas Marquee */}
        <section className="bg-slate-900 py-3 overflow-hidden" aria-hidden="true">
          <div className="marquee-wrapper w-full overflow-hidden">
            <ul className="marquee-track list-none m-0 p-0">
              {[...Array(8)].map((_, copy) =>
                ayrshireAreas.map((area) => (
                  <li key={`${copy}-${area}`} className="inline-flex items-center gap-3 px-4 py-1 text-sm font-medium text-slate-300 whitespace-nowrap">
                    <span className="h-1 w-1 rounded-full bg-[#4C6CD6] shrink-0" />
                    {area}
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* About Us & Process */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  Physiotherapy That <span className="text-[#1e3a8a]">Comes to You</span> — Across All of Ayrshire
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>Jordan Templeton offers specialist physiotherapy for footballers and active individuals across the whole of Ayrshire. Based in Kilmarnock, Jordan provides <strong>mobile appointments that come directly to you</strong> — whether you&apos;re in Irvine, Ayr, Troon, Stewarton, or anywhere else across North, South, and East Ayrshire.</p>
                  <p className="font-medium text-slate-900">Our approach is simple: treat the cause, not just the symptoms, so you can stay fit, perform better, and get back to doing what you love — wherever you are in Ayrshire.</p>
                  <div className="flex gap-4 my-6">
                    <div className="flex-1 h-[400px] relative">
                      <Image
                        src="/physiotherapy-clinic-kilmarnock-1.webp"
                        alt="Football injury physiotherapy assessment in Kilmarnock, Ayrshire with client performing movement analysis while physiotherapist observes and takes notes"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02] border-4 border-[#1e3a8a]"
                        priority={false}
                      />
                    </div>
                    <div className="flex-1 h-[400px] relative">
                      <Image
                        src="/physiotherapy-clinic-kilmarnock-2.webp"
                        alt="Modern physiotherapy clinic treatment room in Kilmarnock, Ayrshire with client performing rehabilitation exercises under physiotherapist guidance"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02] border-4 border-[#1e3a8a]"
                        priority={false}
                      />
                    </div>
                  </div>

                  <p>Check out our FAQ on the <Link href="/about" className="text-[#1e3a8a] hover:underline">About</Link> page to learn how our straightforward physiotherapy and health care in Kilmarnock Ayrshire supports pain relief and recovery — from football players to light joggers and seasonal athletes.</p>
                </div>
              </FadeIn>
              <FadeIn delay={200} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-xl mb-4 text-slate-900">Common Questions We Answer</h3>
                <ul className="space-y-3">
                  {[
                    "What should I do if my pain hasn’t improved with rest?",
                    "How long does pain relief usually take with physiotherapy?",
                    "Can physiotherapy improve my physical health and persistent pain?",
                    "Is it normal to feel pain during rehabilitation exercises?",
                    "Should I stop training completely if I’m in pain?",
                    "When should I see a physiotherapist about my health?"
                  ].map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 transition-colors duration-200 hover:text-slate-900">
                      <svg className="h-6 w-6 text-[#1e3a8a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-[#4C6CD6]/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Why Patients Across <span className="text-[#1e3a8a]">Ayrshire</span> Choose Jordan
              </h2>
              <p className="text-lg text-slate-600">
                From Irvine to Ayr, Troon to Cumnock — Jordan brings expert physiotherapy to you. Every person gets a personalised plan built around their injury, their goals, and where they want to be.
              </p>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Specialised Football Physiotherapy", desc: "We understand the unique demands on football players in Kilmarnock. Our tailored services help you recover from injuries, reduce pain, and improve performance on and off the pitch." },
                { title: "Personalised Care", desc: "Every player is different — and so is every injury. We deliver individualised treatment plans focused on your goals, whether that's returning to play or enhancing athletic function." },
                { title: "Mobile Appointments Across Ayrshire", desc: "Jordan offers mobile appointments that come to you — covering all of North, South, and East Ayrshire. Can't make it to the Kilmarnock clinic? We come to you." }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 100} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-lg hover:bg-white hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-slate-50 py-24 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Frequently Asked <span className="text-[#1e3a8a]">Questions</span>
              </h2>
              <p className="text-lg text-slate-600">
                Quick answers to common questions about physiotherapy, injury treatment, and recovery in Kilmarnock and Ayrshire.
              </p>
            </FadeIn>
            <div className="grid gap-3 max-w-4xl">
              {[
                { q: "What should I do if my pain hasn't improved with rest?", a: "If pain hasn't settled after rest, it often means something is still irritating the area — whether that's load, movement patterns, strength deficits, or limited mobility. A physiotherapy assessment helps us identify the root driver and gives you a clear, evidence-led plan to progress without guesswork. Rest alone often isn't enough; we need to address what's keeping the problem going." },
                { q: "How long does pain relief usually take with physiotherapy?", a: "Timelines vary based on several factors: your injury type, how long you've had symptoms, your training load, and how well you can follow the programme. Some people feel improvement within 1-2 weeks, while persistent pain typically improves over 4-8 weeks with consistent effort. The goal isn't just quick relief — it's steady progress you can maintain long-term." },
                { q: "Can physiotherapy improve my long-term health and persistent pain?", a: "Absolutely. Physiotherapy helps you manage persistent pain by improving movement quality, building practical strength and tolerance, and restoring confidence in your body. We focus on changes you can maintain — better movement patterns, smarter training load, and self-management strategies — so you reduce flare-ups and improve both everyday function and sport performance." },
                { q: "Is it normal to feel some discomfort during rehabilitation exercises?", a: "Mild, manageable discomfort can be normal as you challenge your body in new ways. However, rehab shouldn't significantly increase your pain or leave you feeling worse after a session. We carefully guide exercise selection and progression so the load is appropriate for your current state and your symptoms stay manageable." },
                { q: "Should I stop training completely if I'm experiencing pain?", a: "Not necessarily. Often we can modify your training — adjust intensity, reduce volume, change specific movements — so you keep training safely while protecting the injured area. Complete rest can sometimes slow recovery and deconditioning. The key is smart load management: doing the right amount of the right activity at the right time." },
                { q: "When should I see a physiotherapist about my health?", a: "Book an assessment if pain is limiting your movement or sport, affecting your sleep, recurring regularly, or hasn't improved with rest after a few days. Early guidance from a physiotherapist can prevent a small issue becoming a longer-term problem. Many players find a quick discovery session clarifies whether they need ongoing treatment or just guidance." },
                { q: "Do you help with mobility and flexibility as well as pain relief?", a: "Yes, mobility is central to our work. Mobility restrictions are often part of why pain persists or injuries keep returning. We improve mobility where needed, but always connect it to strength, control, and sport-specific movement so you're not just more flexible — you're stronger and more resilient too." },
                { q: "What happens during a first physiotherapy appointment?", a: "We start by understanding your injury story: how it happened, what makes it better or worse, how it's affecting your daily life and sport. Then we perform a thorough physical assessment to identify movement restrictions, strength imbalances, and the likely root cause. You'll leave with a clear plan and honest timeline for recovery." },
                { q: "Do you only work with footballers or can others benefit?", a: "While we specialise in football, we work with people of all activity levels — runners, gym-goers, seasonal athletes, and active adults managing pain. Our approach is the same: identify the root cause, build a practical recovery plan, and support you back to doing what you love." },
                { q: "Do you offer a free consultation?", a: <>Yes! We offer a <Link href="/services/free-discovery-session" className="text-[#1e3a8a] hover:underline font-semibold">free discovery session</Link> in Kilmarnock where you can discuss your injury, goals, and treatment options without commitment. It's a great way to meet the team and understand our approach.</> }
              ].map((item, i) => (
                <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 open:bg-white">
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
              <p className="text-slate-600 mb-4">Have more questions? <Link href="/about" className="font-semibold text-[#1e3a8a] hover:underline">View our full FAQ on the About page</Link></p>
            </FadeIn>
          </div>
        </section>

        {/* Services */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-16 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Our <span className="text-[#1e3a8a]">Physiotherapy & Health Services</span> in Ayrshire
              </h2>
              <p className="text-lg text-slate-600">
                Comprehensive physiotherapy services in Kilmarnock and Ayrshire designed specifically for your physical health.
              </p>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Free Discovery Session",
                  desc: "Not sure where to start? Book a free discovery session in Kilmarnock to discuss your injury, goals, and the best next steps — with no pressure.",
                  href: "/services/free-discovery-session",
                  descWithLink: (
                    <>Not sure where to start? Book a <Link href="/services/free-discovery-session" className="text-[#1e3a8a] hover:underline font-semibold">free discovery session</Link> in Kilmarnock to discuss your injury, goals, and the best next steps — with no pressure.</>
                  ),
                  icon: "M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" // Chat Bubble
                },
                {
                  title: "Injury Assessment & Diagnosis",
                  desc: "We start with a comprehensive evaluation to understand your injury, movement patterns, and root causes to deliver effective treatment.",
                  href: "/services/injury-assessment",
                  icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" // Magnifying Glass
                },
                {
                  title: "Rehabilitation & Return to Play",
                  desc: "We guide you through progressive rehabilitation, from pain relief and mobility to strength, conditioning, and safe return-to-play.",
                  href: "/services/rehabilitation",
                  icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" // Lightning Bolt
                },
                {
                  title: "Prevention & Recovery Massage",
                  desc: "It's not just about fixing injuries — it's about preventing them and elevating performance through movement optimisation and recovery.",
                  href: "/services/sports-massage",
                  icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" // Heart
                }
              ].map((service, i) => (
                <FadeIn key={i} delay={i * 100} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 hover:border-blue-100">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    <Link href={service.href} className="hover:text-[#1e3a8a] transition-colors">{service.title}</Link>
                  </h3>
                  <p className="text-slate-600 mb-6 flex-grow">{(service as any).descWithLink || service.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <Link href={service.href} className="text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] hover:underline mr-4">Learn more about {service.title}</Link>
                    <a href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service" className="font-semibold text-[#1e3a8a] hover:underline">Book Now &rarr;</a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* About Jordan */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn className="mx-auto max-w-md lg:max-w-none">
                <Image
                  src="/jordan-templeton-jt-football-physiotherapy-kilmarnock-ayrshire-clinic.jpg"
                  alt="Jordan Templeton MSc Physiotherapist - JT Football Physiotherapy Kilmarnock Ayrshire - Professional Football Physio Specialist"
                  title="Jordan Templeton - Football Physiotherapist in Kilmarnock, Ayrshire"
                  width={600}
                  height={750}
                  className="w-full h-auto rounded-3xl object-cover shadow-lg"
                />
              </FadeIn>
              <FadeIn delay={200}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  Meet Jordan — <span className="text-[#1e3a8a]">Your Guide Through Recovery</span> Across Ayrshire
                </h2>
                <div className="space-y-4 text-base text-slate-600">
                  <p><strong>Jordan Templeton</strong> is a highly experienced physiotherapist with over seven years of professional experience in elite football. He is the founder and lead physiotherapist at JT Football Physiotherapy — offering specialist, mobile physiotherapy across all of Ayrshire, as well as face-to-face sessions at the Kilmarnock clinic. Whether you&apos;re a footballer recovering from injury or an active individual dealing with persistent pain, Jordan builds the plan around you — and can bring it directly to your door.</p>

                  <p><strong>Professional Experience:</strong> Jordan spent four years as a coach at <a href="https://kilmarnockfc.co.uk/academy/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Kilmarnock FC Academy</a>, where he developed youth players across key stages of their athlete pathway. He then progressed into physiotherapy, working as an academy physiotherapist at <a href="https://kilmarnockfc.co.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Kilmarnock FC</a> before moving to <a href="https://www.heartsfc.co.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Hearts of Midlothian FC</a> as the Professional Development Phase Physiotherapist, supporting the academy, B team, and first team with injury management, rehabilitation, and return-to-play planning in a high-performance environment. He currently works full-time as a physiotherapist for <a href="https://kilmarnockfc.co.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Kilmarnock FC</a>.</p>

                  <p><strong>Education & Qualifications:</strong> Jordan holds an MSc in Physiotherapy (Pre-Registration) from <a href="https://www.gcu.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Glasgow Caledonian University</a> (2022) and graduated with First Class Honours in Sport and Exercise Science from the <a href="https://www.uws.ac.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">University of the West of Scotland</a> (2018), combining strong academic achievement with extensive practical experience in elite professional football.</p>
                  <p><strong>Professional Accreditation:</strong> Jordan is accredited with the <a href="https://footballmedicineperformance.org/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Football Medicine &amp; Performance Association</a> and is a Chartered Physiotherapist with the <a href="https://www.csp.org.uk/" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline transition-colors">Chartered Society of Physiotherapy</a>, reflecting a commitment to the highest clinical and professional standards.</p>

                  <p>Frustrated by the limitations of traditional clinic-based treatment, Jordan launched JT Football Physiotherapy to bridge the gap between rehabilitation and real-world sport requirements. His vision is simple: provide tailored, football-specific, evidence-led care that moves beyond symptom relief to address the underlying physical demands of the sport.</p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-gradient-to-r from-[#1e3a8a] via-[#4C6CD6] to-[#1e3a8a] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Benefits of Football-Specific Physiotherapy for Better Physical and Mental Health in Ayrshire</h2>
              <p className="text-lg text-slate-100">JT Football Physiotherapy in Kilmarnock, Ayrshire, can help you to achieve the following:</p>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Reduce Injury Risk", desc: "Reduce your chances of getting an injury in-season in Ayrshire with our specialised physiotherapy." },
                { title: "Faster Recovery", desc: "Targeted treatment accelerates healing and helps you return stronger to the pitch, with football physiotherapy in Kilmarnock. " },
                { title: "Performance Boost", desc: "Enhance strength, agility, and resilience specific to the game in Ayrshire, improving your performance." },
                { title: "Ongoing Support", desc: "Education and guidance from our Kilmarnock physiotherapy and health team to maintain fitness long-term." }
              ].map((benefit, i) => (
                <FadeIn key={i} delay={i * 100} className="bg-white/10 p-6 rounded-xl border border-white/10 text-center transition-all duration-300 hover:bg-white/20 hover:scale-105">
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-100">{benefit.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <Reviews />

        {/* Erin Case Study Teaser */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="mb-12 text-center">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-4">
                <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2" />
                Real Patient · Real Results · Kilmarnock, Ayrshire
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                See What&apos;s Possible — <span className="text-[#1e3a8a]">Erin&apos;s ACL Prehab Story</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Erin tore her ACL and couldn&apos;t walk without a limp. With surgery weeks away, she didn&apos;t know where to start. This is how structured prehab physiotherapy helped her arrive at surgery in the best condition possible.
              </p>
            </FadeIn>
            <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
              <FadeIn>
                <div className="relative rounded-2xl overflow-hidden shadow-xl mx-auto" style={{ aspectRatio: "9/16", maxHeight: "520px", maxWidth: "300px" }}>
                  <video
                    src="/case-study-acl-injury-physiotherapy-kilmarnock-ayrshire.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-label="Erin&apos;s ACL prehab case study — JT Football Physiotherapy Ayrshire"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-6 left-4 right-4">
                    <Link
                      href="/case-studies/erin-acl-kilmarnock"
                      className="block text-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1e3a8a] shadow-lg hover:bg-blue-50 transition-colors"
                    >
                      Read Full Case Study →
                    </Link>
                  </div>
                </div>
              </FadeIn>
              <FadeIn delay={150} className="space-y-5">
                <div className="space-y-3">
                  {[
                    { before: "Couldn&apos;t walk without a limp", after: "Near-normal walking pattern restored" },
                    { before: "Almost no knee extension or flexion", after: "Full pre-surgery range of motion achieved" },
                    { before: "Unsure where to even begin", after: "Clear plan, structured programme, surgery-ready" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-0.5">Before</p>
                        <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: item.before }} />
                      </div>
                      <div className="w-px bg-slate-200 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-0.5">After</p>
                        <p className="text-sm font-medium text-slate-800" dangerouslySetInnerHTML={{ __html: item.after }} />
                      </div>
                    </div>
                  ))}
                </div>
                <figure className="border-l-4 border-[#1e3a8a] pl-5">
                  <blockquote className="italic text-slate-700 text-lg leading-relaxed">
                    &ldquo;My knee&apos;s in the best condition now — not as it was before, but kind of the best condition it can be going into surgery.&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-sm font-medium text-slate-500">— Erin, ACL Prehab Patient, Kilmarnock</figcaption>
                </figure>
                <Link
                  href="/case-studies/erin-acl-kilmarnock"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition-all"
                >
                  Read the Full Case Study
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Blogs */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Our Blogs</h2>
            </FadeIn>
            <div className="max-w-7xl mx-auto">
              <BlogCarousel posts={carouselPosts} />
            </div>
            {blogPosts.length > 0 && (
              <FadeIn className="mt-12 text-center">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-[#1e3a8a] transition-all"
                >
                  View All Posts
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </FadeIn>
            )}
          </div>
        </section>

        {/* Areas We Cover */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                Mobile Physiotherapy <span className="text-[#1e3a8a]">All Across Ayrshire</span>
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 leading-relaxed">
                Jordan doesn&apos;t just work from a clinic. He brings expert physiotherapy directly to patients across <strong>North, South, and East Ayrshire</strong> — so geography is never a barrier to getting the care you need.
              </p>
            </FadeIn>
            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {[
                { region: "North Ayrshire", areas: ["Irvine", "Saltcoats", "Ardrossan", "Stevenston", "Kilwinning", "Largs", "West Kilbride", "Beith", "Dalry"] },
                { region: "East Ayrshire", areas: ["Kilmarnock", "Stewarton", "Galston", "Darvel", "Newmilns", "Mauchline", "Cumnock", "Auchinleck", "Fenwick"] },
                { region: "South Ayrshire", areas: ["Ayr", "Prestwick", "Troon", "Maybole", "Girvan", "Alloway", "Symington", "Crosshill"] },
              ].map((region) => (
                <FadeIn key={region.region} className="rounded-2xl bg-slate-50 border border-slate-100 p-6">
                  <h3 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider mb-4">{region.region}</h3>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {region.areas.map((area) => (
                      <li key={area} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4C6CD6] shrink-0" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
              ))}
            </div>
            <FadeIn className="rounded-2xl overflow-hidden shadow-lg">
              <div className="relative">
                <Image
                  src="/ayrshire-landscape.webp"
                  alt="Ayrshire landscape — physiotherapy available across North, South and East Ayrshire"
                  width={1200}
                  height={480}
                  className="w-full h-56 sm:h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/85 via-[#1e3a8a]/50 to-transparent flex items-center">
                  <div className="px-8 max-w-lg">
                    <p className="text-white font-bold text-xl mb-2">Can&apos;t make it to the clinic?</p>
                    <p className="text-blue-100 text-sm mb-4">Jordan offers mobile appointments across all of Ayrshire. We come to you.</p>
                    <a
                      href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                      className="inline-block rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#1e3a8a] hover:bg-blue-50 transition-colors"
                    >
                      Book a Mobile Appointment
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-gradient-to-t from-[#4C6CD6]/10 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                Ready to <span className="text-[#1e3a8a]">Start Your Recovery</span> Across Ayrshire?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Whether you&apos;re in Kilmarnock, Irvine, Ayr, or anywhere across Ayrshire — Jordan can help. Book a free discovery session to discuss your injury, your goals, and the best path forward. No pressure, no commitment.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Your Appointment
                </a>
                <Link
                  href="/services/free-discovery-session"
                  className="rounded-full border border-[#1e3a8a]/30 bg-white px-8 py-4 text-lg font-semibold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:bg-slate-50"
                >
                  Free Discovery Session
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