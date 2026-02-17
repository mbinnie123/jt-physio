// app/privacy/page.tsx
import { Metadata } from "next";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Privacy Policy | JT Football Physiotherapy",
  description: "Privacy Policy for JT Football Physiotherapy. Learn how we collect, use, and protect your personal and health data in line with UK GDPR.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | JT Football Physiotherapy",
    description: "Privacy Policy for JT Football Physiotherapy. Learn how we collect, use, and protect your personal and health data in line with UK GDPR.",
    url: "https://www.jtfootballphysiotherapy.co.uk/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-[#1e3a8a] via-[#4C6CD6] to-[#1e3a8a] py-24 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src="/jt-football-physio-logo.svg"
              alt=""
              className="w-full h-full object-contain scale-100 lg:scale-150 translate-y-0 lg:translate-y-1/4"
            />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Privacy Policy
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100 mb-4">
                This policy explains how we collect, use, and protect your personal information when you use our services.
              </p>
              <p className="text-lg text-blue-100">
                Effective Date: December 2025<br />Last Reviewed: December 2026
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Main Privacy Content */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="prose prose-lg prose-slate mx-auto">
              <h2>1. Data Controller</h2>
              <p>
                JT Football Physiotherapy (“the Practice”) is the Data Controller
                for the purposes of the UK General Data Protection Regulation
                (UK GDPR) and the Data Protection Act 2018.
              </p>
              <p>
                Practice address: <a href="https://www.google.com/maps/search/?api=1&query=JT+Football+Physiotherapy,+5+Bunting+Pl,+Kilmarnock+KA1+3LE" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline">5 Bunting Place, Kilmarnock, KA1 3LE</a><br />
                Email: <a href="mailto:jtfootballphysiotherapy@gmail.com" className="text-[#1e3a8a] hover:underline">jtfootballphysiotherapy@gmail.com</a>
              </p>
              <p>
                The Practice complies with applicable professional standards
                relating to confidentiality, record keeping and data protection.
              </p>

              <h2>2. Purpose of This Policy</h2>
              <p>
                This Privacy Policy explains how the Practice collects,
                processes, stores and protects personal and special category
                data in the course of providing physiotherapy services, and
                outlines the rights of patients in relation to their personal information.
              </p>

              <h2>3. Personal Data We Process</h2>
              <p>The Practice may process the following categories of data:</p>
              <h3>3.1 Personal Data</h3>
              <ul>
                <li>Full name</li>
                <li>Date of birth</li>
                <li>Address</li>
                <li>Email address</li>
                <li>Telephone number</li>
                <li>Emergency contact details</li>
              </ul>
              <h3>3.2 Special Category Data (Health Data)</h3>
              <ul>
                <li>Medical history and relevant health information</li>
                <li>Clinical assessment findings</li>
                <li>Diagnosis, treatment plans and progress notes</li>
                <li>Correspondence with other healthcare professionals</li>
                <li>Reports, referrals and test results (where applicable)</li>
              </ul>
              <h3>3.3 Administrative and Financial Data</h3>
              <ul>
                <li>Appointment records</li>
                <li>Invoices and payment records</li>
                <li>Insurance details (where applicable)</li>
              </ul>

              <h2>4. How Data Is Collected</h2>
              <p>
                Data is collected directly from patients via registration and
                consent forms, verbal information during consultations,
                written or electronic correspondence, and online booking or practice systems.
              </p>

              <h2>5. Lawful Basis for Processing</h2>
              <p>
                The Practice processes personal data under lawful bases such as
                performance of a contract, legal obligation and legitimate
                interests. Special category health data is processed for the
                provision of healthcare. Where consent is used, it will be obtained explicitly and can be withdrawn at any time.
              </p>

              <h2>6. Use of Personal Data</h2>
              <p>Personal data is used to:</p>
              <ul>
                <li>Provide safe and appropriate physiotherapy care</li>
                <li>Maintain accurate clinical records</li>
                <li>Communicate with patients</li>
                <li>Liaise with other healthcare professionals</li>
                <li>Manage billing and insurance claims</li>
                <li>Comply with legal and professional obligations</li>
              </ul>

              <h2>7. Confidentiality and Information Sharing</h2>
              <p>
                The Practice adheres to strict confidentiality principles. Data
                will not be disclosed without consent unless necessary for
                direct care, legal obligations, or safeguarding concerns. Only minimum necessary data will be shared where applicable.
              </p>

              <h2>8. Data Storage and Security</h2>
              <p>
                The Practice implements appropriate technical and organisational
                measures to protect data, including secure electronic systems,
                encrypted devices where appropriate, restricted access and
                secure storage for paper records.
              </p>

              <h2>9. Data Retention</h2>
              <p>
                Records are retained in line with professional and legal
                requirements. Adult records are held for at least 8 years after
                last treatment; children’s records until age 25 (or 26 if
                treated at 17). Records are securely destroyed when retention periods expire.
              </p>

              <h2>10. Data Subject Rights</h2>
              <p>
                Under UK GDPR, patients have the right to access, correct,
                delete, restrict processing, withdraw consent, and lodge a
                complaint with the UK Information Commissioner’s Office (ICO).
              </p>

              <h2>11. Website and Cookies</h2>
              <p>
                The Practice website may use cookies for functionality and
                analytics. Cookies do not collect health data. Users may manage
                cookies through their browser settings.
              </p>

              <h2>12. Policy Review</h2>
              <p>
                This Privacy Policy is reviewed regularly to ensure compliance
                with legislation and professional standards. The latest version is available upon request or on the website.
              </p>

              <h2>13. Contact Details</h2>
              <p>
                For questions about this Privacy Policy or data handling, please
                contact: <br />
                JT Football Physiotherapy<br />
                Email: <a href="mailto:jtfootballphysiotherapy@gmail.com" className="text-[#1e3a8a] hover:underline">jtfootballphysiotherapy@gmail.com</a>
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
