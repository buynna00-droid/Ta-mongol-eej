/**
 * ЗУРГИЙН ТОХИРГОО — Та Монгол Ээж
 * ─────────────────────────────────────────────────────────────────────────
 * Албан ёсны, зөвшөөрөгдсөн зургуудыг `public/images/` хавтсанд доорх
 * `file` нэрээр (.jpg, .jpeg, .webp эсвэл .png өргөтгөлтэй) хуулна.
 *
 *   public/images/hero.jpg          → Нүүр хэсэг (hero)
 *   public/images/hero-mobile.jpg   → Нүүр хэсэг, утсанд зориулсан босоо хувилбар (заавал биш)
 *   public/images/about.jpg         → "Бидний тухай"
 *   ...
 *
 * Build (эсвэл dev server) эхлэх үед файл олдвол автоматаар ашиглагдана.
 * Олдохгүй бол одоогийн түр (placeholder) зураг харагдсаар байна.
 * Ямар зураг ашиглагдаж буйг `npm run build`-ийн гаралт харуулна.
 *
 * Зураг солих бүрд `alt` текстийг тухайн зургийн бодит агуулгаар шинэчилнэ үү.
 * Дэлгэрэнгүй заавар: docs/IMAGES.md
 *
 * Анхаар: `placeholder*` нь Unsplash-ийн түр зураг — байгууллагын албан ёсны
 * зураг биш. Тэдгээрийн `placeholderAlt` нь тухайн түр зургийн бодит агуулгыг
 * тайлбарладаг.
 */

const unsplash = (id, width, quality) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`

export const IMAGE_SLOTS = {
  hero: {
    file: 'hero',
    mobileFile: 'hero-mobile',
    section: 'Нүүр хэсэг (Hero)',
    recommended: '2000–2400 px өргөн хэвтээ зураг, ≤ 450 KB. Утсанд: 1000×1400 px босоо, ≤ 250 KB',
    alt: 'Гал голомтын дэргэд нялх үрээ тэвэрсэн ээж, аавыг дүрсэлсэн улаан өнгийн уран зураг',
    placeholder: unsplash('1511895426328-dc8714191300', 2200, 90),
    placeholderMobile: unsplash('1511895426328-dc8714191300', 1400, 85),
    placeholderAlt: 'Нар жаргах үед далайн эрэг дээр гар хөтлөлцөн зогсох гэр бүлийнхэн'
  },
  about: {
    file: 'about',
    section: 'Бидний тухай',
    recommended: '1100×1300 px орчим босоо хөрөг, ≤ 300 KB',
    alt: 'Монгол ээж хүүхэдтэйгээ хамт буй хөрөг зураг',
    placeholder: unsplash('1491013516836-7db643ee125a', 1100, 90),
    placeholderAlt: 'Модон шоо тоглоом амандаа барьсан нялх хүүхэд',
    width: 1100,
    height: 1300
  },
  atmosphere: {
    file: 'atmosphere',
    mobileFile: 'atmosphere-mobile',
    section: 'Уур амьсгалын туузан зураг',
    recommended: '2000–2400 px өргөн хэвтээ зураг, ≤ 450 KB. Утсанд: 1000 px өргөн, ≤ 200 KB',
    alt: 'Монгол гэр бүлийн уламжлалт соёлын амгалан агшин',
    placeholder: unsplash('1500530855697-b586d89ba3ee', 2200, 85),
    placeholderMobile: unsplash('1500530855697-b586d89ba3ee', 1000, 80),
    placeholderAlt: 'Улаан хадат хөндийгөөр сунан одох хатуу хучилттай зам'
  },
  testimonial: {
    file: 'testimonial',
    section: 'Ээжүүдийн сэтгэгдэл',
    recommended: '1000×1100 px орчим, ≤ 300 KB',
    alt: 'Ээж хүүхэдтэйгээ инээмсэглэн хамт буй дулаан агшин',
    placeholder: unsplash('1511895426328-dc8714191300', 1000, 90),
    placeholderAlt: 'Нар жаргах үед далайн эрэг дээр гар хөтлөлцөн зогсох гэр бүлийнхэн',
    width: 1000,
    height: 1100
  },
  gallery1: {
    file: 'gallery-1',
    section: 'Зургийн цомог — 01 «Хайр дүүрэн мөч»',
    recommended: '900×750 px орчим, ≤ 250 KB',
    alt: 'Ээж хүүхэдтэйгээ хайр дүүрэн мөчийг хуваалцаж буй нь',
    placeholder: unsplash('1511895426328-dc8714191300', 900, 85),
    placeholderAlt: 'Нар жаргах үед далайн эрэг дээр гар хөтлөлцөн зогсох гэр бүлийнхэн',
    width: 900,
    height: 750
  },
  gallery2: {
    file: 'gallery-2',
    section: 'Зургийн цомог — 02 «Гэр бүлийн үнэ цэн»',
    recommended: '900×750 px орчим, ≤ 250 KB',
    alt: 'Гэр бүлийнхэн хамтдаа дулаан цагийг өнгөрүүлж буй нь',
    placeholder: unsplash('1476703993599-0035a21b17a9', 900, 85),
    placeholderAlt: 'Буйдан дээр хоёр бяцхан хүүхэдтэйгээ таблет үзэж буй ээж',
    width: 900,
    height: 750
  },
  gallery3: {
    file: 'gallery-3',
    section: 'Зургийн цомог — 03 «Хамтдаа өсөхүй»',
    recommended: '900×750 px орчим, ≤ 250 KB',
    alt: 'Ээж, хүүхдүүд хамтдаа суралцаж, өсөж буй агшин',
    placeholder: unsplash('1491013516836-7db643ee125a', 900, 85),
    placeholderAlt: 'Модон шоо тоглоом амандаа барьсан нялх хүүхэд',
    width: 900,
    height: 750
  }
}

/** Accepted extensions, in order of preference when several exist for one slot. */
export const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png']

/** Matches the stylesheet's mobile breakpoint; `*-mobile` images are used below it. */
export const MOBILE_MEDIA = '(max-width: 760px)'
