import Link from 'next/link';

const features = [
  'Student results portal',
  'Teacher result uploads',
  'Admin approvals dashboard',
  'Admissions and school information',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
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
            <Link href="/portal" className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow hover:bg-green-800">
              Student Portal
            </Link>
            <Link href="/teacher-dashboard" className="rounded-xl border border-green-700 px-6 py-3 font-semibold text-green-800 hover:bg-green-50">
              Teacher Dashboard
            </Link>
            <Link href="/admin" className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-white">
              Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="flex-1 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <h2 className="text-2xl font-bold text-gray-950">Website modules</h2>
          <div className="mt-6 grid gap-4">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 font-medium text-gray-700">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
