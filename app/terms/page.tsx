// app/terms/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Terms and Conditions | JT Football Physiotherapy",
  description: "Terms and conditions for services provided by JT Football Physiotherapy, including appointments, payments, and patient responsibilities.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms and Conditions | JT Football Physiotherapy",
    description: "Terms and conditions for services provided by JT Football Physiotherapy, including appointments, payments, and patient responsibilities.",
    url: "https://www.jtfootballphysiotherapy.co.uk/terms",
  },
};

export default function TermsPage() {
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
                Terms and Conditions
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100 mb-4">
                These Terms and Conditions apply to all patients receiving services from JT Football Physiotherapy.
              </p>
              <p className="text-lg text-blue-100">
                Effective Date: December 2025<br />Last Reviewed: December 2026
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn className="prose prose-lg prose-slate mx-auto">
              <p>
                These Terms and Conditions apply to all patients receiving services from JT Football Physiotherapy ("the Clinic", "we", "us", "our"). By booking an appointment or receiving treatment, you agree to be bound by these Terms and Conditions.
              </p>

              <h2>1. Introduction</h2>
              <p>
                The Clinic provides private physiotherapy and related rehabilitation services in the United Kingdom. All treatments are delivered by physiotherapists who are appropriately qualified, registered with the Health and Care Professions Council (HCPC), and members of relevant professional bodies such as the Chartered Society of Physiotherapy (CSP) where applicable.
              </p>
              <p>
                All services are provided in accordance with UK law, professional standards, and clinical best practice. Treatment outcomes cannot be guaranteed.
              </p>

              <h2>2. Appointments</h2>
              <p>
                Appointments can be booked online, by phone, or via email. Your booking is confirmed only upon receipt of a confirmation from us.
              </p>
              <p>
                Appointment times are reserved exclusively for you. Late arrival may result in reduced treatment time and will be charged at the full appointment rate.
              </p>
              <p>
                The Clinic reserves the right to refuse, suspend, or discontinue treatment where it is clinically inappropriate, where consent is withdrawn, or where patient behaviour is abusive, unsafe, or disruptive.
              </p>

              <h2>3. Cancellation and Missed Appointments</h2>
              <p>
                A minimum of 24 hours notice is required to cancel or reschedule an appointment.
              </p>
              <p>
                Appointments cancelled with less than the required notice, or missed without notice, may be charged up to 100% of the appointment fee.
              </p>
              <p>
                Cancellation and non-attendance charges are the responsibility of the patient and are not covered by private medical insurance.
              </p>

              <h2>4. Fees and Payment</h2>
              <p>
                Fees are payable on the day of treatment unless otherwise agreed in writing.
              </p>
              <p>
                Accepted payment methods include debit/credit card, bank transfer, and online payment.
              </p>
              <p>
                The Clinic reserves the right to review and amend fees at any time. Current fees will be made available prior to treatment.
              </p>

              <h2>5. Private Medical Insurance</h2>
              <p>
                Patients using private medical insurance are responsible for confirming authorisation, eligibility, and benefit limits prior to treatment.
              </p>
              <p>
                The patient remains responsible for payment of all fees not covered by their insurer, including excesses or rejected claims.
              </p>
              <p>
                The Clinic accepts no responsibility for non-payment by insurers.
              </p>

              <h2>6. Medical Information and Informed Consent</h2>
              <p>
                Patients must provide accurate, complete, and up-to-date medical information, including relevant diagnoses, medications, and previous treatments.
              </p>
              <p>
                Physiotherapy treatment will only be provided with the patient’s informed consent, in accordance with UK legal and professional requirements.
              </p>
              <p>
                Failure to disclose relevant information may compromise treatment safety and effectiveness.
              </p>

              <h2>7. Data Protection and Confidentiality</h2>
              <p>
                The Clinic complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
              <p>
                Personal and special category (health) data are collected solely for the purposes of providing healthcare services, clinical record-keeping, and administrative requirements.
              </p>
              <p>
                Patient information will not be shared with third parties without consent unless required by law, safeguarding obligations, or professional duty of care.
              </p>
              <p>
                Patients have the right to access their records and request corrections in accordance with data protection legislation.
              </p>

              <h2>8. Treatment Risks and Responsibilities</h2>
              <p>
                Physiotherapy may involve physical exertion, manual therapy, and exercise which carry some inherent risk.
              </p>
              <p>
                While every reasonable effort is made to minimise risk, no specific outcomes or results can be guaranteed.
              </p>
              <p>
                Patients agree to follow clinical advice, including prescribed home exercise programmes, and to inform the therapist of any adverse reactions or concerns.
              </p>

              <h2>9. Liability</h2>
              <p>
                The Clinic holds appropriate professional indemnity and public liability insurance as required in the UK.
              </p>
              <p>
                Nothing in these Terms and Conditions excludes or limits liability for death or personal injury caused by negligence, or for any matter which cannot be excluded under UK law.
              </p>
              <p>
                Subject to the above, the Clinic shall not be liable for any indirect or consequential loss arising from treatment.
              </p>

              <h2>10. Children and Vulnerable Adults</h2>
              <p>
                Patients under the age of 16 must be accompanied by a parent or legal guardian, unless otherwise agreed.
              </p>
              <p>
                Consent for treatment of minors or vulnerable adults will be obtained in accordance with UK safeguarding and capacity legislation.
              </p>

              <h2>11. Infection Control and Health & Safety</h2>
              <p>
                Patients must not attend appointments if they have a contagious illness that may pose a risk to others.
              </p>
              <p>
                The Clinic follows UK infection prevention and control guidance and reserves the right to reschedule appointments where there is a risk to staff or other patients.
              </p>

              <h2>12. Complaints and Feedback</h2>
              <p>
                The Clinic aims to provide a high standard of care and welcomes feedback.
              </p>
              <p>
                Complaints should be raised directly with us in the first instance:
              </p>
              <ul>
                <li>Email: <a href="mailto:jtfootballphysiotherapy@gmail.com" className="text-[#1e3a8a] hover:underline">jtfootballphysiotherapy@gmail.com</a></li>
                <li>Phone: <a href="tel:07841430205" className="text-[#1e3a8a] hover:underline">07841 430205</a></li>
              </ul>
              <p>
                If concerns cannot be resolved, patients may escalate complaints in line with professional body guidance (e.g. CSP or HCPC).
              </p>

              <h2>13. Changes to These Terms and Conditions</h2>
              <p>
                These Terms and Conditions may be updated periodically.
              </p>
              <p>
                The most current version will be available at the Clinic and/or on the Clinic website.
              </p>

              <h2>14. Governing Law</h2>
              <p>
                These Terms and Conditions are governed by the laws of Scotland (or England and Wales, if applicable). Any disputes shall be subject to the exclusive jurisdiction of the relevant courts.
              </p>

              <p className="font-semibold mt-8">
                By booking or attending an appointment, you confirm that you have read, understood, and agree to these Terms and Conditions.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}