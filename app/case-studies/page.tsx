import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Physiotherapy Case Studies | JT Football Physiotherapy Kilmarnock",
  description:
    "Real patient stories from JT Football Physiotherapy in Kilmarnock, Ayrshire. See how our physiotherapy programmes have helped patients recover from injury and return to sport.",
  alternates: {
    canonical: "/case-studies",
  },
  openGraph: {
    title: "Physiotherapy Case Studies | JT Football Physiotherapy Kilmarnock",
    description:
      "Real patient stories from JT Football Physiotherapy in Kilmarnock, Ayrshire.",
    url: "https://www.jordanphysiotherapyayrshire.co.uk/case-studies",
    locale: "en_GB",
    type: "website",
  },
};

export const revalidate = 86400;

const caseStudies = [
  {
    href: "/case-studies/erin-acl-kilmarnock",
    title: "Erin's ACL Prehab Journey",
    subtitle: "From barely walking to surgery-ready in Kilmarnock",
    tags: ["ACL Injury", "Prehab", "Knee Rehabilitation"],
    description:
      "Erin tore her ACL and couldn't walk without a limp. With surgery weeks away, she needed a structured prehab programme to restore extension, build quad strength, and get her knee in the best condition possible.",
  },
];

export default function CaseStudiesIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/10 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#1e3a8a] mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#1e3a8a] mr-2" />
                Real patients · Real results · Kilmarnock, Ayrshire
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                Physiotherapy{" "}
                <span className="text-[#1e3a8a]">Case Studies</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Every patient has a different story. These case studies show the real journey — from injury through to recovery — at our Kilmarnock, Ayrshire clinic.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {caseStudies.map((cs) => (
                <FadeIn key={cs.href}>
                  <Link
                    href={cs.href}
                    className="group block rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-sm hover:border-[#1e3a8a]/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cs.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#1e3a8a] transition-colors">
                      {cs.title}
                    </h2>
                    <p className="text-sm font-medium text-[#1e3a8a] mb-3">{cs.subtitle}</p>
                    <p className="text-slate-600 leading-relaxed">{cs.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1e3a8a]">
                      Read case study
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
