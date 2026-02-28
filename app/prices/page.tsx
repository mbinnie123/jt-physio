import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Physiotherapy Prices | JT Football Physiotherapy Kilmarnock",
  description:
    "Transparent pricing for physiotherapy services in Kilmarnock. Initial assessments, follow-up appointments, sports massage, and more. See our rates and book online.",
  alternates: {
    canonical: "/prices",
  },
  openGraph: {
    title: "Physiotherapy Prices | JT Football Physiotherapy Kilmarnock",
    description:
      "Clear, competitive pricing for physiotherapy appointments, massage, and specialist services. Book your appointment at JT Football Physiotherapy in Kilmarnock, Ayrshire.",
    url: "https://www.jtfootballphysiotherapy.co.uk/prices",
  },
};

export default function PricesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main>
        <section className="relative border-b border-slate-100 bg-[radial-gradient(at_20%_0%,rgba(0,138,252,0.16)_0%,transparent_60%)] py-16 pb-10">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <p className="mb-2.5 inline-block text-xs font-bold uppercase tracking-widest text-blue-600">
                Pricing
              </p>
              <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Transparent physiotherapy pricing in Kilmarnock
              </h1>
              <p className="mb-6 max-w-3xl text-lg leading-relaxed text-slate-600">
                No hidden fees. Clear, competitive rates for physiotherapy assessment, treatment, and sports massage at JT Football Physiotherapy in Ayrshire.
              </p>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Pricing primary actions">
                <Link
                  href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                  className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-6 py-3 text-sm font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
                >
                  Book an appointment
                </Link>
                <Link
                  href="/services/free-discovery-session"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-50 hover:shadow-lg"
                >
                  Free discovery call
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <div className="mb-12">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
                  Service pricing
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-slate-600 max-w-3xl">
                  All sessions include assessment, treatment, exercise guidance, and a plan to get you pain-free and confident. Book online or call to discuss your needs.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Initial Assessment */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Initial Assessment</h3>
                        <p className="text-sm text-slate-500 mt-1">Full consultation & evaluation</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">£55</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Detailed injury history & movement assessment</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Clear diagnosis & treatment plan</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Initial treatment & exercise guidance</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Typically 45–60 minutes</span>
                      </li>
                    </ul>
                  </div>

                  {/* Return Appointment */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Return Appointment</h3>
                        <p className="text-sm text-slate-500 mt-1">Follow-up treatment & progression</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">£40</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Check-in & symptom update</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Hands-on treatment & exercise progression</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Strength, mobility & movement work</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>30 minutes</span>
                      </li>
                    </ul>
                  </div>

                  {/* Sports Massage - Legs */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Sports Massage</h3>
                        <p className="text-sm text-slate-500 mt-1">Legs only</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">£45</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Deep tissue & trigger point work</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Focused on lower limbs and hips</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Recovery & pain relief</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>45 minutes</span>
                      </li>
                    </ul>
                  </div>

                  {/* Sports Massage - Full */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Sports Massage</h3>
                        <p className="text-sm text-slate-500 mt-1">Back & legs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">£60</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Comprehensive full-body work</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Back, trunk, hips & legs included</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>Deep tissue & mobility focus</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span>60 minutes</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Home Appointments Section */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Home appointments</h3>
                <p className="text-slate-600 mb-2">
                  We offer home and clinic-based physiotherapy in Kilmarnock and across Ayrshire. For home appointments, travel expenses will be charged in addition to the session fee.
                </p>
                <p className="text-sm text-slate-500">
                  Contact us to discuss home visit options and exact travel charges based on your location.
                </p>
              </div>
            </FadeIn>

            {/* FAQ Section */}
            <FadeIn delay={100}>
              <div className="mt-12">
                <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
                  Pricing questions
                </h2>

                <div className="grid gap-3">
                  {[
                    {
                      q: "What's included in the initial assessment price?",
                      a: "The initial assessment fee covers a full consultation about your injury history, a detailed movement and strength assessment, hands-on evaluation if needed, an honest diagnosis, and the start of your treatment plan with clear next steps. You'll leave with exercise guidance and a realistic timeline.",
                    },
                    {
                      q: "Do I need to book multiple sessions upfront?",
                      a: "No. After your initial assessment, we'll discuss what you need and agree on a plan together. Some people benefit from regular appointments for a short block (e.g. 4–6 weeks), while others need only occasional reviews. You can book individually or discuss package options.",
                    },
                    {
                      q: "Is there a discount for block bookings?",
                      a: "Yes. If you want to commit to a block of sessions upfront, we can often offer a small discount. Contact us directly to discuss your needs and we'll work out the best option for you.",
                    },
                    {
                      q: "Do you offer online consultations, and are they the same price?",
                      a: "Yes, online consultations are available at the same rate as in-clinic appointments. Online works well for exercise progression, guidance, and return-to-play planning. We'll let you know if we think an in-person session would be more beneficial.",
                    },
                    {
                      q: "What about home visit appointments?",
                      a: "Home appointments are available across Kilmarnock and Ayrshire. The session fee is the same, but travel expenses will be charged separately based on your location. Contact us to discuss availability and exact travel costs.",
                    },
                    {
                      q: "Do you accept insurance or workplace health schemes?",
                      a: "Contact us directly to discuss your specific insurance or workplace scheme. While you'll need to check your coverage with your provider, we're happy to help with any required paperwork.",
                    },
                    {
                      q: "Can I sign up for a free discovery session first?",
                      a: "Yes. We offer a free discovery session where you can discuss your injury, ask questions, and decide if physiotherapy with us is right for you. There's no obligation to book treatment after.",
                    },
                  ].map((item, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-slate-200 bg-white p-4 open:bg-white"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900 outline-none">
                        {item.q}
                        <span className="ml-3 text-lg font-normal text-blue-600 group-open:hidden">
                          +
                        </span>
                        <span className="ml-3 text-lg font-normal text-blue-600 hidden group-open:block">
                          –
                        </span>
                      </summary>
                      <div className="mt-2.5 border-t border-slate-100 pt-2.5 text-slate-600">
                        <p className="m-0 text-sm">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* CTA Section */}
            <FadeIn delay={200}>
              <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm text-center">
                <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
                  Ready to start your physio journey?
                </h2>
                <p className="mb-6 text-slate-600 max-w-2xl mx-auto">
                  Book an initial assessment in Kilmarnock or online, or grab a free discovery session to chat through your situation with no pressure.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    href="https://jt-football-physiotherapy.uk2.cliniko.com/bookings#service"
                    className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-6 py-3 text-sm font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
                  >
                    Book appointment
                  </Link>
                  <Link
                    href="/services/free-discovery-session"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-100 hover:shadow-lg"
                  >
                    Free discovery call
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-100 hover:shadow-lg"
                  >
                    Get in touch
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
