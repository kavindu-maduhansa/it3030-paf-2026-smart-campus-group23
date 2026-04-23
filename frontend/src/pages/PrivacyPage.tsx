export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#1F2937] bg-[#0B1224] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#60A5FA]">Smart Campus</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#94A3B8]">
          We respect your privacy and handle your information responsibly while you use campus services.
        </p>
        <p className="mt-2 text-xs text-[#64748B]">Last updated: April 2026</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">What We Collect</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            Account details, booking requests, and maintenance submissions needed to run Smart Campus workflows.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">How We Use Data</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            To authenticate users, process reservations, support approvals, and provide service-related updates.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">Data Sharing</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            We do not sell personal information. Data access is limited to authorized campus operations.
          </p>
        </section>
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">Your Rights</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            You can request updates or corrections to profile information through support channels.
          </p>
        </section>
      </div>
    </div>
  )
}
