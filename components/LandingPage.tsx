import Link from 'next/link';

const NAVY = '#1c2444';
const NAVY_DK = '#12172f';
const GOLD = '#d9a441';
const GOLD_DK = '#b7842b';
const MUTED = '#666c7c';
const LINE = '#e3e0d6';

const WHATSAPP_NUMBER = '2348126012398';
const CALL_NUMBER = '+2349033817381';
const EMAIL = 'ajalaelijah3@gmail.com';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to book a demo of SchoolOS."
)}`;

const CLIP = { clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' };

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
    setup: '₦150,000',
    term: '₦60,000',
    features: [
      'Your own custom domain',
      'Full website, admissions, results & report cards',
      'Staff logins with roles, 2FA & audit log',
    ],
    highlight: true,
  },
  {
    name: 'Premium',
    setup: '₦250,000',
    term: '₦100,000',
    features: [
      'Everything in Standard',
      'Online fee payment via Paystack',
      'Multi-campus support',
      'Priority support',
    ],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <main className="font-sans" style={{ background: '#f7f5ef', color: '#151a2c' }}>
      <section
        className="py-22 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY_DK} 0%, ${NAVY} 100%)` }}
      >
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span
            className="font-display mb-4 inline-flex text-xs font-bold uppercase tracking-[0.1em]"
            style={{ color: GOLD }}
          >
            For school proprietors
          </span>
          <h1 className="font-display text-white" style={{ fontSize: 'clamp(32px, 5vw, 54px)', lineHeight: 1.1 }}>
            The all-in-one platform to run your school online
          </h1>
          <p className="mx-auto mt-5 max-w-[56ch] text-[17px] leading-[1.65] text-white/80">
            Your own branded school website, admissions, results and staff logins, all on your own custom domain,
            and live in as little as 48 hours.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex items-center gap-2 py-4 px-7 text-[15px] font-bold"
              style={{ ...CLIP, background: GOLD, color: NAVY_DK }}
            >
              Book a demo on WhatsApp
            </a>
            <a
              href="#pricing"
              className="font-display inline-flex items-center border py-3.5 px-7 text-[15px] font-bold text-white"
              style={{ borderColor: 'rgba(255,255,255,.55)' }}
            >
              See pricing
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="wrap py-20 pb-6">
        <span className="font-display mb-4 inline-flex text-xs font-bold uppercase tracking-[0.1em]" style={{ color: GOLD_DK }}>
          What&apos;s included
        </span>
        <h2 className="mb-7 max-w-[24ch] text-[32px]">Everything your school needs, in one place</h2>
        <div className="schools-grid">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6.5" style={{ borderLeft: `4px solid ${GOLD}` }}>
              <h3 className="mb-2.5 text-[17px]">{f.title}</h3>
              <p className="m-0 text-sm leading-[1.6]" style={{ color: MUTED }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-20 text-center" style={{ background: NAVY_DK }}>
        <div className="wrap">
          <span className="font-display mb-4 inline-flex text-xs font-bold uppercase tracking-[0.1em]" style={{ color: GOLD }}>
            Pricing
          </span>
          <h2 className="mb-3 text-[32px] text-white">Simple, transparent pricing</h2>
          <p className="mx-auto mb-10 max-w-[52ch] text-[15px] text-white/70">
            A one-time setup fee, then a low termly subscription &mdash; and your first term is free, no card
            required. No hidden charges.
          </p>
          <div className="mx-auto grid max-w-[680px] grid-cols-1 gap-6 text-left md:grid-cols-2">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="relative p-9"
                style={
                  t.highlight
                    ? { background: NAVY, color: '#fff', borderTop: `4px solid ${GOLD}` }
                    : { background: '#fff', color: '#151a2c' }
                }
              >
                {t.highlight && (
                  <span
                    className="font-display absolute -top-3 left-7 text-[11px] font-extrabold tracking-[0.05em]"
                    style={{ background: GOLD, color: NAVY_DK, padding: '5px 14px' }}
                  >
                    RECOMMENDED
                  </span>
                )}
                <h3 className="text-[19px]">{t.name}</h3>
                <p className="font-display mt-4 text-2xl" style={{ color: t.highlight ? GOLD : NAVY }}>
                  {t.setup}
                </p>
                <p className="mt-0.5 text-[11.5px]" style={{ color: t.highlight ? 'rgba(255,255,255,.6)' : MUTED }}>
                  one-time setup
                </p>
                <p className="font-display mt-4 text-lg">{t.term} /term</p>
                <p className="mt-0.5 text-[11.5px]" style={{ color: t.highlight ? 'rgba(255,255,255,.6)' : MUTED }}>
                  hosting, maintenance &amp; support
                </p>
                <span
                  className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold"
                  style={{ color: t.highlight ? '#7ee787' : '#1a7f37' }}
                >
                  🟢 First term free &mdash; no card required
                </span>
                <ul className="mt-5 grid list-none gap-2.5 p-0 text-[13.5px]">
                  {t.features.map((f) => (
                    <li key={f} style={{ color: t.highlight ? 'rgba(255,255,255,.85)' : MUTED }}>
                      &#10003; {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="wrap py-20 text-center">
        <span className="font-display mb-4 inline-flex text-xs font-bold uppercase tracking-[0.1em]" style={{ color: GOLD_DK }}>
          Get started
        </span>
        <h2 className="mb-3.5 text-[32px]">Let&rsquo;s get your school online</h2>
        <p className="mx-auto mb-8 max-w-[52ch] text-[15px]" style={{ color: MUTED }}>
          Live in as little as 48 hours, with your name, your colors and your own domain. Your school, your way.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display inline-flex items-center gap-2 py-4 px-7 text-[15px] font-bold"
            style={{ ...CLIP, background: GOLD, color: NAVY_DK }}
          >
            WhatsApp: 0812 601 2398
          </a>
          <a
            href={`tel:${CALL_NUMBER}`}
            className="font-display inline-flex items-center border py-3.5 px-7 text-[14px] font-bold"
            style={{ borderColor: NAVY, color: NAVY }}
          >
            Call: 0903 381 7381
          </a>
          <Link
            href={`mailto:${EMAIL}`}
            className="font-display inline-flex items-center border py-3.5 px-7 text-[14px] font-bold"
            style={{ borderColor: LINE, color: '#151a2c' }}
          >
            {EMAIL}
          </Link>
        </div>
      </section>
    </main>
  );
}
