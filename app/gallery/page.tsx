'use client';

import { useEffect, useState } from 'react';

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setImages(data.images);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section
        className="py-13"
        style={{ background: 'linear-gradient(135deg, var(--ink) 0%, color-mix(in srgb, var(--brand-color) 70%, black) 100%)' }}
      >
        <div className="wrap">
          <span className="tag tag-light">Campus life</span>
          <h1 className="text-white" style={{ fontSize: 'clamp(30px, 4.5vw, 46px)', lineHeight: 1.1 }}>
            A term, in pictures
          </h1>
          <p className="mt-4 max-w-[60ch] text-base leading-[1.6] text-white/80">
            Academics, athletics, performances and the everyday life of the school.
          </p>
        </div>
      </section>

      <section className="wrap py-16">
        {loading && <p className="text-[var(--muted)]">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && images.length === 0 && (
          <p className="text-[var(--muted)]">No photos have been added to the gallery yet.</p>
        )}

        <div className="schools-grid">
          {images.map((image) => (
            <figure key={image.id} className="frame m-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url}
                alt={image.caption ?? 'School gallery photo'}
                className="aspect-[4/3] w-full object-cover"
              />
              {image.caption && (
                <figcaption className="mt-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-[var(--muted)]">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
