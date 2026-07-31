import Link from 'next/link';

const stats = [
  { label: 'Students supported', value: '1,250+' },
  { label: 'Qualified teachers', value: '48' },
  { label: 'Digital result access', value: '24/7' },
];

const modules = [
  { title: 'Student Portal', description: 'Students can sign in with a demo student ID, view results, calculate averages, and print their report.', href: '/portal' },
  { title: 'Teacher Dashboard', description: 'Teachers can add student scores, preview grades instantly, and save uploads for admin review.', href: '/teacher-dashboard' },
  { title: 'Admin Dashboard', description: 'Administrators can approve pending results, review school metrics, and monitor uploaded records.', href: '/admin' },
];

const programs = ['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-gradient-to-br from-emerald-950 via-green-800 to-emerald-600 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-8 lg:min-h-[680px] lg:flex-row lg:items-center lg:py-16">
          <div className="flex-1">
            <nav className="mb-16 flex items-center justify-between gap-4">
              <Link href="/" className="text-xl font-black tracking-tight">Intellect Schools</Link>
              <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
                <a href="#programs" className="hover:text-green-100">Programs</a>
                <a href="#modules" className="hover:text-green-100">Portals</a>
                <a href="#contact" className="hover:text-green-100">Contact</a>
              </div>
            </nav>

            <p className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              Admissions are open for 2026/2027
            </p>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
              A complete school website with working portals for students, teachers, and admins.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-green-50">
              Intellect Schools combines a professional public landing page with practical demo dashboards so visitors can explore admissions, result uploads, approvals, and student reports immediately after deployment.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/portal" className="rounded-xl bg-white px-6 py-3 font-bold text-green-800 shadow-lg hover:bg-green-50">
                Open Student Portal
              </Link>
              <Link href="/teacher-dashboard" className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10">
                Upload Results
              </Link>
            </div>
          </div>

          <div className="flex-1 rounded-3xl bg-white p-6 text-slate-950 shadow-2xl">
            <div className="rounded-2xl bg-green-50 p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-green-700">Live school snapshot</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="text-3xl font-black text-green-800">{stat.value}</div>
                    <div className="mt-1 text-sm font-medium text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 max-w-2xl">
          <p className="font-bold text-green-700">Academic programs</p>
          <h2 className="mt-2 text-3xl font-black">Learning pathways for every stage</h2>
          <p className="mt-3 text-slate-600">Use this section to present your school levels while the dashboard pages handle daily operations.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((program) => (
            <div key={program} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">{program}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Structured lessons, caring teachers, and regular performance updates.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modules" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 max-w-2xl">
            <p className="font-bold text-green-700">Functional pages</p>
            <h2 className="mt-2 text-3xl font-black">Everything needed for a working demo</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {modules.map((module) => (
              <Link key={module.href} href={module.href} className="rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-2xl font-black">{module.title}</h3>
                <p className="mt-4 min-h-24 text-sm leading-6 text-slate-600">{module.description}</p>
                <span className="mt-6 inline-flex font-bold text-green-700">Open page →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-slate-950 p-8 text-white md:p-12">
          <h2 className="text-3xl font-black">Ready to enroll or request a tour?</h2>
          <p className="mt-3 max-w-2xl text-slate-300">Contact the admissions office, then use the student, teacher, and admin pages above to demonstrate the digital school workflow.</p>
          <div className="mt-8 grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5"><strong>Phone:</strong> +234 800 123 4567</div>
            <div className="rounded-2xl bg-white/10 p-5"><strong>Email:</strong> admissions@intellectschools.edu</div>
            <div className="rounded-2xl bg-white/10 p-5"><strong>Address:</strong> 15 Knowledge Avenue</div>
          </div>
        </div>
      </section>
    </main>
  );
}
