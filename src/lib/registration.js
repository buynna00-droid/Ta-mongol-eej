/**
 * Registration form rules: field validation and normalisation.
 * Error messages are shown to visitors, so they are in Mongolian.
 */

export const TOPICS = ['Судар, ном', 'Ардын ухаан', 'Сургалт']

export const LIMITS = { nameMin: 2, nameMax: 80, messageMax: 1000 }

const PHONE_EXAMPLE = 'жишээ: 9911 2233 эсвэл +976 9911 2233'

/**
 * Accepts Mongolian numbers in the usual ways people type them:
 *   "9911 2233", "9911-2233", "(+976) 9911 2233", "976 99112233", "00976 99112233"
 * National numbers have 8 digits and never start with 0.
 * Numbers that start with "+" and a different country code (diaspora parents)
 * are accepted in international form with 8–15 digits.
 */
export function normalizePhone(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return { ok: false, reason: 'empty' }
  if (!/^\(?\+?[\d\s().-]+$/.test(raw)) return { ok: false, reason: 'format' }

  const digits = raw.replace(/\D/g, '')
  const international = raw.replace(/^\(/, '').startsWith('+')
  let national

  if (international) {
    if (!digits.startsWith('976')) {
      return digits.length >= 8 && digits.length <= 15
        ? { ok: true, value: `+${digits}` }
        : { ok: false, reason: 'format' }
    }
    national = digits.slice(3)
  } else if (digits.startsWith('00976')) {
    national = digits.slice(5)
  } else if (digits.length === 11 && digits.startsWith('976')) {
    national = digits.slice(3)
  } else {
    national = digits
  }

  if (!/^[1-9]\d{7}$/.test(national)) return { ok: false, reason: 'format' }
  return { ok: true, value: `+976 ${national.slice(0, 4)} ${national.slice(4)}` }
}

const collapseSpaces = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

export function validateField(name, value) {
  switch (name) {
    case 'name': {
      const text = collapseSpaces(value)
      if (!text) return 'Эцэг/эхийн нэрээ оруулна уу.'
      if (text.length < LIMITS.nameMin) return 'Нэр хэт богино байна.'
      if (text.length > LIMITS.nameMax) return `Нэр ${LIMITS.nameMax} тэмдэгтээс хэтрэхгүй байна.`
      if (!/\p{L}/u.test(text)) return 'Нэрээ үсгээр бичнэ үү.'
      return null
    }
    case 'phone': {
      const result = normalizePhone(value)
      if (result.ok) return null
      return result.reason === 'empty'
        ? 'Утасны дугаараа оруулна уу.'
        : `Утасны дугаар буруу байна. 8 оронтой дугаараа оруулна уу (${PHONE_EXAMPLE}).`
    }
    case 'topic':
      return TOPICS.includes(value) ? null : 'Сонирхож буй чиглэлээ сонгоно уу.'
    case 'message':
      return String(value ?? '').trim().length > LIMITS.messageMax
        ? `Нэмэлт мэдээлэл ${LIMITS.messageMax} тэмдэгтээс хэтрэхгүй байна.`
        : null
    default:
      return null
  }
}

export const VALIDATED_FIELDS = ['name', 'phone', 'topic', 'message']

/** Returns field errors (empty object when valid) and the cleaned data to submit. */
export function validateRegistration(form) {
  const errors = {}
  for (const field of VALIDATED_FIELDS) {
    const error = validateField(field, form[field])
    if (error) errors[field] = error
  }
  if (Object.keys(errors).length > 0) return { errors, data: null }

  return {
    errors,
    data: {
      name: collapseSpaces(form.name),
      phone: normalizePhone(form.phone).value,
      topic: form.topic,
      message: String(form.message ?? '').trim()
    }
  }
}
