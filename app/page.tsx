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
  title: "JT Football Physiotherapy | Expert Physio Clinic in Kilmarnock",
  description: "Specialist football physiotherapy and injury clinic in Kilmarnock, Ayrshire. Expert assessment, rehabilitation, and performance coaching for all levels.",
  openGraph: {
    title: "JT Football Physiotherapy | Expert Physio Clinic in Kilmarnock",
    description: "Specialist football physiotherapy and injury clinic in Kilmarnock, Ayrshire. Expert assessment, rehabilitation, and performance coaching for all levels.",
    url: "https://www.jtfootballphysiotherapy.co.uk",
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/20 min-h-screen flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 lg:py-0">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn className="max-w-3xl">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-6 shadow-sm transition-colors hover:bg-blue-100 cursor-default">
                 <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2"></span>
                  Face-to-Face in Kilmarnock, Ayrshire or Online
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6 leading-tight">
                  Expert <span className="text-[#1e3a8a]">Physiotherapy in Kilmarnock</span> for Peak Performance
                </h1>
                <p className="text-xl font-medium text-slate-800 mb-4">
                  Recover faster. Improve your physical health. Stay injury-free.
                </p>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl">
                  Whether you’re dealing with acute pain from a recent injury, or persistent discomfort that won’t go away, we provide expert physiotherapy in Kilmarnock and Ayrshire tailored to you.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Your Appointment
                  </a>
                </div>
                <p className="mt-4 text-xs text-slate-500 uppercase tracking-wider">Kilmarnock Ayrshire Physiotherapy | Physio | Football | Sports Clinic
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

          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/4 opacity-10">
             <img src="/jt-football-physio-logo.svg" alt="" className="w-[800px] h-[800px]" />
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

        {/* About Us & Process */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  About Our <span className="text-[#1e3a8a]">Kilmarnock Physiotherapy</span> Process
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>JT Football Physiotherapy provides specialist physiotherapy and health services for footballers at all levels in Kilmarnock, Ayrshire. We focus on injury recovery and prevention, using football-specific assessment and tailored rehabilitation to help players return stronger and more confident.</p>
                  <p className="font-medium text-slate-900">Our approach is simple: treat the cause, not just the symptoms, so you can stay fit, perform better, and enjoy the game.</p>
                  <div className="flex gap-4 my-6">
                    <div className="flex-1">
                      <Image
                        src="/physiotherapy-kilmarnock-ayrshire-clinic-football.webp"
                        alt="Football injury physiotherapy assessment in Kilmarnock Ayrshire"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02]"
                      />
                    </div>
                    <div className="flex-1">
                      <Image
                        src="/physiotherapy-kilmarnock-ayrshire-clinic-table.webp"
                        alt="Modern physiotherapy clinic treatment room in Kilmarnock"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded-2xl object-cover shadow-md transition-transform duration-500 hover:scale-[1.02]"
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
                Why Choose Our <span className="text-[#1e3a8a]">Physiotherapy & Health Clinic</span> in Kilmarnock
              </h2>
              <p className="text-lg text-slate-600">
                Every person receives personalised care based on their injury, goals and level of play, with treatment focused on recovery, performance and long-term injury prevention.
              </p>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Specialised Football Physiotherapy", desc: "We understand the unique demands on football players in Kilmarnock. Our tailored services help you recover from injuries, reduce pain, and improve performance on and off the pitch." },
                { title: "Personalised Care", desc: "Every player is different — and so is every injury. We deliver individualised treatment plans focused on your goals, whether that's returning to play or enhancing athletic function." },
                { title: "Flexibility to Suit You", desc: "Choose between in-person sessions in Kilmarnock or online consultations, giving you expert physiotherapy and health support no matter where you are." }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 100} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-lg hover:bg-white hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
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
                  <p className="text-slate-600 mb-6 flex-grow">{service.desc}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <Link href={service.href} className="text-sm font-semibold text-slate-500 hover:text-[#1e3a8a] hover:underline">Read More</Link>
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
                  alt="Jordan Templeton JT Football Physiotherapy Kilmarnock Ayrshire Clinic Football Specialist"
                  width={600}
                  height={750}
                  className="w-full h-auto rounded-3xl object-cover shadow-lg"
                 />
              </FadeIn>
              <FadeIn delay={200}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  About Jordan — Lead Physiotherapist & Founder of <span className="text-[#1e3a8a]">JT Football Physiotherapy</span>
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>Jordan Templeton is the founder and driving force behind JT Football Physiotherapy — a specialist physiotherapy service in Kilmarnock dedicated to helping football players and active individuals overcome injury and optimise performance.</p>
                  <p>Frustrated by the limitations of traditional clinic-based treatment, Jordan launched JT Football Physiotherapy to bridge the gap between rehabilitation and real-world sport requirements. His vision is simple: provide tailored, football-specific care that moves beyond symptom relief to address the underlying physical demands of the sport.</p>
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
                { title: "Reduce Injury Risk", desc: "Reduce your chances of getting an injury in-season in Ayrshire with our specialized physiotherapy." },
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

        {/* Areas We Serve */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-4">
                Serving Kilmarnock & Across Ayrshire
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 leading-relaxed mb-10">
                At <strong>JT Football Physiotherapy</strong>, we provide expert <strong>physiotherapy in Kilmarnock</strong> for clients across Ayrshire. While our clinic is based in Kilmarnock, we regularly welcome players and patients from <strong>Irvine, Ayr, Troon, Prestwick, Kilwinning, Galston, Stewarton, and Cumnock</strong>. No matter where you are in Ayrshire, our specialist care is worth the journey.
              </p>
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/ayrshire-landscape.webp"
                  alt="JT Football Physiotherapy clinic serving Kilmarnock and Ayrshire"
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
                Contact Us Now For <span className="text-[#1e3a8a]">Better Health & Pain Relief</span> in Kilmarnock
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Get in touch today to book an assessment or ask a question. Our Free Discovery session in Kilmarnock lets you discuss your injury at no cost. Your recovery in Kilmarnock starts here, with JT Football Physiotherapy.
              </p>
              <div className="flex justify-center">
                <Link
                  href="/contact"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Contact Us Today
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