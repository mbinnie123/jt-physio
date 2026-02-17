// app/accessibility/page.tsx
import { Metadata } from "next";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Accessibility Statement | JT Football Physiotherapy",
  description: "Accessibility statement for JT Football Physiotherapy. Our commitment to inclusive care, physical access information, and digital accessibility standards.",
};

export default function AccessibilityPage() {
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
                Accessibility Statement
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-blue-100 mb-4">
                Our commitment to providing safe, effective, and inclusive physiotherapy services for everyone.
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
              <h2>Our Commitment to Accessibility</h2>
              <p>
                JT Football Physiotherapy is committed to delivering safe, effective, and inclusive physiotherapy services in line with the values and guidance of the Chartered Society of Physiotherapy (CSP). We aim to promote equality, inclusion, and patient-centred care, ensuring that all individuals are treated with dignity, respect, and fairness.
              </p>
              <p>
                We recognise our legal duties under the Equality Act 2010 and our professional responsibility to make reasonable adjustments and remove barriers to accessing physiotherapy services wherever possible.
              </p>

              <h2>Physical Access to Our Clinic</h2>
              <p>
                We aim to ensure our physical environment supports equitable access to care where possible. Our clinic is located at <a href="https://www.google.com/maps/search/?api=1&query=JT+Football+Physiotherapy,+5+Bunting+Pl,+Kilmarnock+KA1+3LE" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a] hover:underline"><strong>5 Bunting Pl, Kilmarnock, KA1 3LE</strong></a>.
              </p>
              <p>
                <strong>Please note the following regarding physical access:</strong>
              </p>
              <ul>
                <li><strong>Step Access:</strong> Access to the clinic building requires navigating steps.</li>
                <li><strong>Wheelchair Access:</strong> At present, the clinic premises cannot offer wheelchair access due to the physical layout of the building.</li>
                <li><strong>Treatment Room:</strong> Once inside, our treatment room is spacious and designed for comfort.</li>
              </ul>
              <p>
                <strong>Online Alternatives:</strong> For clients who cannot access the clinic physically due to these barriers, we offer comprehensive <strong>online physiotherapy consultations</strong>. These sessions allow us to assess, diagnose, and provide rehabilitation plans remotely.
              </p>
              <p>
                If you have specific access needs, please contact us in advance. We will work collaboratively with you to identify reasonable adjustments or alternative arrangements.
              </p>

              <h2>Communication and Patient Involvement</h2>
              <p>
                Consistent with CSP best practice, we are committed to shared decision-making and clear, accessible communication. We strive to:
              </p>
              <ul>
                <li>Use plain English and avoid unnecessary medical jargon.</li>
                <li>Take time to explain assessment findings, treatment options, risks, and expected outcomes clearly.</li>
                <li>Support you to be actively involved in decisions about your care.</li>
                <li>Allow additional appointment time where clinically appropriate or requested.</li>
                <li>Welcome carers, advocates, or support persons to attend appointments with you.</li>
              </ul>
              <p>
                Alternative formats for written information (such as large print or digital copies) are available upon request.
              </p>

              <h2>Website and Digital Accessibility</h2>
              <p>
                We aim to ensure our website and digital services are accessible to as many people as possible, including those using assistive technologies.
              </p>
              <p>
                Where reasonably practicable, our website seeks to meet the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>.
              </p>
              <p>
                Please note that some third-party systems we use, such as our online booking platform (Cliniko), are external services. While we choose partners who value accessibility, some legacy content or external interfaces may not fully meet all standards. If you experience difficulty using our online booking system, please contact us directly via phone or email to book your appointment.
              </p>

              <h2>Reasonable Adjustments</h2>
              <p>
                In accordance with equality legislation, we are committed to making reasonable adjustments on an individual basis. These may include:
              </p>
              <ul>
                <li>Flexible appointment scheduling.</li>
                <li>Adapted assessment or treatment approaches.</li>
                <li>Assistance with completing forms or accessing information.</li>
                <li>Adjustments to communication methods.</li>
              </ul>

              <h2>Feedback and Contact Details</h2>
              <p>
                We welcome feedback and recognise its importance in improving accessibility and quality of care. If you have questions about accessibility, wish to request reasonable adjustments, or would like to raise a concern, please contact us:
              </p>
              <ul>
                <li><strong>Email:</strong> <a href="mailto:jtfootballphysiotherapy@gmail.com">jtfootballphysiotherapy@gmail.com</a></li>
                <li><strong>Phone / WhatsApp:</strong> <a href="tel:07841430205">07841 430205</a></li>
              </ul>
              <p>
                Concerns will be addressed promptly, fairly, and in line with our professional standards.
              </p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
