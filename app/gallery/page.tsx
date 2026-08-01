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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold">Gallery</h1>
      <p className="mt-3 text-gray-600">A look at life at Intellect Schools.</p>

      {loading && <p className="mt-10 text-gray-500">Loading...</p>}
      {error && <p className="mt-10 text-red-600">{error}</p>}
      {!loading && !error && images.length === 0 && (
        <p className="mt-10 text-gray-500">No photos have been added to the gallery yet.</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <figure key={image.id} className="overflow-hidden rounded-2xl bg-white shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.image_url} alt={image.caption ?? 'School gallery photo'} className="h-56 w-full object-cover" />
            {image.caption && <figcaption className="p-4 text-sm text-gray-600">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </div>
  );
}
