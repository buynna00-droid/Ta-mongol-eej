import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2, Send } from 'lucide-react'
import { MESSENGER_URL, formspree as defaultFormspree } from '../config/site.js'
import { LIMITS, TOPICS, VALIDATED_FIELDS, validateField, validateRegistration } from '../lib/registration.js'
import { submitToFormspree } from '../lib/formspree.js'
import { isRecentSubmission, rememberSubmission } from '../lib/submissionGuard.js'

const EMPTY_FORM = { name: '', phone: '', topic: '', message: '', _gotcha: '' }
const REQUEST_TIMEOUT_MS = 20000

const SUCCESS_MESSAGE = 'Таны бүртгэл амжилттай илгээгдлээ. Бид тантай удахгүй холбогдох болно!'

const SUBMIT_ERRORS = {
  config: 'Онлайн бүртгэл одоогоор идэвхжээгүй тул таны мэдээлэл илгээгдсэнгүй. Та Messenger-ээр бидэнтэй шууд холбогдож бүртгүүлнэ үү.',
  duplicate: 'Энэ бүртгэл саяхан амжилттай илгээгдсэн тул давхар илгээсэнгүй. Мэдээллээ өөрчлөх бол Messenger-ээр холбогдоорой.',
  offline: 'Таны төхөөрөмж интернэтэд холбогдоогүй байна. Холболтоо шалгаад дахин оролдоно уу.',
  network: 'Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгаад дахин оролдоно уу.',
  timeout: 'Сервер хариу өгөхгүй удаж байна. Хэсэг хугацааны дараа дахин оролдоно уу.',
  rateLimit: 'Хэт олон удаа илгээсэн байна. Түр хүлээгээд дахин оролдоно уу.',
  server: 'Бүртгэлийн үйлчилгээ түр ажиллахгүй байна. Хэсэг хугацааны дараа дахин оролдоно уу.',
  rejected: 'Бүртгэлийг одоогоор хүлээн авах боломжгүй байна. Та Messenger-ээр бидэнтэй холбогдоно уу.'
}

const fieldId = (name) => `registration-${name}`
const errorId = (name) => `registration-${name}-error`

export default function RegistrationForm({ formspree = defaultFormspree }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [submitError, setSubmitError] = useState(null)
  const [submittedName, setSubmittedName] = useState('')

  const inFlightRef = useRef(false) // synchronous lock: blocks double clicks / repeated Enter
  const mountedRef = useRef(false)
  const abortRef = useRef(null)
  const formRef = useRef(null)
  const alertRef = useRef(null)
  const successHeadingRef = useRef(null)

  const isConfigured = formspree.status === 'ok'
  const isSubmitting = status === 'submitting'

  // Abort a pending request if the component goes away.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus()
  }, [status])

  useEffect(() => {
    if (submitError) alertRef.current?.focus()
  }, [submitError])

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    // Re-check a field that already shows an error, so the message clears as it is fixed.
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        const error = validateField(name, value)
        if (error) next[name] = error
        else delete next[name]
        return next
      })
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (inFlightRef.current) return
    setSubmitError(null)

    const { errors: fieldErrors, data } = validateRegistration(form)
    if (!data) {
      setErrors(fieldErrors)
      const firstInvalid = VALIDATED_FIELDS.find((field) => fieldErrors[field])
      formRef.current?.elements.namedItem(firstInvalid)?.focus()
      return
    }
    setErrors({})

    if (!isConfigured) {
      setSubmitError('config')
      return
    }
    if (isRecentSubmission(data)) {
      setSubmitError('duplicate')
      return
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setSubmitError('offline')
      return
    }

    inFlightRef.current = true
    setStatus('submitting')
    const controller = new AbortController()
    abortRef.current = controller
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      await submitToFormspree(
        formspree.endpoint,
        {
          name: data.name,
          phone: data.phone,
          topic: data.topic,
          message: data.message,
          _subject: `Шинэ бүртгэл: ${data.topic} — ${data.name}`,
          _gotcha: form._gotcha // honeypot: Formspree silently drops submissions that fill it
        },
        { signal: controller.signal }
      )
      rememberSubmission(data)
      if (!mountedRef.current) return
      setSubmittedName(data.name)
      setStatus('success')
    } catch (error) {
      if (!mountedRef.current) return
      console.warn('[Бүртгэл] Илгээж чадсангүй:', error?.kind || error, error?.details || '')
      setSubmitError(SUBMIT_ERRORS[error?.kind] ? error.kind : 'network')
      setStatus('idle')
    } finally {
      clearTimeout(timeout)
      inFlightRef.current = false
    }
  }

  const reset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitError(null)
    setSubmittedName('')
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className="success-state" role="status">
        <CheckCircle2 size={42} strokeWidth={1.3} aria-hidden="true" />
        <h3 ref={successHeadingRef} tabIndex={-1}>Баярлалаа, <em>{submittedName}</em>!</h3>
        <p>{SUCCESS_MESSAGE}</p>
        <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="solid-button">
          Messenger-ээр шууд холбогдох <ArrowUpRight size={15} />
        </a>
        <button type="button" className="reset-link" onClick={reset}>Дахин бүртгүүлэх</button>
      </div>
    )
  }

  const fieldProps = (name) => ({
    id: fieldId(name),
    name,
    value: form[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? errorId(name) : undefined
  })
  const fieldError = (name) =>
    errors[name] ? <span className="field-error" id={errorId(name)}>{errors[name]}</span> : null

  return (
    <>
      <div className="eyebrow"><span /> СУРГАЛТАД НЭГДЭХ</div>
      <h3>Сургалтад<br /><em>бүртгүүлэх</em></h3>
      <p className="form-intro">Мэдээллээ үлдээгээрэй. Бид тантай удахгүй холбогдоно.</p>

      {!isConfigured && (
        <div className="form-notice" role="note">
          <p>Онлайн бүртгэл одоогоор идэвхжээгүй байна. Та Messenger-ээр бидэнтэй шууд холбогдож бүртгүүлэх боломжтой.</p>
          {import.meta.env.DEV && (
            <p className="form-notice-dev">
              Хөгжүүлэгчид: VITE_FORMSPREE_ENDPOINT {formspree.status === 'invalid' ? 'буруу форматтай' : 'тохируулагдаагүй'} байна (README.md → Formspree).
            </p>
          )}
          <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer">
            Messenger-ээр бүртгүүлэх <ArrowUpRight size={13} />
          </a>
        </div>
      )}

      <form ref={formRef} onSubmit={submit} noValidate aria-busy={isSubmitting}>
        <label htmlFor={fieldId('name')}>Эцэг/эхийн нэр
          <input {...fieldProps('name')} placeholder="Таны нэр" autoComplete="name" maxLength={LIMITS.nameMax} required />
        </label>
        {fieldError('name')}

        <label htmlFor={fieldId('phone')}>Утасны дугаар
          <input {...fieldProps('phone')} type="tel" placeholder="Жишээ: 9911 2233" inputMode="tel" autoComplete="tel" maxLength={24} required />
        </label>
        {fieldError('phone')}

        <label htmlFor={fieldId('topic')}>Сонгох чиглэл
          <select {...fieldProps('topic')} required>
            <option value="" disabled>Чиглэлээ сонгоно уу</option>
            {TOPICS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </label>
        {fieldError('topic')}

        <label htmlFor={fieldId('message')}>Нэмэлт мэдээлэл
          <textarea {...fieldProps('message')} placeholder="Танд сонирхож буй зүйл байвал бичээрэй..." rows="3" maxLength={LIMITS.messageMax} />
        </label>
        {fieldError('message')}

        {/* Honeypot for spam bots — hidden from people and assistive technology. */}
        <div className="hp-field" aria-hidden="true">
          <label>Энэ талбарыг хоосон үлдээнэ үү
            <input type="text" name="_gotcha" value={form._gotcha} onChange={update} tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {submitError && (
          <div className="form-alert" role="alert" ref={alertRef} tabIndex={-1}>
            <p>{SUBMIT_ERRORS[submitError]}</p>
            <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer">
              Messenger-ээр холбогдох <ArrowUpRight size={13} />
            </a>
          </div>
        )}

        <button className="solid-button form-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? <>Илгээж байна… <Loader2 size={15} className="spin" aria-hidden="true" /></>
            : <>Бүртгэл илгээх <Send size={15} aria-hidden="true" /></>}
        </button>
      </form>

      <small className="privacy-note">
        Таны мэдээллийг зөвхөн тантай холбогдоход ашиглана.
        {isConfigured && ' Бүртгэлийн мэдээлэл Formspree үйлчилгээгээр дамжин илгээгдэнэ.'}
      </small>
    </>
  )
}
