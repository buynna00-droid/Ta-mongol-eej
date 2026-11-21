import React, { useLayoutEffect, useRef, useState } from 'react'
import { Facebook } from 'lucide-react'

// Facebook Page Plugin accepts widths between 180 and 500 px. The iframe version
// renders at exactly the `width` given in its URL (adapt_container_width only
// works with the JS SDK), so the width must be measured from the container.
const MIN_WIDTH = 180
const MAX_WIDTH = 500
const GROW_THRESHOLD = 24 // px — avoid reloading the iframe for tiny growth

export function buildPagePluginUrl(pageUrl, width, height) {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: 'timeline',
    width: String(width),
    height: String(height),
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'true'
  })
  return `https://www.facebook.com/plugins/page.php?${params}`
}

const clampWidth = (value) => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.floor(value)))

export default function FacebookPagePlugin({ pageUrl, title, height = 600 }) {
  const frameRef = useRef(null)
  const [width, setWidth] = useState(null)

  // Measure before the first paint so the iframe loads once, at the right width.
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
    setWidth(clampWidth(frame.clientWidth))
    if (typeof ResizeObserver === 'undefined') return undefined

    let timer
    const observer = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const next = clampWidth(frame.clientWidth)
        // Shrink at once so the plugin never overflows; grow only when worthwhile.
        setWidth((previous) =>
          previous === null || next < previous || next - previous >= GROW_THRESHOLD ? next : previous
        )
      }, 250)
    })
    observer.observe(frame)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="facebook-frame" ref={frameRef}>
      {/* Visible while the plugin loads, or if a browser/extension blocks it. */}
      <div className="facebook-fallback" aria-hidden="true">
        <Facebook size={26} strokeWidth={1.2} />
        <p>Facebook-ийн мэдээг ачаалж байна…</p>
        <small>Удаан харагдахгүй бол таны браузер Facebook-ийн контентыг хааж байж магадгүй.</small>
      </div>
      {width !== null && (
        <iframe
          // A new element per width avoids adding iframe navigations to the browser history.
          key={width}
          title={title}
          src={buildPagePluginUrl(pageUrl, width, height)}
          width={width}
          height={height}
          loading="lazy"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      )}
    </div>
  )
}
