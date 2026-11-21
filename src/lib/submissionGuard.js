/**
 * Guards against accidentally sending the same registration twice
 * (e.g. "Дахин бүртгүүлэх" + re-typing, or reloading and submitting again).
 *
 * Only a short hash of name + phone + topic is kept, in sessionStorage
 * (this browser tab only) for 30 minutes — never the personal data itself.
 * Falls back to memory when storage is unavailable (private mode, blocked).
 */
const STORAGE_KEY = 'tme:recent-registrations'
const WINDOW_MS = 30 * 60 * 1000
let memoryStore = []

function fingerprint({ name, phone, topic }) {
  const text = [name.toLowerCase(), phone.replace(/\D/g, ''), topic].join('|')
  let hash = 0x811c9dc5 // FNV-1a, 32-bit
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16)
}

function readEntries() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return memoryStore
  }
}

function writeEntries(entries) {
  memoryStore = entries
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* storage unavailable — the in-memory copy still protects this page view */
  }
}

export function isRecentSubmission(data, now = Date.now()) {
  const id = fingerprint(data)
  return readEntries().some((entry) => entry && entry.id === id && now - entry.at < WINDOW_MS)
}

export function rememberSubmission(data, now = Date.now()) {
  const fresh = readEntries().filter((entry) => entry && now - entry.at < WINDOW_MS)
  fresh.push({ id: fingerprint(data), at: now })
  writeEntries(fresh.slice(-20))
}
