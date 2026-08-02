import Link from 'next/link';

const WHATSAPP_NUMBER = '2348126012398';
const CALL_NUMBER = '+2349033817381';
const EMAIL = 'ajalaelijah3@gmail.com';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to book a demo of SchoolOS."
)}`;

const features = [
  {
    title: 'Professional Website',
    desc: 'Admissions, news & events, photo gallery, and contact — always up to date.',
  },
  {
    title: 'Student Results Portal',
    desc: 'Students and parents check results online, by term and session.',
  },
  {
    title: 'Teacher Result Upload',
    desc: 'Upload one result or a whole class at once — no spreadsheets.',
  },
  {
    title: 'Admin Dashboard',
    desc: 'Review results, manage admissions, and oversee every module from one screen.',
  },
  {
    title: 'Admissions + Auto Student ID',
    desc: 'Accept an application and a student ID is issued automatically.',
  },
  {
    title: 'Your Own Custom Domain',
    desc: 'Every school on SchoolOS gets its own domain — www.yourschool.com — included in every plan.',
  },
];

const tiers = [
  {
    name: 'Standard',
    setup: '₦200,000–250,000',
    term: '₦60,000',
    features: ['Your own custom domain', 'Custom brand colors, tagline & hero photo', 'Up to 25 staff accounts'],
    highlight: true,
  },
  {
    name: 'Premium',
    setup: '₦400,000+',
    term: '₦100,000',
    features: ['Everything in Standard', 'Unlimited staff accounts', 'Priority support & 24-hour setup', 'Up to 3 custom features built on request'],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#1E2761]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#F2B134]">
            For school proprietors
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            The all-in-one platform to run your school online
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#CADCFC]">
            Your own branded school website, admissions, results, and staff logins — with your own custom domain,
            live in as little as 48 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#F2B134] px-6 py-3 font-semibold text-[#1E2761] shadow hover:brightness-95"
            >
              Book a Demo on WhatsApp
            </a>
            <a
              href="#pricing"
              className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              See Pricing
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-extrabold text-gray-950">Everything your school needs, in one place</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
          One system for your website, admissions, results, and staff — no more paperwork, no more calling the office.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-gray-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-950">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-950">Simple, transparent pricing</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            A one-time setup fee, then a low termly subscription. No hidden charges.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:max-w-3xl md:mx-auto">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl p-8 shadow ${
                  t.highlight ? 'bg-[#1E2761] text-white ring-2 ring-[#F2B134]' : 'bg-white text-gray-950'
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F2B134] px-4 py-1 text-xs font-bold text-[#1E2761]">
                    RECOMMENDED
                  </span>
                )}
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className={`mt-4 text-2xl font-extrabold ${t.highlight ? 'text-[#F2B134]' : 'text-[#1E2761]'}`}>
                  {t.setup}
                </p>
                <p className={`text-xs ${t.highlight ? 'text-[#CADCFC]' : 'text-gray-500'}`}>one-time setup</p>
                <p className="mt-4 text-lg font-bold">{t.term} /term</p>
                <p className={`text-xs ${t.highlight ? 'text-[#CADCFC]' : 'text-gray-500'}`}>hosting, maintenance &amp; support</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className={t.highlight ? 'text-[#CADCFC]' : 'text-gray-600'}>
                      &#10003; {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-gray-950">Let&rsquo;s get your school online</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Live in as little as 48 hours — your name, your colors, your own domain, your school.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#1E2761] px-6 py-3 font-semibold text-white shadow hover:brightness-90"
          >
            WhatsApp: 0812 601 2398
          </a>
          <a
            href={`tel:${CALL_NUMBER}`}
            className="rounded-xl border border-[#1E2761] px-6 py-3 font-semibold text-[#1E2761] hover:bg-gray-50"
          >
            Call: 0903 381 7381
          </a>
          <Link
            href={`mailto:${EMAIL}`}
            className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-50"
          >
            {EMAIL}
          </Link>
        </div>
      </section>
    </main>
  );
}
