"use client";

import { useState } from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";
import Link from "next/link";

export default function PitchPDFPage() {
  const [recipientName, setRecipientName] = useState("");
  const [recipientOrganization, setRecipientOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (recipientName) params.append("recipientName", recipientName);
      if (recipientOrganization) params.append("recipientOrganization", recipientOrganization);

      const response = await fetch(`/api/generate-pitch-pdf?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "JT-Football-Physiotherapy-Pitch.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b border-slate-100 bg-[radial-gradient(at_20%_0%,rgba(0,138,252,0.16)_0%,transparent_60%)] py-16">
          <div className="mx-auto max-w-4xl px-4">
            <FadeIn>
              <p className="mb-2.5 inline-block text-xs font-bold uppercase tracking-widest text-blue-600">
                Service Pitch
              </p>
              <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Download Jordan's Services Pitch
              </h1>
              <p className="mb-8 max-w-3xl text-lg leading-relaxed text-slate-600">
                Get a professional one-page overview of JT Football Physiotherapy services — perfect for sharing with clubs, organisations, or partners interested in expert physiotherapy solutions.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-4">
            <FadeIn>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Personalise Your PDF (Optional)
                </h2>

                <form onSubmit={handleDownload} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                      Recipient Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g., Club Manager, Partnership Director"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave blank for a generic version
                    </p>
                  </div>

                  <div>
                    <label htmlFor="org" className="block text-sm font-semibold text-slate-900 mb-2">
                      Organization / Club Name
                    </label>
                    <input
                      id="org"
                      type="text"
                      placeholder="e.g., Local Football Club, Sports Academy"
                      value={recipientOrganization}
                      onChange={(e) => setRecipientOrganization(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave blank for a generic version
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Generating PDF..." : "Download PDF"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">What's included:</span> Professional overview of Jordan's background, expertise, services, and why clubs, clients and football players of all backgrounds choose JT Football Physiotherapy.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Features Section */}
            <FadeIn delay={100} className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                Why Use This Pitch?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "📋",
                    title: "Professional Format",
                    desc: "Clean, one-page PDF perfect for sharing with clubs and organisations"
                  },
                  {
                    icon: "⚡",
                    title: "Quick Overview",
                    desc: "Highlights Jordan's experience, credentials, and service offerings"
                  },
                  {
                    icon: "🎯",
                    title: "Personalised",
                    desc: "Optionally customise with recipient name and organisation"
                  },
                ].map((feature, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Use Cases */}
            <FadeIn delay={200} className="mt-16 bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Perfect For:
              </h3>
              <ul className="space-y-3 text-slate-700">
                {[
                  "Football clubs looking for partnership physiotherapy services",
                  "Sports academies needing rehabilitation expertise",
                  "Event organisers seeking medical staff recommendations",
                  "Team managers evaluating physio support options",
                  "Individual athletes shopping for professional coaching",
                ].map((use, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            {/* CTA */}
            <FadeIn delay={300} className="mt-16 text-center">
              <p className="text-slate-600 mb-4">
                Questions about services or interested in a partnership?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 transition-all hover:shadow-lg"
              >
                Get in Touch
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
