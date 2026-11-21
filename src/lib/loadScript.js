/**
 * Loads an external <script> exactly once per page.
 *
 * Repeated or concurrent calls — including React StrictMode's double-run of
 * effects in development — share one promise, so the tag is never injected
 * twice. A failed load is forgotten (and its tag removed) so a later call can
 * retry. Once executed, a script cannot be "unloaded"; components that use it
 * clean up their own observers/timers instead.
 */
const loading = new Map()

export function loadScript(src) {
  const url = new URL(src, document.baseURI).href
  const cached = loading.get(url)
  if (cached) return cached

  const promise = new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) => script.src === url)
    if (existing) {
      // Added outside this helper (e.g. pasted into index.html). Its load state
      // is unknown, so resolve at once; callers detect the rendered widget.
      resolve(existing)
      return
    }

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.addEventListener('load', () => resolve(script), { once: true })
    script.addEventListener(
      'error',
      () => {
        loading.delete(url)
        script.remove()
        reject(new Error(`Script failed to load: ${url}`))
      },
      { once: true }
    )
    document.body.appendChild(script)
  })

  loading.set(url, promise)
  return promise
}
