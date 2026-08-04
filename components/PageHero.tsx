'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  sectionClassName = 'py-12',
  wrapStyle,
  titleClassName = '',
  titleStyle,
  subtitleClassName = 'mt-3.5 text-[15.5px] text-white/80',
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  sectionClassName?: string;
  wrapStyle?: React.CSSProperties;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
  subtitleClassName?: string;
}) {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/school')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.heroImageUrl) setHeroImageUrl(data.heroImageUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`relative overflow-hidden ${sectionClassName}`}>
      {heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={heroImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={
          heroImageUrl
            ? {
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--ink) 90%, black) 0%, color-mix(in srgb, var(--brand-color) 80%, black) 100%)',
                opacity: 0.82,
              }
            : {
                background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 35%, black) 100%)',
              }
        }
      />
      <div className="wrap relative z-10" style={wrapStyle}>
        <span className="tag tag-light">{eyebrow}</span>
        <h1 className={`text-white ${titleClassName}`} style={titleStyle}>
          {title}
        </h1>
        {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
      </div>
    </section>
  );
}
