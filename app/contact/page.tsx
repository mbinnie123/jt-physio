// app/contact/page.tsx
import { Metadata } from "next";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { ContactForm } from "./ContactForm";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Contact Us | JT Football Physiotherapy",
  description: "Book your physiotherapy appointment in Kilmarnock. Get in touch for expert injury assessment and rehabilitation.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-[#1e3a8a] via-[#4C6CD6] to-[#1e3a8a] py-24 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <img src="/jt-football-physio-logo.svg" alt="" className="w-full h-full object-contain scale-100 lg:scale-150 translate-y-0 lg:translate-y-1/4" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Get in Touch
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100">
                Ready to start your physio recovery in Ayrshire? Whether you have a question about our services or want to book an appointment, we're here to help.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="relative -mt-16 pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                <FadeIn delay={100} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Clinic Location</p>
                        <p className="text-slate-600 mt-1">JT Football Physiotherapy, Kilmarnock<br/>Ayrshire, Scotland, UK</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Email Us</p>
                        <a href="mailto:info@jtfootballphysio.com" className="text-slate-600 mt-1 hover:text-[#1e3a8a] transition-colors">
                          info@jtfootballphysio.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1e3a8a]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 12.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Phone / WhatsApp</p>
                        <p className="text-slate-600 mt-1">+44 7841 430205</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="font-semibold text-slate-900 mb-4">Opening Hours</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex justify-between"><span>Monday - Friday</span> <span className="font-medium">9:00 AM - 8:00 PM</span></li>
                      <li className="flex justify-between"><span>Saturday</span> <span className="font-medium">9:00 AM - 1:00 PM</span></li>
                      <li className="flex justify-between"><span>Sunday</span> <span className="font-medium">Closed</span></li>
                    </ul>
                  </div>
                </FadeIn>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <FadeIn delay={200} className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-100">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
                    <p className="text-slate-600 mt-2">Fill out the form below and we'll get back to you shortly to discuss your physiotherapy needs.</p>
                  </div>
                  <ContactForm />
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="h-96 w-full bg-slate-200 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2253.8944682493693!2d-4.4736095!3d55.6038503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x488833698302dad1%3A0x576ea4e6cf8b0eff!2sJT%20Football%20Physiotherapy!5e0!3m2!1sen!2suk!4v1771158598459!5m2!1sen!2suk"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
