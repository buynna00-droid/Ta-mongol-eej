import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Flower2 } from 'lucide-react'
import { loadScript } from '../lib/loadScript.js'
import { useNearViewport } from '../lib/useNearViewport.js'

// If nothing has rendered by then, show the fallback (a late render still replaces it).
const RENDER_TIMEOUT_MS = 15000

/**
 * Facebook photo gallery that stays in sync with the official page through a
 * SociableKit or Elfsight widget.
 *
 * `embed` is the parsed embed code from src/config/site.js:
 *   { status: 'ok', scriptSrc, className, attrs, providerLabel }
 *   { status: 'missing' } | { status: 'invalid', reason }
 */
export default function FacebookGallery({ embed, pageUrl }) {
  if (embed && embed.status === 'ok') return <GalleryWidget embed={embed} pageUrl={pageUrl} />
  return <GalleryNotice embed={embed} pageUrl={pageUrl} />
}

function GalleryWidget({ embed, pageUrl }) {
  const wrapperRef = useRef(null)
  const embedRef = useRef(null)
  const mountRef = useRef(null)
  const isNear = useNearViewport(wrapperRef)
  const [status, setStatus] = useState('idle') // idle → loading → ready | failed

  useEffect(() => {
    if (!isNear) return undefined
    const container = embedRef.current
    const mount = mountRef.current
    let active = true
    let timer
    // Rendered once the provider has added anything to the embed area —
    // inside the widget <div>, next to it, or in its place.
    const hasRendered = () =>
      mount.childElementCount > 0 || Array.from(container.children).some((child) => child !== mount)

    const observer = new MutationObserver(() => {
      if (hasRendered()) markReady()
    })
    function markReady() {
      if (!active) return
      clearTimeout(timer)
      observer.disconnect()
      setStatus('ready')
    }
    function markFailed() {
      if (active && !hasRendered()) setStatus('failed')
    }

    if (hasRendered()) {
      markReady()
    } else {
      observer.observe(container, { childList: true, subtree: true })
      setStatus('loading')
      timer = setTimeout(markFailed, RENDER_TIMEOUT_MS)
      loadScript(embed.scriptSrc)
        .then(() => {
          if (hasRendered()) markReady()
        })
        .catch(() => {
          clearTimeout(timer)
          markFailed()
        })
    }

    return () => {
      active = false
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [isNear, embed.scriptSrc])

  return (
    <div className="fb-gallery" ref={wrapperRef} data-status={status}>
      <div className="fb-gallery-head">
        <div className="eyebrow"><span /> FACEBOOK-ИЙН ЗУРГИЙН ЦОМОГ</div>
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="text-link">
          Бүх зургийг Facebook-ээс үзэх <ArrowUpRight size={15} />
        </a>
      </div>

      {/* The provider's script renders the gallery inside this element. React
          never re-renders its children, so they are left untouched. */}
      <div className="fb-gallery-embed" ref={embedRef}>
        <div ref={mountRef} className={embed.className} {...embed.attrs} />
      </div>

      {status !== 'ready' && (
        <div className="widget-placeholder fb-gallery-status" role="status">
          <span className="widget-icon"><Flower2 /></span>
          {status === 'failed' ? (
            <>
              <div>
                <strong>Зургийн цомгийг ачаалж чадсангүй</strong>
                <p>Сүлжээ эсвэл браузерын тохиргооноос шалтгаалсан байж магадгүй. Зургуудыг Facebook хуудаснаас үзэх боломжтой.</p>
              </div>
              <a className="outline-button" href={pageUrl} target="_blank" rel="noopener noreferrer">
                Facebook-ээс үзэх <ArrowUpRight size={15} />
              </a>
            </>
          ) : (
            <div>
              <strong>Зургийн цомгийг ачаалж байна…</strong>
              <p>Facebook хуудасны шинэ зургууд энд автоматаар шинэчлэгдэн харагдана.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GalleryNotice({ embed, pageUrl }) {
  if (import.meta.env.DEV) {
    // Owner-facing placeholder — shown only while developing (npm run dev).
    return (
      <div className="widget-placeholder" aria-label="Зургийн цомгийн автомат шинэчлэлтийн виджет байрлуулах хэсэг">
        <span className="widget-icon"><Flower2 /></span>
        <div>
          <strong>Зургийн цомгийн автомат шинэчлэлт</strong>
          <p>
            SociableKit эсвэл Elfsight виджетийн embed кодыг <b>.env</b> файлын <b>VITE_GALLERY_EMBED_CODE</b>-д
            (эсвэл <b>src/config/site.js</b>-д) оруулна. Энэ мэдэгдэл зөвхөн хөгжүүлэлтийн горимд харагдана.
          </p>
          {embed && embed.status === 'invalid' && <p className="form-error">Алдаа: {embed.reason}</p>}
        </div>
        <code>{"VITE_GALLERY_EMBED_CODE='<div class=…></div><script src=…></script>'"}</code>
      </div>
    )
  }

  // Visitor-facing fallback while no widget is configured.
  return (
    <div className="widget-placeholder">
      <span className="widget-icon"><Flower2 /></span>
      <div>
        <strong>Илүү олон дурсамж</strong>
        <p>Бидний үйл ажиллагааны шинэ зургуудыг Facebook хуудаснаас үзээрэй.</p>
      </div>
      <a className="outline-button" href={pageUrl} target="_blank" rel="noopener noreferrer">
        Facebook-ээс үзэх <ArrowUpRight size={15} />
      </a>
    </div>
  )
}
