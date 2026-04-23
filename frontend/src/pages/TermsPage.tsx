export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#1F2937] bg-[#0B1224] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#60A5FA]">Smart Campus</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-[#94A3B8]">
          By using this platform, you agree to follow the campus booking and support policies.
        </p>
        <p className="mt-2 text-xs text-[#64748B]">Last updated: April 2026</p>
      </div>

      <div className="mt-6 space-y-4">
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">1. Account Responsibility</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            Users must provide accurate details and keep credentials secure.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">2. Booking Conduct</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            False requests, misuse of facilities, and repeated no-shows may lead to restrictions.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">3. Admin Decisions</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            Booking approvals, rejections, and cancellations are handled according to campus policy.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">4. Policy Updates</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            Terms may be updated when operational or legal requirements change.
          </p>
        </section>
      </div>
    </div>
  )
}
