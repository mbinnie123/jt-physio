import Link from "next/link";
import Image from "next/image";

export function AuthorCard() {
  return (
    <div className="mt-16 border-t border-slate-200 pt-12">
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <Image
            src="/jt-football-physiotherapy-jordan-templeton-ayrhsire-kilmarnock-physiotherapy-clinic.webp"
            alt="Jordan Templeton - MSc Physiotherapist - JT Football Physiotherapy Kilmarnock Ayrshire Clinic"
            width={300}
            height={400}
            className="w-full h-auto rounded-xl shadow-md object-cover border-4 border-[#1e3a8a]"
          />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">About the Author: Jordan Templeton, MSc Physiotherapy</h3>
          <p className="mt-3 text-slate-600 leading-relaxed">
            <strong>Jordan Templeton</strong> is a highly experienced football physiotherapist with over 7 years of professional experience in elite professional football. As a qualified MSc Physiotherapist, Jordan specialises in football-specific injury assessment, rehabilitation, and return-to-play protocols.
          </p>
          
          <p className="mt-2.5 text-slate-600 leading-relaxed">
            Jordan's professional background includes 4 years coaching at Kilmarnock FC Academy, followed by physiotherapy roles at Kilmarnock FC and Hearts of Midlothian FC (supporting academy, B team, and first team). He currently works full-time as a physiotherapist for Kilmarnock FC, bringing hands-on elite-level experience to every patient.
          </p>
          
          <p className="mt-2.5 text-slate-600 leading-relaxed">
            He holds an MSc in Physiotherapy (Pre-Registration) from Glasgow Caledonian University and graduated with First Class Honours in Sport and Exercise Science from the University of the West of Scotland. Jordan brings expert care, evidence-led rehabilitation, and personalised treatment plans built on practical assessment and real-world football knowledge to his Kilmarnock and Ayrshire physiotherapy clinic.
          </p>
          
          <div className="mt-4 flex gap-3">
            <Link
              href="https://x.com/jt_football_physio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#1e3a8a] p-2.5 text-white hover:bg-blue-800 transition-colors"
              title="Follow on X"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.657-5.848 6.657H2.422l7.723-8.835L1.254 2.25h6.8l4.642 6.111 5.328-6.111zM17.534 20.766h1.826L6.281 3.881H4.241z" />
              </svg>
            </Link>
            <Link
              href="https://facebook.com/jtfootballphysiotherapy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#1e3a8a] p-2.5 text-white hover:bg-blue-800 transition-colors"
              title="Follow on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </Link>
            <Link
              href="https://instagram.com/jt_football_physio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#1e3a8a] p-2.5 text-white hover:bg-blue-800 transition-colors"
              title="Follow on Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
