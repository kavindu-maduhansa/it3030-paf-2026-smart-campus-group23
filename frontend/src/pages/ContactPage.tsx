import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineClock, HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2'

const CONTACT_EMAIL = 'operations@smartcampus.edu.lk'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#1F2937] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30'

const labelClass = 'text-sm font-medium text-[#94A3B8]'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Smart Campus] ${subject}`)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSent(true)
  }

  return (
    <div className="bg-[#020617]">
      <section
        className="relative overflow-hidden border-b border-[#1F2937] bg-gradient-to-b from-[#020617] via-[#050816] to-[#0a0f1c] px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8"
        aria-labelledby="contact-hero-heading"
      >
        <div
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#3B82F6]/15 blur-[100px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">Contact us</p>
          <h1
            id="contact-hero-heading"
            className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            We&apos;re here to <span className="text-[#3B82F6]">help</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
            Questions about facilities, bookings, or maintenance workflows? Send us a message and the
            operations team will get back to you.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="contact-form-heading">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <h2 id="contact-form-heading" className="text-xl font-bold text-white sm:text-2xl">
              Send a message
            </h2>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Opens your email app with your details filled in. Replace the address in code if you use a
              different inbox.
            </p>

            {sent && (
              <p
                className="mt-4 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-3 text-sm text-[#93C5FD]"
                role="status"
              >
                If your mail client did not open, email us directly at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@university.edu"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className={labelClass}>
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Lab booking question"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-y min-h-[8rem]`}
                  placeholder="How can we help?"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
                >
                  Send via email
                </button>
                <Link
                  to="/"
                  className="text-center text-sm font-semibold text-[#3B82F6] hover:text-blue-400 sm:text-left"
                >
                  ← Back to home
                </Link>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">Other ways to reach us</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex gap-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/25">
                  <HiOutlineEnvelope className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-1 text-sm text-[#94A3B8] transition-colors hover:text-[#3B82F6]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/25">
                  <HiOutlineMapPin className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Office</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">
                    Faculty of Computing, SLIIT
                    <br />
                    Sri Lanka
                  </p>
                </div>
              </li>
              <li className="flex gap-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/25">
                  <HiOutlineClock className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Response time</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    We aim to reply within <span className="text-white">2 business days</span> during term.
                  </p>
                </div>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  )
}
