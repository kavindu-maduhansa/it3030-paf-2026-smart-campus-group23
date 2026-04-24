import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineClock, HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import {
  deleteContactMessage,
  getContactMessages,
  markContactMessageAsRead,
  sendContactMessage,
  type ContactMessageItem,
} from '../services/contactService'
import type { AxiosError } from 'axios'

const CONTACT_EMAIL = 'operations@smartcampus.edu.lk'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#1F2937] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30'

const labelClass = 'text-sm font-medium text-[#94A3B8]'

function normalizeMessageId(rawId: unknown): string {
  if (typeof rawId === 'string') return rawId
  if (rawId && typeof rawId === 'object') {
    const maybeOid = (rawId as { $oid?: unknown }).$oid
    if (typeof maybeOid === 'string') return maybeOid
    const value = String(rawId)
    if (value && value !== '[object Object]') return value
  }
  return ''
}

export default function ContactPage() {
  const { isAuthenticated, user } = useAuth()
  const normalizedRole = user?.role?.toUpperCase() || ''
  const canSendMessage = normalizedRole !== 'ADMIN'
  const isAdmin = normalizedRole === 'ADMIN'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sentMode, setSentMode] = useState<'ticket' | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null)
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSendMessage) return

    setSubmitError(null)
    setSent(false)
    setSentMode(null)

    const submittedName = (name || user?.name || '').trim()
    const submittedEmail = (email || user?.email || '').trim()

    try {
      setSubmitting(true)
      await sendContactMessage({
        name: submittedName,
        email: submittedEmail,
        subject: subject.trim(),
        message: message.trim(),
      })
      setSentMode('ticket')
      setSent(true)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>
      const serverMessage =
        axiosErr.response?.data?.message || axiosErr.response?.data?.error || axiosErr.message
      setSubmitError(serverMessage || 'Could not send your message right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const loadMessages = async () => {
      if (!isAdmin) return
      try {
        setMessagesLoading(true)
        setMessagesError(null)
        const response = await getContactMessages()
        const normalized = response.data
          .map((item) => ({
            ...item,
            _id: normalizeMessageId(item.id) || normalizeMessageId(item._id),
          }))
          .filter((item) => item._id)
        setContactMessages(normalized)
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>
        const status = axiosErr.response?.status
        if (status === 404 || status === 405) {
          setMessagesError('Contact messages API not available yet. Restart backend and try again.')
        } else if (status === 403) {
          setMessagesError('Only administrators can view contact messages.')
        } else {
          setMessagesError(axiosErr.response?.data?.message || 'Could not load contact messages')
        }
      } finally {
        setMessagesLoading(false)
      }
    }
    loadMessages()
  }, [isAdmin])

  const handleMarkAsRead = async (id: string) => {
    try {
      setUpdatingMessageId(id)
      await markContactMessageAsRead(id)
      setContactMessages((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                read: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      )
      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, read: true, readAt: new Date().toISOString() } : prev))
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setMessagesError(axiosErr.response?.data?.message || 'Could not mark message as read')
    } finally {
      setUpdatingMessageId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setUpdatingMessageId(id)
      await deleteContactMessage(id)
      setContactMessages((prev) => prev.filter((item) => item._id !== id))
      if (selectedMessage?._id === id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>
      setMessagesError(axiosErr.response?.data?.message || 'Could not delete message')
    } finally {
      setUpdatingMessageId(null)
    }
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
            <div className="relative flex items-center justify-center">
              <Link
                to="/"
                className="absolute left-0 text-left text-sm font-semibold text-[#3B82F6] hover:text-blue-400"
              >
                ← Back to home
              </Link>
              <h2 id="contact-form-heading" className="text-xl font-bold text-white sm:text-2xl">
                Send a message
              </h2>
            </div>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Submit your message directly to the system. It will be stored in the database immediately.
            </p>
            {isAuthenticated && !canSendMessage ? (
              <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Contact form messaging is currently disabled for administrator accounts.
              </p>
            ) : null}

            {sent && (
              <p
                className="mt-4 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-3 text-sm text-[#93C5FD]"
                role="status"
              >
                {sentMode === 'ticket'
                  ? 'Your message has been submitted successfully. Our team will get back to you soon.'
                  : null}
              </p>
            )}
            {submitError ? (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </p>
            ) : null}

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
                    value={name || user?.name || ''}
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
                    value={email || user?.email || ''}
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
                  disabled={!canSendMessage || submitting}
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] disabled:cursor-not-allowed disabled:bg-[#334155] disabled:text-[#94A3B8] disabled:shadow-none"
                >
                  {submitting ? 'Sending...' : 'Send message'}
                </button>
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-[#334155] px-8 text-base font-semibold text-[#CBD5E1] transition-colors hover:border-[#475569] hover:text-white sm:ml-auto"
                  >
                    Login
                  </Link>
                ) : null}
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

        {isAdmin ? (
          <div className="mx-auto mt-12 max-w-6xl">
            <h2 className="text-lg font-semibold text-white">Contact messages</h2>
            <div className="mt-4 space-y-3">
              {messagesLoading ? (
                <p className="rounded-2xl border border-[#1F2937] bg-[#111827] px-4 py-3 text-sm text-[#94A3B8]">
                  Loading messages...
                </p>
              ) : null}
              {messagesError ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {messagesError}
                </p>
              ) : null}
              {!messagesLoading && !messagesError && contactMessages.length === 0 ? (
                <p className="rounded-2xl border border-[#1F2937] bg-[#111827] px-4 py-3 text-sm text-[#94A3B8]">
                  No contact messages yet.
                </p>
              ) : null}
              {!messagesLoading && !messagesError
                ? contactMessages.slice(0, 6).map((item) => (
                    <article key={item._id} className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.subject}</p>
                        <div className="flex items-center gap-2">
                          {!item.read ? (
                            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#93C5FD]">
                              New
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                              Read
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(item)}
                            className="rounded-lg border border-[#334155] px-2.5 py-1 text-xs font-semibold text-[#CBD5E1] transition-colors hover:border-[#475569] hover:text-white"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(item.read) || updatingMessageId === item._id}
                            onClick={() => handleMarkAsRead(item._id)}
                            className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-400/50 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mark as read
                          </button>
                          <button
                            type="button"
                            disabled={updatingMessageId === item._id}
                            onClick={() => handleDelete(item._id)}
                            className="rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-semibold text-red-300 transition-colors hover:border-red-400/50 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-[#64748B]">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#94A3B8]">
                        {item.name} ({item.email})
                      </p>
                      <p className="mt-2 text-sm text-[#CBD5E1]">{item.message}</p>
                    </article>
                  ))
                : null}
            </div>
          </div>
        ) : null}
      </section>

      {selectedMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedMessage.subject}</h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {selectedMessage.name} ({selectedMessage.email})
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg border border-[#334155] px-3 py-1.5 text-sm font-semibold text-[#CBD5E1] transition-colors hover:border-[#475569] hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mt-5 rounded-xl border border-[#1F2937] bg-[#0f172a] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#CBD5E1]">
                {selectedMessage.message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
