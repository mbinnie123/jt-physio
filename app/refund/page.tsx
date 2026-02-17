// app/refund/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Refund Policy | JT Football Physiotherapy",
  description: "Refund policy for services provided by JT Football Physiotherapy, including appointments, cancellations, and pre-paid packages.",
  alternates: {
    canonical: "/refund",
  },
  openGraph: {
    title: "Refund Policy | JT Football Physiotherapy",
    description: "Refund policy for services provided by JT Football Physiotherapy, including appointments, cancellations, and pre-paid packages.",
    url: "https://www.jtfootballphysiotherapy.co.uk/refund",
  },
};

export default function RefundPage() {
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
                Refund Policy
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100 mb-4">
                This Refund Policy applies to all services provided by JT Football Physiotherapy.
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
                This Refund Policy applies to all services provided by JT Football Physiotherapy ("the Clinic", "we", "us", "our"). It should be read in conjunction with our <Link href="/terms" className="text-[#1e3a8a] hover:underline">Terms and Conditions</Link>.
              </p>

              <h2>1. General Policy</h2>
              <p>
                As a provider of private healthcare services, the Clinic operates a fair and transparent refund policy in line with UK consumer law and professional best practice.
              </p>
              <p>
                Physiotherapy services are time-based and delivered by qualified clinicians. Once an appointment has taken place, refunds are generally not provided, except where required by law or where the Clinic has failed to deliver the agreed service.
              </p>

              <h2>2. Treatment Sessions</h2>
              <p>
                Payment is due at the time of appointment unless otherwise agreed in writing.
              </p>
              <p>
                Refunds will not be issued for completed treatment sessions, including cases where a patient chooses not to continue with treatment or where treatment outcomes differ from expectations.
              </p>
              <p>
                Treatment outcomes cannot be guaranteed, and lack of perceived improvement does not constitute grounds for a refund.
              </p>

              <h2>3. Cancellation and Non-Attendance</h2>
              <p>
                Appointments cancelled in accordance with the Clinic’s stated cancellation notice period (24 hours, see <Link href="/terms" className="text-[#1e3a8a] hover:underline">Terms and Conditions</Link>) will not be charged and any pre-paid fees will be refunded or credited.
              </p>
              <p>
                Appointments cancelled with insufficient notice, or missed without notice, are not eligible for a refund.
              </p>
              <p>
                Cancellation or non-attendance fees reflect the time reserved and are not refundable, including where appointments are booked using private medical insurance.
              </p>

              <h2>4. Pre-paid Packages and Blocks of Sessions</h2>
              <p>
                Where treatment packages or blocks of sessions are offered, these are intended to be used within the agreed time frame.
              </p>
              <p>
                Unused sessions may be refundable or transferable at the Clinic’s discretion, provided sufficient notice is given and no appointment times have been reserved.
              </p>
              <p>
                Any refund issued for unused sessions may be subject to an administrative fee.
              </p>
              <p>
                Packages are non-transferable between patients unless agreed in writing.
              </p>

              <h2>5. Clinic-Initiated Cancellations</h2>
              <p>
                If the Clinic is required to cancel an appointment (e.g. due to clinician illness or unforeseen circumstances), patients will be offered the choice of a full refund or rescheduling at no additional cost.
              </p>
              <p>
                The Clinic is not responsible for any additional costs incurred by the patient, such as travel expenses or loss of earnings.
              </p>

              <h2>6. Exceptional Circumstances</h2>
              <p>
                Refunds may be considered in exceptional circumstances, such as:
              </p>
              <ul>
                <li>Serious illness or hospitalisation</li>
                <li>Bereavement</li>
                <li>Other significant and unforeseeable events</li>
              </ul>
              <p>
                Any refund issued in these circumstances is at the Clinic’s discretion and may require supporting information.
              </p>

              <h2>7. Private Medical Insurance</h2>
              <p>
                Where treatment is funded by private medical insurance, refunds are subject to the terms of the insurer.
              </p>
              <p>
                The patient remains responsible for any charges not covered by their insurer.
              </p>
              <p>
                The Clinic cannot issue refunds for claims declined or partially paid by insurers.
              </p>

              <h2>8. How Refunds Are Processed</h2>
              <p>
                Approved refunds will be processed using the original method of payment where possible.
              </p>
              <p>
                Refunds are normally processed within 3-5 working days.
              </p>

              <h2>9. Complaints and Disputes</h2>
              <p>
                If you believe a refund should be considered, please contact us in writing:
              </p>
              <ul>
                <li>Email: <a href="mailto:jtfootballphysiotherapy@gmail.com" className="text-[#1e3a8a] hover:underline">jtfootballphysiotherapy@gmail.com</a></li>
              </ul>
              <p>
                All refund requests will be handled fairly, promptly, and in accordance with UK consumer law and professional standards.
              </p>
              <p>
                The Clinic reserves the right to amend this Refund Policy at any time. The most up-to-date version will be available on our website or at the Clinic.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}