import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FadeIn } from "./FadeIn";
import { stringify } from 'flatted';
import { Reviews } from "./Reviews";
import { wixClient } from "./lib/wix";

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
    canonical: "https://www.jtfootballphysiotherapy.co.uk",
  },
};

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
      blogPosts = allPosts.slice(0, 2);
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
                  Recover faster. Perform better. Stay injury-free.
                </p>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-3xl">
                  Whether you’re dealing with acute pain from a recent injury, or persistent discomfort that won’t go away, we provide expert physiotherapy in Kilmarnock tailored to you.
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
                <img
                  src="/jt-football-physio-logo.svg"
                  alt="JT Football Physiotherapy Logo"
                  width={500}
                  height={500}
                  className="h-auto w-64 lg:w-full max-w-md mx-auto"
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
                { label: "Years Experience", value: "3+" },
                { label: "Patients Helped", value: "400+" },
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
                  About Our <span className="text-[#1e3a8a]">Kilmarnock Physio</span> Process
                </h2>
                <div className="space-y-4 text-lg text-slate-600">
                  <p>JT Football Physiotherapy provides specialist physiotherapy for footballers at all levels in Kilmarnock, Ayrshire. We focus on injury recovery and prevention, using football-specific assessment and tailored rehabilitation to help players return stronger and more confident.</p>
                  <p className="font-medium text-slate-900">Our approach is simple: treat the cause, not just the symptoms, so you can stay fit, perform better, and enjoy the game.</p>
                  <p>Check out our FAQ on the About page to learn how our physiotherapy approach supports pain relief and recovery — from football players to light joggers and seasonal athletes.</p>
                </div>
              </FadeIn>
              <FadeIn delay={200} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-xl mb-4 text-slate-900">Common Questions We Answer</h3>
                <ul className="space-y-3">
                  {[
                    "What should I do if my pain hasn’t improved with rest?",
                    "How long does pain relief usually take with physiotherapy?",
                    "Can physiotherapy help with long-term or persistent pain?",
                    "Is it normal to feel pain during rehabilitation exercises?",
                    "Should I stop training completely if I’m in pain?",
                    "When should I see a physiotherapist about pain?"
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
                Why Choose Our <span className="text-[#1e3a8a]">Physiotherapy Clinic</span> in Kilmarnock
              </h2>
              <p className="text-lg text-slate-600">
                Every person receives personalised care based on their injury, goals and level of play, with treatment focused on recovery, performance and long-term injury prevention.
              </p>
            </FadeIn>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Specialised Football Physiotherapy", desc: "We understand the unique demands on football players. Our tailored services help you recover from injuries, reduce pain, and improve performance on and off the pitch." },
                { title: "Personalised Care", desc: "Every player is different — and so is every injury. We deliver individualised treatment plans focused on your goals, whether that's returning to play or enhancing athletic function." },
                { title: "Flexibility to Suit You", desc: "Choose between in-person sessions in Kilmarnock or online consultations, giving you expert physiotherapy support no matter where you are." }
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
                Our <span className="text-[#1e3a8a]">Physiotherapy Services</span>
              </h2>
              <p className="text-lg text-slate-600">
                Comprehensive physiotherapy services in Kilmarnock designed specifically for footballers and athletes.
              </p>
            </FadeIn>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Injury Assessment & Diagnosis", desc: "We start with a comprehensive evaluation to understand your injury, movement patterns, and root causes to deliver effective treatment." },
                { title: "Rehabilitation & Return to Play", desc: "We guide you through progressive rehabilitation, from pain relief and mobility to strength, conditioning, and safe return-to-play." },
                { title: "Prevention & Recovery Massage", desc: "It's not just about fixing injuries — it's about preventing them and elevating performance through movement optimisation and recovery." }
              ].map((service, i) => (
                <FadeIn key={i} delay={i * 100} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 hover:border-blue-100">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 mb-6 flex-grow">{service.desc}</p>
                  <a href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service" className="font-semibold text-[#1e3a8a] hover:underline">Book Now &rarr;</a>
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
                  src="/jordan-templeton-jtfootballphysiotherapy-kilmarnock-ayrshire-clinic.jpg"
                  alt="Jordan Templeton - Founder of JT Football Physiotherapy"
                  width={600}
                  height={750}
                  className="w-full h-auto rounded-3xl object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </FadeIn>
              <FadeIn delay={200}>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  About Jordan — Founder of <span className="text-[#1e3a8a]">JT Football Physiotherapy</span>
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
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Benefits of Football-Specific Physiotherapy</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Reduce Injury Risk", desc: "Reduce your chances of getting an injury in-season." },
                { title: "Faster Recovery", desc: "Targeted treatment accelerates healing and helps you return stronger." },
                { title: "Performance Boost", desc: "Enhance strength, agility, and resilience specific to the game." },
                { title: "Ongoing Support", desc: "Education and guidance to maintain fitness long-term." }
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
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {blogPosts.length > 0 ? (
                blogPosts.map((post, i) => {
                  const imageUrl = getFeaturedImageUrl(post);
                  const dateLabel = post.firstPublishedDate
                    ? new Date(post.firstPublishedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <FadeIn key={post._id} delay={i * 100} className="flex h-full flex-col">
                      <Link
                        href={post.slug ? `/blogs/${post.slug}` : "/blogs"}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-slate-100"
                      >
                        {imageUrl ? (
                          <div className="relative h-48 w-full bg-slate-100">
                            <Image
                              src={imageUrl}
                              alt={post.title || "Blog post"}
                              fill
                              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.02]"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority={i < 2}
                            />
                            {(post.pinned || post.featured) && (
                              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                                {post.pinned ? "Pinned" : "Featured"}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative flex h-48 w-full items-center justify-center bg-slate-100">
                            <span className="text-xl font-bold text-slate-500">No Image</span>
                          </div>
                        )}

                        <div className="flex flex-grow flex-col p-6">
                          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {dateLabel && <span>{dateLabel}</span>}
                            {typeof post.minutesToRead === "number" && post.minutesToRead > 0 && (
                              <span>• {post.minutesToRead} min read</span>
                            )}
                          </div>

                          <h3 className="mb-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-[#1e3a8a]">
                            {post.title}
                          </h3>
                          <p className="mb-4 line-clamp-3 flex-grow text-slate-600">{post.excerpt}</p>
                          <span className="text-sm font-medium text-[#1e3a8a]">
                            Read more →
                          </span>
                        </div>
                      </Link>
                    </FadeIn>
                  );
                })
              ) : (
                <div className="md:col-span-2 text-center">
                  <FadeIn>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Recent Posts</h3>
                      <p className="text-slate-600 mb-4">Check out our blog for the latest articles and updates.</p>
                      <Link href="/blogs" className="font-semibold text-[#1e3a8a] hover:underline">
                        View All Posts &rarr;
                      </Link>
                    </div>
                  </FadeIn>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-gradient-to-t from-[#4C6CD6]/10 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                Contact Us Now For <span className="text-[#1e3a8a]">Pain Relief in Kilmarnock</span>, Ayrshire
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Get in touch today to book an assessment or ask a question. Our Free Discovery session lets you discuss your injury at no cost. Your recovery in Kilmarnock starts here.
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