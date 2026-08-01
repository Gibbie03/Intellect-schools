import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:py-20">
        <div className="flex-1">
          <p className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
            Welcome to Intellect Schools
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-6xl">
            Building confident learners for a brighter future.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Intellect Schools combines academic excellence, digital learning, and transparent result management for students, parents, teachers, and administrators.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/admissions" className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow hover:bg-green-800">
              Apply for Admission
            </Link>
            <Link href="/portal" className="rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 hover:bg-green-50">
              Student Portal
            </Link>
            <Link href="/contact" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-white">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
