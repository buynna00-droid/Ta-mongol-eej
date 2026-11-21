/**
 * Safely interprets a gallery widget embed code copied from SociableKit or
 * Elfsight, e.g.
 *
 *   <div class='sk-ww-…' data-embed-id='…'></div><script src='https://widgets.sociablekit.com/…/widget.js' defer></script>
 *   <script src="https://static.elfsight.com/platform/platform.js" async></script><div class="elfsight-app-…" data-elfsight-app-lazy></div>
 *
 * The code is parsed with DOMParser, which never executes scripts. Only the
 * script URL (https, allow-listed provider domains) and the widget <div>'s
 * class + data-* attributes are kept; React re-creates the <div> and
 * loadScript() injects the script once. Inline scripts and any other markup are
 * ignored, so a mistaken paste cannot run arbitrary code on the site.
 */
const PROVIDERS = [
  { id: 'sociablekit', label: 'SociableKit', domains: ['sociablekit.com'] },
  { id: 'elfsight', label: 'Elfsight', domains: ['elfsight.com', 'elfsightcdn.com'] }
]

const WIDGET_DIV_SELECTOR = [
  'div[class^="sk-"]',
  'div[class*=" sk-"]',
  'div[class^="elfsight-app-"]',
  'div[class*=" elfsight-app-"]'
].join(', ')

const onDomain = (hostname, domain) => hostname === domain || hostname.endsWith(`.${domain}`)

const invalid = (reason) => ({ status: 'invalid', reason })

export function parseEmbedCode(code) {
  const raw = typeof code === 'string' ? code.trim() : ''
  if (!raw) return { status: 'missing' }
  if (typeof DOMParser === 'undefined') return invalid('DOMParser is unavailable.')

  const doc = new DOMParser().parseFromString(raw, 'text/html')

  const scriptElement = doc.querySelector('script[src]')
  if (!scriptElement) return invalid('Embed кодонд <script src="…"> олдсонгүй.')

  let url
  try {
    url = new URL(scriptElement.getAttribute('src'), 'https://relative.invalid')
  } catch {
    return invalid('Script-ийн хаяг буруу байна.')
  }
  if (url.protocol !== 'https:') return invalid('Script-ийн хаяг https:// хаягтай байх ёстой.')

  const provider = PROVIDERS.find((p) => p.domains.some((domain) => onDomain(url.hostname, domain)))
  if (!provider) {
    return invalid(`"${url.hostname}" домэйн зөвшөөрөгдөөгүй. Зөвхөн SociableKit эсвэл Elfsight-ийн embed код ашиглана.`)
  }

  const target = doc.body.querySelector(WIDGET_DIV_SELECTOR) || doc.body.querySelector('div')
  if (!target) return invalid('Виджет байрлах <div …> элемент олдсонгүй.')

  const className = (target.getAttribute('class') || '').trim()
  if (!className) return invalid('Виджетийн <div>-д class алга.')

  const attrs = {}
  for (const { name, value } of Array.from(target.attributes)) {
    if (name.startsWith('data-')) attrs[name] = value
  }

  return {
    status: 'ok',
    provider: provider.id,
    providerLabel: provider.label,
    scriptSrc: url.href,
    className,
    attrs
  }
}
