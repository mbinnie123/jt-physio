import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            JT Football Physiotherapy
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-black/70 hover:text-black" href="/services">
              Services
            </Link>
            <Link className="text-black/70 hover:text-black" href="/about">
              About
            </Link>
            <Link className="text-black/70 hover:text-black" href="/contact">
              Contact
            </Link>
            <Link
              className="rounded-full bg-black px-4 py-2 text-white hover:bg-black/90"
              href="/contact"
            >
              Book an assessment
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs text-black/70">
                Kilmarnock • Ayrshire • In-person & online
              </p>

              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Physiotherapy in Kilmarnock for pain relief, rehab, and performance.
              </h1>

              <p className="mt-4 text-lg leading-relaxed text-black/70">
                Evidence-led assessment and hands-on treatment for sports injuries,
                back pain, and everyday aches — with a clear plan to get you moving
                confidently again.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/90"
                >
                  Book an appointment
                </Link>
                <Link
                  href="/physiotherapy-kilmarnock"
                  className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium text-black hover:bg-black/5"
                >
                  Physiotherapy Kilmarnock page
                </Link>
              </div>

              <ul className="mt-6 grid gap-2 text-sm text-black/70">
                <li>• Sports injuries & return-to-play rehab</li>
                <li>• Back pain, neck pain & mobility issues</li>
                <li>• Strength & conditioning support</li>
              </ul>
            </div>

            {/* Hero card */}
            <div className="rounded-3xl border border-black/10 bg-black/5 p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                What you get in your first session
              </h2>

              <div className="mt-4 grid gap-3 text-sm text-black/70">
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-medium text-black">Assessment</p>
                  <p className="mt-1">
                    We identify the root cause (not just symptoms) and agree goals.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-medium text-black">Treatment</p>
                  <p className="mt-1">
                    Hands-on physio + tailored exercises based on your needs.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="font-medium text-black">Plan</p>
                  <p className="mt-1">
                    Clear next steps, timelines, and what to do between sessions.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs text-black/60">
                Based in Kilmarnock, serving Ayrshire. Appointments available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            Physiotherapy services in Kilmarnock
          </h2>
          <p className="mt-2 max-w-2xl text-black/70">
            A practical, structured approach for both athletes and non-athletes —
            from first assessment to confident return to activity.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Sports injury rehab",
                body: "Ankle, knee, hip and muscle injuries with return-to-sport planning.",
              },
              {
                title: "Back pain & mobility",
                body: "Reduce pain, restore movement, improve strength and confidence.",
              },
              {
                title: "Performance support",
                body: "Strength & conditioning guidance to build resilience and reduce re-injury.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-black/10 p-6"
              >
                <h3 className="font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/70">
                  {card.body}
                </p>
                <Link
                  className="mt-4 inline-block text-sm font-medium text-black underline underline-offset-4 hover:text-black/70"
                  href="/services"
                >
                  View services
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local CTA */}
      <section className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-3xl border border-black/10 bg-black p-10 text-white">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Looking for a physiotherapist in Kilmarnock?
            </h2>
            <p className="mt-3 max-w-2xl text-white/80">
              Book an assessment and leave with a clear plan. In-person appointments
              in Kilmarnock and online sessions available across Ayrshire.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black hover:bg-white/90"
              >
                Book now
              </Link>
              <Link
                href="/physiotherapy-kilmarnock"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Read about physio in Kilmarnock
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">
          <p>© {new Date().getFullYear()} JT Football Physiotherapy</p>
          <p className="mt-2">
            Kilmarnock, Ayrshire •{" "}
            <Link className="underline underline-offset-4" href="/contact">
              Contact & booking
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}