/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ТОХИРГОО — Та Монгол Ээж вэбсайтын гадаад холболтууд                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Бодит утгуудыг кодонд бус, environment variable-аар өгнө:
 *   • Локал:          төслийн үндсэн хавтаст `.env` файл (`.env.example`-ийг хуулж үүсгэнэ)
 *   • Vercel/Netlify: Project → Settings → Environment Variables
 * `VITE_` угтвартай утгууд build хийх үед вэбсайтын JavaScript-д шингэдэг
 * (нийтэд харагдана) — тиймээс нууц түлхүүр, нууц үг энд хэзээ ч бүү оруул.
 * Утга өөрчилсний дараа dev server-ээ дахин эхлүүлэх / дахин deploy хийх шаардлагатай.
 * Дэлгэрэнгүй: README.md
 */
import { parseEmbedCode } from '../lib/embedCode.js'

/* ── 1) Албан ёсны Facebook хуудас ба Messenger ─────────────────────── */
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/TaMongolEej'
export const MESSENGER_URL = 'https://m.me/TaMongolEej'

/* ── 2) Бүртгэлийн маягт — Formspree ─────────────────────────────────
 * .env:  VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/<таны-form-id>
 * Тохируулаагүй эсвэл буруу бол маягт мэдээллийг ИЛГЭЭХГҮЙ, харин
 * зочдод Messenger-ээр холбогдохыг санал болгоно.
 */
const FORMSPREE_ENDPOINT_PATTERN = /^https:\/\/formspree\.io\/(?:p\/[\w-]+\/)?f\/[\w-]+\/?$/i

export function parseFormspreeEndpoint(value) {
  const endpoint = typeof value === 'string' ? value.trim() : ''
  if (!endpoint) return { status: 'missing' }
  if (/YOUR_FORM_ID/i.test(endpoint) || !FORMSPREE_ENDPOINT_PATTERN.test(endpoint)) {
    return { status: 'invalid', value: endpoint }
  }
  return { status: 'ok', endpoint }
}

export const formspree = parseFormspreeEndpoint(import.meta.env.VITE_FORMSPREE_ENDPOINT)

/* ── 3) Зургийн цомгийн виджет — SociableKit / Elfsight ──────────────
 * SociableKit эсвэл Elfsight-аас авсан embed кодыг БҮХЛЭЭР нь (div + script)
 *   а) .env файлд:   VITE_GALLERY_EMBED_CODE='<…embed код…>'   (санал болгох)
 *   б) эсвэл доорх backtick (`) тэмдгүүдийн хооронд шууд paste хийнэ.
 * Environment variable өгөгдсөн бол түүнийг нь ашиглана.
 * ⚠ Script-ийг index.html-д тусад нь БҮҮ нэм — FacebookGallery компонент
 *   өөрөө нэг л удаа, хэрэгтэй үед нь ачаална.
 */
const GALLERY_EMBED_CODE_FALLBACK = String.raw`
`

export const galleryEmbed = parseEmbedCode(
  import.meta.env.VITE_GALLERY_EMBED_CODE || GALLERY_EMBED_CODE_FALLBACK
)

/* Буруу тохиргоог (хоосон биш боловч ашиглах боломжгүй утгыг) консолд мэдэгдэнэ. */
if (formspree.status === 'invalid') {
  console.warn('[Тохиргоо] VITE_FORMSPREE_ENDPOINT буруу форматтай байна. Хэлбэр: https://formspree.io/f/<таны-form-id>')
}
if (galleryEmbed.status === 'invalid') {
  console.warn(`[Тохиргоо] Зургийн цомгийн embed код ашиглах боломжгүй: ${galleryEmbed.reason}`)
}
