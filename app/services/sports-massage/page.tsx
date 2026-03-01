import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../Header";
import { Footer } from "../../Footer";
import { FadeIn } from "../../FadeIn";

export const metadata: Metadata = {
  title: "Sports Massage Kilmarnock | Prevention & Recovery | JT Physio",
  description: "Professional sports massage in Kilmarnock & Ayrshire. Speed up recovery, reduce muscle tension, and prevent injury with expert soft tissue therapy.",
  alternates: {
    canonical: "/services/sports-massage",
  },
};

export default function SportsMassagePage() {
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
                Sports Massage & Recovery Therapy
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Optimise your recovery and keep your body performing at its best. Our sports massage targets muscle tension, improves flexibility, and helps prevent injuries before they happen.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="rounded-full bg-[#1e3a8a] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                  Book Sports Massage
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* About your therapist */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] items-start">
              <FadeIn>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-4">
                  Sports massage delivered by an experienced physiotherapist
                </h2>
                <p className="text-lg text-slate-600 mb-4">
                  Sports massage at JT Football Physiotherapy is carried out by <span className="font-semibold">
                    Jordan Templeton, MSc Physiotherapist
                  </span>
                  . With a background in professional football, your session is informed by a deep
                  understanding of how training load, recovery and tissue health fit together.
                </p>
                <p className="text-lg text-slate-600">
                  You can read more about Jordan&apos;s experience and qualifications on our
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
                <h3 className="text-base font-semibold text-slate-900 mb-3">Who sports massage is ideal for</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Footballers and athletes wanting to support recovery between games or training.</li>
                  <li>Gym-goers and runners managing muscle tightness or recurrent niggles.</li>
                  <li>People with desk-based or manual jobs who feel tense, stiff or sore.</li>
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">More Than Just a Massage</h2>
                <div className="space-y-6 text-lg text-slate-600">
                  <p>
                    Sports massage isn't just for elite athletes. Whether you're a footballer, a runner, a gym-goer, or simply suffering from work-related tension, soft tissue therapy is a powerful tool for physical health.
                  </p>
                  <p>
                    At JT Football Physiotherapy in Kilmarnock, we use targeted techniques to release tight spots, flush out metabolic waste, and restore proper movement patterns.
                  </p>
                </div>
              </FadeIn>
              <div className="grid sm:grid-cols-2 gap-6">
                 {[
                    { title: "Accelerate Recovery", desc: "Reduce muscle soreness (DOMS) after matches or heavy training sessions." },
                    { title: "Improve Flexibility", desc: "Restore range of motion by releasing tight muscles and fascia." },
                    { title: "Prevent Injury", desc: "Identify and treat potential problem areas before they become full-blown injuries." },
                    { title: "Pain Relief", desc: "Alleviate chronic tension, back pain, and stiff necks caused by daily life." }
                 ].map((item, i) => (
                    <FadeIn key={i} delay={i * 100} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                       <p className="text-sm text-slate-600">{item.desc}</p>
                    </FadeIn>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* When to book */}
        <section className="py-24 bg-slate-50">
           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
                 <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">When is the best time for a Sports Massage?</h2>
                 <p className="text-lg text-slate-600">
                    Timing matters. We tailor your session based on your training schedule and goals.
                 </p>
              </FadeIn>
              
              <div className="grid md:grid-cols-3 gap-8">
                 <FadeIn className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Maintenance</h3>
                    <p className="text-slate-600">Regular sessions (e.g., monthly) to keep tissues healthy, address niggles early, and maintain flexibility.</p>
                 </FadeIn>
                 <FadeIn delay={100} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Pre-Event</h3>
                    <p className="text-slate-600">Stimulating massage 24-48 hours before a big match or race to prime muscles and improve circulation without causing fatigue.</p>
                 </FadeIn>
                 <FadeIn delay={200} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1e3a8a] mb-6">
                       <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Post-Event Recovery</h3>
                    <p className="text-slate-600">Flushing massage 1-2 days after intense activity to reduce soreness, clear metabolic waste, and speed up recovery.</p>
                 </FadeIn>
              </div>
           </div>
        </section>

        {/* Real examples of sports massage in Kilmarnock */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Real examples of sports massage in Kilmarnock
              </h2>
              <p className="text-lg text-slate-600">
                These anonymised examples give a feel for how sports massage can support recovery and everyday
                comfort.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: tight calves and soreness after matches
                </h3>
                <p className="mb-2">
                  A regular 5-a-side player was struggling with heavy, tight calves for days after games,
                  making it harder to train consistently.
                </p>
                <p className="mb-2">
                  We combined targeted soft tissue work with simple calf-strengthening and recovery strategies
                  between matches.
                </p>
                <p>
                  After a block of sessions they reported less post-match soreness and were able to increase
                  weekly training without the same tightness.
                </p>
              </FadeIn>
              <FadeIn
                delay={150}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Case example: desk-based neck and shoulder tension
                </h3>
                <p className="mb-2">
                  Someone working long hours at a computer came in with recurring neck and shoulder tightness
                  and headaches.
                </p>
                <p className="mb-2">
                  Sports massage sessions focused on key muscle groups around the neck and upper back, combined
                  with brief posture and movement advice.
                </p>
                <p>
                  With a mix of regular treatment and small changes to their workday routine, their symptoms
                  reduced and they felt looser and more comfortable by the end of the day.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* When sports massage might not be appropriate */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="max-w-3xl mx-auto mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                When to check with a doctor first
              </h2>
              <p className="text-lg text-slate-600">
                Sports massage is suitable for most people, but there are times when it is better to speak with
                your GP or another healthcare professional before booking.
              </p>
            </FadeIn>
            <FadeIn className="max-w-3xl mx-auto bg-slate-50 rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Speak to a doctor urgently if:</h3>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                <li>You have severe, unexplained pain or swelling that is getting worse quickly.</li>
                <li>You have a suspected fracture, infection or blood clot.</li>
                <li>You feel generally unwell with fever, unexplained weight loss or night sweats.</li>
                <li>You have had recent surgery and are unsure when hands-on treatment is safe.</li>
              </ul>
              <p className="mt-4 text-sm text-slate-600">
                If you are unsure whether to book sports massage or a physiotherapy assessment, you can contact
                us and we will help you decide on the most appropriate option.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Sports massage FAQ */}
        <section className="py-24 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                Sports massage: common questions
              </h2>
              <p className="text-lg text-slate-600">
                A few quick answers to help you decide whether sports massage is right for you.
              </p>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-700">
              <FadeIn className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is sports massage painful?</h3>
                <p>
                  Some techniques can feel strong, but it should always be within a tolerable range. We will
                  check in with you throughout and adapt the pressure to suit you.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">What should I wear?</h3>
                <p>
                  Wear or bring clothing that allows easy access to the area being treated (for example shorts
                  for legs, a vest top for shoulders). You will always be appropriately covered and respected.
                </p>
              </FadeIn>
              <FadeIn delay={200} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">How often should I book a massage?</h3>
                <p>
                  This depends on your training load, goals and how your body responds. Some people benefit
                  from monthly maintenance, others from more frequent sessions around busy periods.
                </p>
              </FadeIn>
              <FadeIn delay={300} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Is sports massage only for athletes?</h3>
                <p>
                  No. Many people who come for sports massage simply want to feel less tight, stiff or sore in
                  day-to-day life.
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
                Curious what others think about sports massage at JT Football Physiotherapy?
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
                Sports massage at our Kilmarnock clinic
              </h2>
              <p>
                JT Football Physiotherapy is based in Kilmarnock and welcomes people from across Ayrshire and
                beyond. Your confirmation email includes directions, parking details and what to expect from
                your massage session.
              </p>
              <p>
                If you are not sure whether to book sports massage or a full physiotherapy appointment, you can
                also start with our
                <Link
                  href="/services/free-discovery-session"
                  className="text-[#1e3a8a] font-semibold hover:underline mx-1"
                >
                  free discovery session
                </Link>
                to talk through your goals.
              </p>
            </FadeIn>
            <FadeIn>
              <div className="rounded-3xl bg-[#1e3a8a] text-white py-16 px-6 sm:px-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Treat your body right
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Experience the benefits of professional sports massage in Kilmarnock.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1e3a8a] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Book Massage
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