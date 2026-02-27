import { Metadata } from "next";
import Link from "next/link";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { FadeIn } from "../FadeIn";

export const metadata: Metadata = {
  title: "Physiotherapy FAQ | JT Football Physiotherapy Kilmarnock",
  description:
    "Extensive physiotherapy FAQ from JT Football Physiotherapy in Kilmarnock, Ayrshire. Answers about pain, recovery timelines, football-specific rehab, online sessions, pricing and more.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Physiotherapy FAQ | JT Football Physiotherapy Kilmarnock",
    description:
      "Comprehensive answers to common questions about physiotherapy, injury rehab, pain, football-specific treatment and appointments at JT Football Physiotherapy in Kilmarnock, Ayrshire.",
    url: "https://www.jtfootballphysiotherapy.co.uk/faq",
  },
};

const faqSections = [
  {
    slug: "pain-and-recovery",
    title: "Pain, recovery timelines & when to worry",
    intro:
      "Questions about how long pain should last, what kind of discomfort is normal in rehab, and when it is sensible to seek extra help.",
    items: [
      {
        q: "My pain hasn't settled with rest — what should I do next?",
        a: "If your pain hasn't improved with rest alone, it usually means something is still irritating the area — such as training load, movement patterns, strength deficits or reduced mobility. Rest can calm things down in the short term, but on its own it rarely fixes the underlying issue. At JT Football Physiotherapy we assess the whole picture, identify the main driver, and build a clear, football-informed plan so you are not guessing what to do next. We will also explain which activities you can safely keep, which to modify, and which to pause for a short period so you do not lose unnecessary fitness.",
      },
      {
        q: "How long does it normally take to see results from physiotherapy?",
        a: "Timeframes depend on your injury, how long symptoms have been present, your current fitness, and how consistent you can be with your programme. Some people notice positive change within 1–2 weeks, such as easier movement, less stiffness or more confidence using the area. Longer-standing or more complex pain often improves steadily over 4–8 weeks, and major injuries or post-surgical rehab can take several months. Our focus is progress you can maintain, not quick fixes that fade as soon as you stop treatment. We will always give you an honest outline of what to expect at the start and review this together as we go.",
      },
      {
        q: "Can physiotherapy really help with persistent or long-term pain?",
        a: "Yes. For many people, persistent pain is linked to load tolerance, movement habits, strength and confidence rather than just tissue damage. Pain can become more sensitive over time, especially if you have been protecting an area for months. We use education, targeted exercise and graded exposure to help you move better, feel stronger and gain control over your symptoms so you can get back to everyday life and sport. We will also talk about sleep, stress and training load, because these factors often influence how loud or quiet your pain feels day to day.",
      },
      {
        q: "Is it normal to feel some discomfort during rehab exercises?",
        a: "A small, manageable level of discomfort can be normal when you challenge an area that has been painful or weak. Rehab should not cause sharp, escalating or long-lasting pain. We usually work within a mild-to-moderate discomfort range that settles back to your baseline within 24 hours. At your assessment we will agree a simple ‘traffic light’ system so you know what type and level of pain is acceptable, what suggests the exercise needs adjusting, and what would be a reason to stop and contact us.",
      },
      {
        q: "How should I feel in the day or two after a physiotherapy session?",
        a: "It is common to feel slightly achy or more aware of the treated area for 24–48 hours after a session, especially if you have had hands-on treatment or progressed your exercises. This should feel like a workout-type soreness rather than a sharp or worrying pain, and it should ease with gentle movement and your usual pain-relief strategies. If your symptoms flare significantly and stay worse for several days, we will review the intensity, volume or type of exercise you are doing so that your plan remains challenging but tolerable.",
      },
      {
        q: "Should I rest the day after physiotherapy or keep moving?",
        a: "Most people do best with a balance: avoid doing nothing, but also avoid jumping straight back into heavy training. In the first 24 hours after a session we usually recommend gentle movement such as walking, mobility drills and lighter versions of your rehab exercises. This keeps blood flow and joint motion without overloading sensitive tissues. From there we gradually build back towards more demanding gym work and sport-specific training, using your symptom response as a guide.",
      },
      {
        q: "When should I stop or change physiotherapy if it is not helping?",
        a: "You should expect to see some early signs of progress within the first few weeks of a consistent rehab plan, even if the pain is not completely gone. These signs might include moving more freely, feeling stronger, coping better with day-to-day tasks or having fewer flare-ups. If your symptoms are steadily worsening, you feel unclear about the plan, or nothing has changed after several sessions, it is reasonable to pause, ask more questions or seek a second opinion. Our approach is to review your response regularly, adjust the plan if needed and be honest if we think a different route — such as medical review or imaging — would be more appropriate.",
      },
    ],
  },
  {
    slug: "sport-and-training",
    title: "Training, football & return to play",
    intro:
      "How physiotherapy fits around your football, running and gym work, and how we guide you safely back to full performance.",
    items: [
      {
        q: "Do I need to stop training completely if I'm sore or injured?",
        a: "Often you do not need to stop everything. In many cases we can modify your training so you keep moving while protecting the injured area — for example by changing intensity, volume, type of session or specific movements. Smart load management is usually better than total rest, which can sometimes slow progress and make it harder to return to your previous level. We will help you decide which sessions to keep, which to adapt and which to pause so that your rehab fits realistically around football, work and family life.",
      },
      {
        q: "When is the right time to book an appointment with a physiotherapist?",
        a: "Book in if pain is limiting how you move, affecting your sleep, stopping you from training or playing, keeps returning, or has not improved after a short period of rest and self-management. It is also sensible to seek advice if you have had a significant injury such as a bad twist, fall or impact, even if the pain settles quickly. Early advice from a physiotherapist in Kilmarnock can prevent a small issue becoming a longer-term problem and can shorten the time you spend out of training.",
      },
      {
        q: "Do you only treat footballers, or can anyone come to the clinic?",
        a: "We specialise in football-specific physiotherapy, but we also treat a wide range of active people — from runners and gym-goers to recreational athletes and active adults across Ayrshire. The principles we use for footballers, such as structured strength work, clear loading progressions and return-to-play testing, transfer very well to other sports and day-to-day life. If you value a practical, exercise-based approach, you will fit right in even if you do not play football.",
      },
      {
        q: "What makes football-specific physiotherapy different from standard physio?",
        a: "Football places unique demands on the body: sprinting, decelerating, cutting, jumping, tackling and kicking under fatigue. Our assessment and rehab are built around those demands. We do not just treat the painful area — we design your plan so you can confidently handle the true speed, changes of direction and contact of the game. That means building strength, power and conditioning, but also rehearsing real football movements such as pressing, turning, jumping for headers and striking the ball at match pace.",
      },
      {
        q: "Can physiotherapy also help prevent future injuries, not just treat current ones?",
        a: "Yes. Prevention is a big part of our work. We look for risk factors such as strength imbalances, limited mobility, history of previous injuries and sudden spikes in training load. From there we create a simple, realistic plan that reduces your risk of repeat injuries and helps you stay available to train and play. This might include a short warm-up routine, gym-based strength work, and guidance on how to progress or reduce your weekly load around busy fixture periods.",
      },
      {
        q: "What types of injuries and pain do you see most often?",
        a: "Common presentations include ankle sprains, hamstring and groin issues, knee ligament injuries including ACL, hip and lower-back pain, calf and foot problems, and general overload from training. We also see many players and active adults with recurring ‘niggles’ that have never been fully resolved. Our goal is not only to settle the pain but to understand why it keeps coming back so that your long-term risk of re-injury is lower.",
      },
      {
        q: "How does JT Football Physiotherapy support my return to play?",
        a: "We guide you step by step from early pain management through strength, power and conditioning, right up to football-specific drills and match preparation. Where appropriate we use objective tests and clear criteria so your return to play is based on more than just ‘how it feels’. We will help you answer practical questions such as when to start jogging, when to rejoin parts of training, and when it is sensible to play a full match again.",
      },
    ],
  },
  {
    slug: "safety-and-red-flags",
    title: "Safety, scans & red-flag symptoms",
    intro:
      "How we keep you safe, when imaging or medical review is needed, and which symptoms should never be ignored.",
    items: [
      {
        q: "What are red flags in physiotherapy and when should I see a doctor urgently?",
        a: "Red flags are warning signs that suggest your symptoms might be linked to something more serious and need urgent medical assessment rather than standard physiotherapy. Examples include unexplained weight loss, fever with severe pain, new difficulties controlling your bladder or bowels, significant weakness, a recent major trauma, or constant night pain that does not ease with rest. If we ever suspect a red flag during your assessment, we will explain our concerns clearly and advise you to seek urgent medical care. If you are worried about severe symptoms now, contact NHS 111 or emergency services immediately.",
      },
      {
        q: "Why can night pain be a red flag?",
        a: "Many everyday aches and strains ease when you rest or change position. Pain that wakes you regularly at night, does not change with position, or is getting steadily worse despite sensible activity levels can sometimes indicate a more serious underlying problem. Night pain is particularly concerning if it is severe, constant and accompanied by other symptoms such as fever, night sweats, unexplained weight loss, a history of cancer, recent infection, trauma, or new bladder and bowel changes. If you report this kind of pattern to us, we will always consider whether medical review or further tests are needed before continuing with standard rehab.",
      },
      {
        q: "Will I need scans, X-rays or an MRI before starting physiotherapy?",
        a: "Many injuries can be assessed and safely managed without immediate imaging. During your assessment we will screen for any signs that suggest a scan is necessary — for example, significant trauma, red-flag symptoms, or failure to improve despite appropriate management. If we feel imaging would change your management or is important to rule out something serious, we will explain why and help you arrange it via your GP or consultant. In a lot of cases you can begin rehab confidently without a scan, and imaging is only used if progress is not as expected.",
      },
      {
        q: "When is physiotherapy not the right option?",
        a: "Physiotherapy is not appropriate for medical emergencies or serious illness. If you have sudden chest pain, shortness of breath, weakness in your face or one side of your body, new loss of bladder or bowel control, or a significant injury such as a suspected broken bone, you should seek urgent medical help via NHS 111, your GP, or emergency services. During your assessment we always screen for signs that you may need urgent medical review instead of, or in addition to, physiotherapy, and we will never hesitate to refer you on if we are concerned.",
      },
    ],
  },
  {
    slug: "access-and-costs",
    title: "NHS access, private costs & value",
    intro:
      "How NHS and private physiotherapy work together, what typical prices look like and how to decide which route suits you.",
    items: [
      {
        q: "How much do physiotherapists usually charge per hour?",
        a: "Private physiotherapy prices vary depending on the clinic, length of appointment and type of service. Across the UK, many sessions fall somewhere in the region of around £50–£90 for a standard appointment, with some clinics charging less and others more, especially in big cities. Initial assessments are often slightly longer and therefore more expensive than shorter follow-up sessions. At JT Football Physiotherapy we keep our pricing transparent — you can always see our current fees when you enquire or use our online booking system, and we will explain clearly what is included in each session length.",
      },
      {
        q: "How much is a 1-hour physiotherapy session likely to cost?",
        a: "A full 1-hour session with a private physiotherapist in the UK commonly sits somewhere between about £60 and £100, depending on location, therapist experience and whether it is an initial assessment or a review. Clinics in London and major cities tend to be at the higher end of the range, while smaller towns are often a little lower. Remember that the real value is not just the time in the room, but the clarity of the diagnosis, the quality of your rehab plan and the support you receive between appointments.",
      },
      {
        q: "Is it worth paying for private physiotherapy if NHS physio is available?",
        a: "NHS physiotherapy can be excellent, but waiting times and appointment frequency are often limited because services are under heavy demand. Private physiotherapy can usually offer faster access, longer sessions and more flexibility around your sport and schedule. Many people in Kilmarnock and across Ayrshire use private physio to get started quickly, then continue their exercises independently or with NHS support once they are on the right track. We are always honest about whether private treatment is likely to add value in your situation and we are happy to discuss how private and NHS input can work together.",
      },
      {
        q: "Can I get free physiotherapy through the NHS?",
        a: "Yes. In Scotland you can usually access NHS physiotherapy free of charge, either by being referred by your GP or, in many areas, by self-referring directly to the local musculoskeletal physiotherapy service. You normally need to be registered with a GP in the relevant health-board area. Availability, waiting times and the number of sessions offered are managed by the NHS, not by private clinics. If you are unsure how to access NHS physio, check NHS Inform or your local health board website for the most up-to-date information.",
      },
      {
        q: "Can you self-refer for physiotherapy in Scotland?",
        a: "In many parts of Scotland, including Ayrshire, adults with muscle, joint or back problems can self-refer directly to NHS physiotherapy services without seeing a GP first. The exact process varies by health board and may involve an online form, a telephone triage line or a downloadable paper form. This route usually applies to routine musculoskeletal problems; more complex conditions may still need GP or specialist involvement. Self-referral to the NHS is separate from private physiotherapy — you can book with JT Football Physiotherapy at any time without a referral.",
      },
      {
        q: "How long is the NHS waiting list for physiotherapy?",
        a: "Waiting times for NHS physiotherapy change regularly and depend on how busy local services are, the type of problem you have and how it is prioritised. Some people are seen within a few weeks, while others may wait several months, particularly for non-urgent musculoskeletal issues. Because we are a private clinic in Kilmarnock, we cannot control NHS waiting lists, but we can usually offer appointments much more quickly if you would like to start rehab sooner while remaining on the NHS list if you wish.",
      },
      {
        q: "What conditions does NHS physiotherapy usually treat?",
        a: "NHS physiotherapy services mainly focus on bone, joint, muscle and nerve problems such as back and neck pain, arthritis, sports injuries, post-operative rehab and long-term conditions that affect movement. Many health boards also provide specialist neurological, respiratory and paediatric physiotherapy. They are not an emergency service, and serious or sudden symptoms should be assessed urgently by medical teams instead. If you live in Ayrshire, your local NHS website will explain exactly what their physio service covers and how to access it.",
      },
    ],
  },
  {
    slug: "appointments-and-practicalities",
    title: "Appointments, practical details & what to expect",
    intro:
      "Everything from what happens in a session to what to wear, bring and ask so you feel prepared and confident.",
    items: [
      {
        q: "What can I expect from my first physiotherapy appointment?",
        a: "Your first session includes a detailed conversation about your injury story, previous episodes, what makes things better or worse, and what you want to get back to. We then complete a physical assessment to check mobility, strength, control and football demands, as well as any other activities that matter to you such as work tasks or family life. You will leave with a clear explanation, an honest time frame and an initial plan tailored to you, along with written or video exercise guidance so you know exactly what to do at home.",
      },
      {
        q: "How long are appointments at JT Football Physiotherapy in Kilmarnock?",
        a: "Initial assessments usually last around 45–60 minutes so we have time to understand your story properly, complete a thorough examination and begin treatment. Follow-up sessions are typically 30–45 minutes and focus on treatment, exercise progressions and checking your response to load. If you have a particularly complex situation or want extra time on-pitch, we can discuss longer sessions where appropriate.",
      },
      {
        q: "How often should I come to physiotherapy?",
        a: "How often you attend physiotherapy depends on your goals, injury severity and how you respond to treatment. Many people start with weekly sessions so we can progress exercises and adjust your plan quickly, then space appointments out as you become more confident. Others may only need a detailed assessment and an occasional review. We will agree the right frequency together and keep it under regular review so you are never attending more often than you need.",
      },
      {
        q: "Is one physio session a week enough?",
        a: "For a lot of musculoskeletal problems, one focused physio session per week combined with consistent home exercises is enough to make good progress. What matters most is what you do between sessions: following your plan, pacing your activities and communicating with us if things change. If your situation is more complex, very acute or linked to a return-to-sport deadline, we might briefly see you more often, then reduce the frequency once things are stable.",
      },
      {
        q: "What actually happens in a physiotherapy session?",
        a: "A typical session at JT Football Physiotherapy involves reviewing how things have been since your last visit, checking key movements and strength, and then using a mixture of education, hands-on treatment where appropriate, and targeted exercises. We might coach you through gym-based strength work, pitch-based drills or everyday tasks such as lifting, squatting or sitting at work. We finish by agreeing clear priorities for the week ahead so you know exactly what to focus on between sessions.",
      },
      {
        q: "What kind of exercises will I do in physiotherapy?",
        a: "Your exercises will depend on your assessment findings and goals, but common themes include strength work for the hips, knees, ankles and trunk; balance and control drills such as single-leg work; mobility exercises for stiff joints and soft tissues; and gradually more football-specific movements such as changes of direction, accelerations and decelerations. We will always demonstrate exercises clearly, check your technique and adjust the difficulty so that they feel challenging but achievable.",
      },
      {
        q: "What should I wear to my physiotherapy appointment?",
        a: "Wear comfortable clothing that allows you to move freely and lets us see and assess the area we are treating. For lower-limb or back issues, shorts or leggings are ideal; for upper-body or shoulder problems, a vest top or sports bra works well. Trainers are useful if we are looking at running or gym movements. You are always welcome to bring layers and change at the clinic so you feel comfortable and supported throughout the session.",
      },
      {
        q: "What should I bring to my first appointment?",
        a: "It helps if you bring any relevant scan or clinic letters, a list of medications if you take any, your training or match schedule, and clothing that allows you to move freely. If you use insoles, braces or other supports, bring those too so we can see what you normally wear. Most importantly, bring any questions or concerns you have — we will make time to answer them so that you leave feeling clear about the plan.",
      },
      {
        q: "What questions will my physiotherapist ask me?",
        a: "We will usually ask when and how your pain started, whether there was a specific injury, what makes symptoms better or worse, how it affects your sport, work and sleep, and whether you have had similar problems before. We will also ask about your general health, medication and any red-flag symptoms such as unexplained weight loss, fever or changes in bladder or bowel function. These questions help us work out what is driving your pain and whether physiotherapy is right for you.",
      },
      {
        q: "What questions should I ask my physiotherapist at my first visit?",
        a: "Useful questions include: what do you think is driving my pain, what activities should I change or avoid for now, what does a realistic recovery timeline look like, how will we know I am progressing, and what can I do between sessions to help myself. You might also want to ask how physio will fit around your team training, gym work or job demands. We encourage you to ask anything you are unsure about — understanding your plan is just as important as the exercises themselves.",
      },
      {
        q: "Are there any risks or downsides to physiotherapy?",
        a: "For most people, physiotherapy is very safe. The most common side effects are mild, short-lived increases in soreness or fatigue after treatment or new exercises. Problems usually arise when exercises are progressed too quickly, when serious underlying conditions are missed, or when expectations are not clear. We minimise these risks by screening for red flags, starting at an appropriate level, explaining what you should expect to feel, and encouraging open communication if anything does not feel right.",
      },
      {
        q: "Do you offer a free discovery call or consultation?",
        a: "Yes. We offer a free discovery session so you can talk through your situation, ask questions and decide whether physiotherapy with us is the right next step. This might take place by phone, video or in person depending on what works best. There is no pressure to book treatment — it is simply a chance to get clear, honest advice and to see whether we are the right fit for you.",
      },
      {
        q: "What is your cancellation and rescheduling policy?",
        a: "We ask for at least 24 hours’ notice if you need to cancel or reschedule an appointment. This helps us offer that time to someone else who may be waiting. If something unexpected comes up, contact us as early as possible and we will do our best to help. Repeated late cancellations or missed appointments may be charged, and we will always make this clear in advance.",
      },
    ],
  },
  {
    slug: "conditions-and-diagnosis",
    title: "Conditions we see, arthritis & diagnosis",
    intro:
      "What physiotherapy can help with, how it fits alongside medical care, and how we approach arthritis and other long-term issues.",
    items: [
      {
        q: "Do you treat injuries that are not football-related?",
        a: "Yes. While our background is strongly rooted in professional football, the principles we use apply across many sports and everyday life. We regularly help people with back, knee, hip, ankle, shoulder and other musculoskeletal issues that are not directly linked to football, as well as general activity-related pain such as gym injuries or work-related aches.",
      },
      {
        q: "What conditions can physiotherapy help with?",
        a: "Physiotherapy can help with a wide range of musculoskeletal issues, including ankle sprains, knee and ACL injuries, groin and hamstring strains, hip and lower-back pain, shoulder and neck problems, tendon issues, muscle tears and general overload from training. It is also useful after surgery such as ligament reconstructions or joint replacements, helping you regain strength, movement and confidence. If you are unsure whether your problem is appropriate for physio, you can contact us and we will give you honest guidance.",
      },
      {
        q: "Can physiotherapy help if I have arthritis?",
        a: "Yes. For most people with osteoarthritis, well-planned exercise, load management and education are key parts of treatment. Physiotherapy can help you build strength around the affected joints, improve confidence in movement and find the right balance between activity and rest. Many people with arthritis continue to stay active in sport and everyday life with the right support, and we will work with you to tailor your plan around flare-ups, work and family commitments.",
      },
      {
        q: "Can a physiotherapist diagnose arthritis or other conditions?",
        a: "Physiotherapists are trained to assess joints, muscles and movement and can often tell when your symptoms are consistent with conditions such as osteoarthritis, tendon problems or nerve irritation. We can explain our clinical impression and, if needed, liaise with your GP or consultant about further investigations like X-rays or blood tests. Diagnosis is a team effort — we focus on what you can do right now to move better and reduce pain, while medical teams handle tests and medication when required.",
      },
      {
        q: "What are the main types of physiotherapy?",
        a: "Broadly, physiotherapy is divided into musculoskeletal (muscles, joints, bones and sports injuries), neurological (conditions such as stroke or Parkinson's disease), and cardiorespiratory (heart and lung conditions). There are also specialist areas such as paediatric, pelvic health and oncology physiotherapy. At JT Football Physiotherapy we focus on musculoskeletal and sports physiotherapy for footballers and active people, but we can help signpost you to the right services if your needs fall into other areas.",
      },
    ],
  },
  {
    slug: "online-and-location",
    title: "Online sessions, location & who we work with",
    intro:
      "How to work with us in person or online and where our clients travel from.",
    items: [
      {
        q: "Do you offer online physiotherapy appointments?",
        a: "Yes. Online sessions are available and can work very well for assessment, education, exercise coaching and ongoing progressions — especially if you live further from Kilmarnock or have a busy schedule. We will tell you honestly if we feel an in-person session would be more appropriate, for example if we need to perform specific hands-on tests or treatments that cannot be done remotely.",
      },
      {
        q: "Where is the clinic based and who do you work with across Ayrshire?",
        a: "JT Football Physiotherapy is based in Kilmarnock and we regularly work with players and active people from across Ayrshire and surrounding areas. We see youth and adult footballers at all levels, as well as runners, gym enthusiasts and active adults who simply want to stay fit and pain-free. If you can travel to Kilmarnock or access us online, we can help you with a clear plan for pain, performance and long-term health.",
      },
    ],
  },
];

const faqs = faqSections.flatMap((section) => section.items);

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main>
        <section className="relative border-b border-slate-100 bg-[radial-gradient(at_20%_0%,rgba(0,138,252,0.16)_0%,transparent_60%)] py-16 pb-10">
          <div className="mx-auto max-w-6xl px-4">
            <FadeIn>
              <p className="mb-2.5 inline-block text-xs font-bold uppercase tracking-widest text-blue-600">
                FAQ
              </p>
              <h1 className="mb-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Physiotherapy FAQ for Players & Active People in Kilmarnock
              </h1>
              <p className="mb-6 max-w-3xl text-lg leading-relaxed text-slate-600">
                Honest, practical answers to the questions we are asked most often at JT Football Physiotherapy — from pain and rehab timelines to football-specific return-to-play, online sessions and what to expect at your first appointment.
              </p>
              <div className="flex flex-wrap gap-3" role="group" aria-label="FAQ primary actions">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-6 py-3 text-sm font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
                >
                  Ask a question about your injury
                </Link>
                <Link
                  href="/services/free-discovery-session"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-50 hover:shadow-lg"
                >
                  Learn about our free discovery session
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 lg:flex-row">
            <div className="w-full lg:w-2/3">
              <FadeIn>
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">
                  Physiotherapy FAQs by topic
                </h2>
                <p className="mb-6 text-slate-600">
                  Start here if you have questions about pain, recovery timelines, NHS versus private options, what actually happens in sessions and how physiotherapy at JT Football Physiotherapy in Kilmarnock can fit around your football and everyday life.
                </p>
                <div className="space-y-8">
                  {faqSections.map((section) => (
                    <section key={section.slug} className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                          {section.title}
                        </h3>
                        {section.intro && (
                          <p className="mt-1 text-sm text-slate-600">{section.intro}</p>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {section.items.map((item, index) => (
                          <details
                            key={`${section.slug}-${index}`}
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
                              <p className="m-0 text-sm whitespace-pre-line">{item.a}</p>
                            </div>
                          </details>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </FadeIn>
            </div>

            <aside className="w-full lg:w-1/3 space-y-5" aria-label="Need more support">
              <FadeIn>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold tracking-tight text-slate-900">
                    Still unsure what you need?
                  </h2>
                  <p className="mb-3 text-sm leading-relaxed text-slate-600">
                    If you are not sure whether your problem needs hands-on treatment, rehab exercises or just a change in training load, we can help you decide.
                  </p>
                  <ul className="mb-4 list-disc space-y-1 pl-4 text-sm text-slate-600">
                    <li>Quick triage of your situation</li>
                    <li>Honest guidance with no pressure</li>
                    <li>Clear next steps for your recovery</li>
                  </ul>
                  <Link
                    href="/services/free-discovery-session"
                    className="inline-flex items-center justify-center rounded-full border border-[#1e3a8a] bg-[#1e3a8a] px-5 py-2.5 text-xs font-bold leading-none text-white shadow-sm transition-all hover:-translate-y-px hover:bg-blue-800 hover:shadow-lg"
                  >
                    Book a free discovery session
                  </Link>
                </section>
              </FadeIn>

              <FadeIn>
                <section className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold tracking-tight text-slate-900">
                    New to JT Football Physiotherapy?
                  </h2>
                  <p className="mb-3 text-sm leading-relaxed text-slate-600">
                    Learn more about our football-first approach, who Jordan works with and how we support players and active people across Ayrshire.
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold leading-none text-slate-900 transition-all hover:-translate-y-px hover:bg-slate-50 hover:shadow-lg"
                  >
                    Read about our Kilmarnock clinic
                  </Link>
                </section>
              </FadeIn>
            </aside>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>

      <Footer />
    </div>
  );
}
