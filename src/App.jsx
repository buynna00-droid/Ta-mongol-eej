import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Menu, X,
  Heart, GraduationCap, Facebook
} from 'lucide-react'
import siteImages from 'virtual:site-images'
import { MOBILE_MEDIA } from './config/images.js'
import { FACEBOOK_PAGE_URL as FB } from './config/site.js'
import RegistrationForm from './components/RegistrationForm.jsx'
import logoMark1x from './assets/logo/logo-mark-56.png'
import logoMark2x from './assets/logo/logo-mark-112.png'
import logoMark3x from './assets/logo/logo-mark-168.png'

const pillars = [
  {
    number: '01', icon: BookOpen, title: 'Судар, ном', subtitle: 'Өв соёлын мэдлэг',
    body: 'Монгол ээжүүдийн уламжлалт мэдлэг, өв соёлын судар номын тайлбар, эртний сургаал үгсийн утга учрыг хамтдаа нээнэ.',
    detailTitle: 'Судар, ном — өвгөдийн үгийг өнөөдөр ойлгох нь',
    detail: [
      ['Уламжлалт сургаалын утга', 'Монголчуудын амьдралын ухаан, ёс заншил, сургаал үгсийг өнөөгийн гэр бүлийн амьдралтай холбон тайлбарлана.'],
      ['Хамтдаа уншиж, ярилцах', 'Эх сурвалжид тулгуурлан уншсан зүйлээ хэлэлцэж, хүүхдэдээ ямар үнэ цэнийг өвлүүлэхээ тунгаана.'],
      ['Өдөр тутмын хэрэглээ', 'Уламжлалт мэдлэгийг зөвхөн дурсамж бус, гэр бүлийн өдөр тутмын харилцаанд хэрэглэх санаа, дадал болгон хувиргана.']
    ]
  },
  {
    number: '02', icon: Heart, title: 'Ардын ухаан', subtitle: 'Гэр бүлийн хүмүүжил',
    body: 'Хүүхдийн эрүүл мэнд, гэр бүлийн харилцаа, монгол уламжлалт хүмүүжлийн арга ухаан, аман өвийг түгээнэ.',
    detailTitle: 'Ардын ухаан — үр хүүхдэдээ өвлүүлэх амьд өв',
    detail: [
      ['1–3 насны дайралцаа, түргэн хэллэг', 'Хүүхдийн нас, хэл ярианы хөгжлийн онцлогт тохирсон богино, хөгжилтэй аман уламжлалыг хамтдаа сурна. Тоглоомын байдлаар давтаж, хүүхдийн сонирхлыг дэмжээрэй.'],
      ['Ургийн бичиг хөтлөх', 'Гэр бүлийн ахмадуудаасаа нэр, төрсөн он, нутаг ус, холбоо хамаарлын тухай асууж тэмдэглэнэ. Мэдэхгүй мэдээллийг таамгаар нөхөхгүй, “тодруулах” гэж үлдээнэ.'],
      ['Өдөр тутмын хүмүүжил', 'Хүүхдээ сонсох, үлгэрлэн сургах, ахмадаа хүндлэх зэрэг үнэт зүйлийг хайр, харилцан ойлголцолд тулгуурлан амьдралд хэрэгжүүлнэ.']
    ]
  },
  {
    number: '03', icon: GraduationCap, title: 'Сургалт', subtitle: 'Мэдлэгээс дадал руу',
    body: 'Уламжлалт мэдлэгийг орчин үеийн эцэг эхчүүдэд ойлгомжтой, практик хэлбэрээр хүргэх сургалт, хэлэлцүүлэг.',
    detailTitle: 'Сургалт — хамтдаа суралцаж, туршлагаа хуваалцах нь',
    detail: [
      ['Сэдэвчилсэн уулзалт', 'Ээжүүдийн хэрэгцээ, сонирхолд тулгуурласан уламжлал, хүүхдийн хөгжил, гэр бүлийн харилцааны сэдвээр уулзалт зохион байгуулна.'],
      ['Харилцан суралцах орчин', 'Оролцогч бүр асуулт асууж, өөрийн туршлагаа хуваалцаж, бусдын санаанаас суралцах боломжтой.'],
      ['Хэрэгжүүлэх жижиг алхам', 'Уулзалт бүрийн дараа гэртээ туршиж болох энгийн дадал, ярилцах асуулт, тэмдэглэл хөтлөх санааг санал болгоно.']
    ]
  }
]

const testimonials = [
  { quote: 'Ээж хүний хувьд хүүхдэдээ юу өвлүүлж үлдээх вэ гэж үргэлж боддог. Эндээс уламжлалаа өдөр тутмын амьдралтайгаа холбож ойлгох урам авсан.', name: 'Оролцогч ээж', note: 'Сургалтын оролцогч' },
  { quote: 'Бидний мартсан мэт санагддаг олон сайхан үг, заншил гэр бүлийн дулаан ярианаас эхэлдгийг ойлгосон. Хүүхэдтэйгээ хамт суралцах сайхан боломж.', name: 'Залуу ээж', note: 'Нийгэмлэгийн гишүүн' },
  { quote: 'Өөр өөр туршлагатай ээжүүдтэй уулзаж, санаа бодлоо хуваалцахад өөртөө итгэх итгэл нэмэгддэг. Энэ орон зайг улам олон гэр бүл мэдээсэй.', name: 'Монгол ээж', note: 'Уулзалтын оролцогч' }
]

// Photographs come from public/images/ when present, otherwise placeholders (src/config/images.js).
const gallery = [
  { image: siteImages.gallery1, label: 'Хайр дүүрэн мөч', width: 900, height: 750 },
  { image: siteImages.gallery2, label: 'Гэр бүлийн үнэ цэн', width: 900, height: 750 },
  { image: siteImages.gallery3, label: 'Хамтдаа өсөхүй', width: 900, height: 750 }
]

const pad2 = (n) => String(n).padStart(2, '0')

function Ornament({ className = '' }) {
  return <div className={`ornament ${className}`} aria-hidden="true"><span>◇</span><i /><span>◇</span></div>
}

/** Closes on Escape while `active`. */
function useEscape(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') onEscape() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, onEscape])
}

// The organization's logo mark. The name follows it as text, so the image is
// decorative (alt="") and screen readers do not hear the name twice.
function BrandLogo() {
  return <img className="brand-logo" src={logoMark1x} srcSet={`${logoMark1x} 1x, ${logoMark2x} 2x, ${logoMark3x} 3x`} alt="" width="46" height="56" />
}

function Header() {
  const [open, setOpen] = useState(false)
  const close = React.useCallback(() => setOpen(false), [])
  useEscape(open, close)
  const links = [['Бидний тухай', '#about'], ['Үндсэн чиглэл', '#pillars'], ['Мэдлэгийн сан', '#knowledge'], ['Холбогдох', '#contact']]
  return <header className="header">
    <a href="#home" className="brand" aria-label="Та Монгол Ээж — нүүр хуудас">
      <BrandLogo /><span>ТА МОНГОЛ ЭЭЖ<small>ӨВ СОЁЛОО ХАМТДАА ӨВЛӨЕ</small></span>
    </a>
    <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Цэс хаах' : 'Цэс нээх'} aria-expanded={open} aria-controls="site-nav">{open ? <X /> : <Menu />}</button>
    <nav id="site-nav" className={open ? 'nav nav-open' : 'nav'} aria-label="Үндсэн цэс">
      {links.map(([label, href]) => <a key={href} href={href} onClick={close}>{label}</a>)}
      <a className="nav-cta" href="#contact" onClick={close}>Сургалтад бүртгүүлэх <ArrowUpRight size={15}/></a>
    </nav>
  </header>
}

function Hero() {
  const hero = siteImages.hero
  return <section className="hero" id="home">
    <picture className="hero-photo">
      {hero.mobileSrc && <source media={MOBILE_MEDIA} srcSet={hero.mobileSrc} />}
      <img fetchpriority="high" src={hero.src} alt={hero.alt} />
    </picture>
    <div className="hero-content">
      <div className="eyebrow light"><span /> УЛАМЖЛАЛТ ӨВ СОЁЛ БА ОРЧИН ҮЕИЙН ЭЭЖҮҮДИЙН НЭГДЭЛ</div>
      <h1>Эх хүнийг мэдлэгээр,<br/>үр хүүхдийг <em>монгол</em><br/>ухаанаар дэмжинэ.</h1>
      <p>Ээжүүд хамтдаа суралцаж, гэр бүлийнхээ үнэ цэнийг<br className="desktop"/> өвлүүлэн үлдээх дулаан орон зай.</p>
      <a href="#about" className="hero-link">Танилцах <span>↗</span></a>
    </div>
    <div className="hero-bottom"><span>01 / 04</span><span>УЛАМЖЛАЛ · МЭДЛЭГ · ХАЙР</span><a href="#about" aria-label="Дараагийн хэсэг рүү гүйлгэх"><ArrowDown size={17}/></a></div>
  </section>
}

function About() {
  const image = siteImages.about
  return <section className="section about-section" id="about">
    <div className="about-visual">
      <div className="photo-frame" />
      <img loading="lazy" decoding="async" src={image.src} alt={image.alt} width="1100" height="1300" />
      <div className="image-caption"><span>ЭХИЙН ХАЙР — ҮЕЭС ҮЕД</span><span>✳</span></div>
    </div>
    <div className="about-copy">
      <div className="eyebrow"><span/> БИДНИЙ ЭРХЭМ ЗОРИЛГО</div>
      <h2>Тавтай морил,<br/><em>Монгол Ээжүүд ээ.</em></h2>
      <Ornament />
      <h3>Уламжлалт ухааныг<br/>орчин үеийн гэр бүлд</h3>
      <p>“Та Монгол Ээж” бол эх хүн, гэр бүл, үр хүүхдийн хүмүүжилд хэрэгтэй уламжлалт мэдлэг, өв соёлыг хамтдаа судалж, хуваалцах боловсрол, соёлын нэгдэл юм.</p>
      <p>Бид үеэс үед уламжлагдсан монгол ухааныг өнөө цагийн амьдралтай холбон, ээж бүрт суралцах, асуух, туршлагаа хуваалцах дулаан орон зайг бий болгохыг зорьдог.</p>
      <a href={FB} target="_blank" rel="noopener noreferrer" className="outline-button">FACEBOOK ХУУДАСТ НЭГДЭХ <ArrowUpRight size={15}/></a>
    </div>
  </section>
}

function Pillars() {
  const [selected, setSelected] = useState(null)
  const triggerRef = useRef(null)
  const restoreFocusRef = useRef(true)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  const openDetail = (item, event) => {
    triggerRef.current = event.currentTarget
    restoreFocusRef.current = true
    setSelected(item)
  }
  const close = React.useCallback(() => setSelected(null), [])
  useEscape(Boolean(selected), close)

  useEffect(() => {
    if (!selected) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [selected])

  // Move focus into the dialog; give it back to the button that opened it.
  useEffect(() => {
    if (!selected) return undefined
    closeButtonRef.current?.focus()
    return () => {
      if (restoreFocusRef.current) triggerRef.current?.focus({ preventScroll: true })
    }
  }, [selected])

  // Keep Tab / Shift+Tab inside the open dialog.
  const trapFocus = (event) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = dialogRef.current.querySelectorAll('a[href], button:not([disabled])')
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return <section className="section pillars-section" id="pillars">
    <div className="section-heading centered">
      <div className="eyebrow"><span/> БИДНИЙ ҮЙЛ АЖИЛЛАГАА</div>
      <h2>Өв соёлоо <em>хамтдаа</em> өвлөе</h2>
      <p>Мэдлэг, хүмүүжил, хамтын суралцахуйгаар гэр бүлийн үнэ цэнийг дэмжинэ.</p>
    </div>
    <div className="pillar-grid">
      {pillars.map(({ number, icon: Icon, title, subtitle, body }, i) => <article className="pillar-card" key={number}>
        <div className="pillar-top"><span>{number}</span><Icon size={29} strokeWidth={1.15}/></div>
        <div className="pillar-symbol">{i === 0 ? 'ᠥ' : i === 1 ? '✳' : '⌘'}</div>
        <div className="eyebrow">{subtitle}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        <button className="text-link" onClick={(event) => openDetail(pillars[i], event)} aria-haspopup="dialog">Дэлгэрэнгүй унших <ArrowUpRight size={15}/></button>
      </article>)}
    </div>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="content-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef} onKeyDown={trapFocus}>
        <button className="modal-close" onClick={close} aria-label="Хаах" ref={closeButtonRef}><X/></button>
        <div className="eyebrow"><span/> МЭДЛЭГИЙН САН · {selected.number}</div>
        <h2 id="modal-title">{selected.detailTitle}</h2>
        <Ornament/>
        {selected.detail.map(([title, text]) => <div className="detail-block" key={title}><h4>{title}</h4><p>{text}</p></div>)}
        <a href="#contact" className="solid-button" onClick={() => { restoreFocusRef.current = false; close() }}>Сургалтын талаар асуух <ArrowUpRight size={15}/></a>
      </div>
    </div>}
  </section>
}

function Atmosphere() {
  const image = siteImages.atmosphere
  return <section className="atmosphere" id="knowledge">
    <picture className="atmosphere-image">
      {image.mobileSrc && <source media={MOBILE_MEDIA} srcSet={image.mobileSrc} />}
      <img loading="lazy" decoding="async" src={image.src} alt={image.alt} />
    </picture>
    <div className="atmosphere-overlay"/>
    <div className="atmosphere-content"><span>ҮЕЭС ҮЕД ӨВЛӨГДӨХ ҮНЭТ ЗҮЙЛ</span><h2>Өв соёл бол бидний<br/><em>маргаашид үлдээх гэрэл.</em></h2><Ornament/></div>
  </section>
}

function Testimonials() {
  const [index, setIndex] = useState(0)
  const item = testimonials[index]
  const image = siteImages.testimonial
  const change = (n) => setIndex((index + n + testimonials.length) % testimonials.length)
  return <section className="section testimonial-section" aria-roledescription="carousel" aria-label="Ээжүүдийн сэтгэгдэл">
    <div className="testimonial-copy">
      <div className="eyebrow"><span/> ЭЭЖҮҮДИЙН СЭТГЭГДЭЛ</div>
      <p className="testimonial-notice">Доорх нь жишээ текстүүд. Бодит оролцогчдын сэтгэгдлийг зөвшөөрөлтэйгөөр нийтэлнэ.</p>
      <div className="quote-mark" aria-hidden="true">“</div>
      <div aria-live="polite">
        <blockquote>{item.quote}</blockquote>
        <div className="quote-author"><span>{item.name}</span><small>{item.note}</small></div>
      </div>
      <div className="slider-controls">
        <span className="slider-count">{pad2(index + 1)} <i>/ {pad2(testimonials.length)}</i></span>
        <button onClick={() => change(-1)} aria-label="Өмнөх сэтгэгдэл"><ArrowLeft/></button>
        <button onClick={() => change(1)} aria-label="Дараагийн сэтгэгдэл"><ArrowRight/></button>
      </div>
    </div>
    <div className="testimonial-photo-wrap">
      <img loading="lazy" decoding="async" src={image.src} alt={image.alt} width="1000" height="1100" />
      <div className="photo-note">ЭЭЖҮҮДИЙН НЭГДЭЛ <span>✳</span></div>
    </div>
  </section>
}

function Gallery() {
  return <section className="section gallery-section" id="gallery">
    <div className="section-heading gallery-heading">
      <div><div className="eyebrow"><span/> БИДНИЙ ОРОН ЗАЙ</div><h2>Дурсамж бүтээх <em>агшнууд</em></h2></div>
      <p>Ээжүүд, үр хүүхэд, өв соёлын үнэ цэнтэй мөчүүд.</p>
    </div>
    <div className="gallery-grid">
      {gallery.map((item, i) => <figure key={item.label} className={`gallery-item gallery-${i+1}`}>
        <img loading="lazy" decoding="async" src={item.image.src} alt={item.image.alt} width={item.width} height={item.height}/>
        <figcaption><span>0{i+1}</span>{item.label}</figcaption>
      </figure>)}
    </div>
  </section>
}

function FacebookRegistration() {
  return <section className="section contact-section" id="contact">
    <div className="contact-heading">
      <div className="eyebrow"><span/> ХОЛБООТОЙ БАЙЯ</div>
      <h2>Хамтдаа <em>суралцъя.</em></h2>
      <p>Мэдээлэл, сургалтын зар, уулзалтын талаар бидэнтэй холбогдоорой.</p>
    </div>
    <div className="contact-grid">
      <div className="facebook-panel">
        <div className="panel-heading"><div><Facebook size={18}/><span>FACEBOOK · ТА МОНГОЛ ЭЭЖ</span></div><a href={FB} target="_blank" rel="noopener noreferrer">Хуудас үзэх <ArrowUpRight size={14}/></a></div>
        <div className="facebook-contact-card">
          <Facebook size={32} strokeWidth={1.2} aria-hidden="true" />
          <h3>Facebook-ээр<br /><em>холбоотой байя.</em></h3>
          <p>Шинэ зураг, нийтлэл, сургалтын мэдээллийг манай Facebook хуудаснаас үзээрэй.</p>
          <a href={FB} target="_blank" rel="noopener noreferrer" className="outline-button">Facebook хуудас үзэх <ArrowUpRight size={15} /></a>
        </div>
      </div>
      <div className="registration-panel">
        <RegistrationForm />
      </div>
    </div>
  </section>
}

function Footer() {
  return <footer className="footer">
    <div className="footer-main">
      <a href="#home" className="brand footer-brand"><BrandLogo /><span>ТА МОНГОЛ ЭЭЖ<small>ӨВ СОЁЛОО ХАМТДАА ӨВЛӨЕ</small></span></a>
      <p>Эх хүнийг мэдлэгээр,<br/>үр хүүхдийг монгол ухаанаар.</p>
      <div className="footer-links"><a href="#about">Бидний тухай</a><a href="#pillars">Үндсэн чиглэл</a><a href="#knowledge">Мэдлэгийн сан</a><a href="#contact">Холбогдох</a></div>
      <a href={FB} target="_blank" rel="noopener noreferrer" className="footer-social"><Facebook size={17}/> Facebook <ArrowUpRight size={14}/></a>
    </div>
    <Ornament/>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} ТА МОНГОЛ ЭЭЖ</span><span>ХАЙР · МЭДЛЭГ · ӨВ СОЁЛ</span><a href="#home">ДЭЭШ БУЦАХ ↑</a></div>
  </footer>
}

export default function App() {
  return <><Header/><main><Hero/><About/><Pillars/><Atmosphere/><Testimonials/><Gallery/><FacebookRegistration/></main><Footer/></>
}
