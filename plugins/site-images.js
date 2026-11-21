/**
 * Vite plugin — resolves the website's static photographs at build time.
 *
 * For every slot in src/config/images.js it looks for an official photo in
 * public/images/ (e.g. hero.jpg). A file that exists is used, with a
 * content-hash query string so browsers and CDNs pick up replacements;
 * otherwise the slot keeps its placeholder. The result is exposed to the app
 * as the virtual module `virtual:site-images`.
 *
 * It also preloads the hero image in index.html and prints a summary with
 * warnings: missing files, the same photo used in two sections, oversized
 * files and unrecognised file names. No extra dependencies.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { IMAGE_EXTENSIONS, IMAGE_SLOTS, MOBILE_MEDIA } from '../src/config/images.js'

const VIRTUAL_ID = 'virtual:site-images'
const RESOLVED_ID = `\0${VIRTUAL_ID}`
const LARGE_FILE_BYTES = 600 * 1024
const IGNORED_FILES = new Set(['.gitkeep', '.ds_store', 'thumbs.db', 'desktop.ini'])

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

function listFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
}

export function resolveSiteImages({ imagesDir, base = '/' }) {
  const files = listFiles(imagesDir)
  const byLowerName = new Map(files.map((name) => [name.toLowerCase(), name]))
  const recognised = new Set()
  const firstFileByHash = new Map()
  const images = {}
  const rows = []
  const warnings = []
  let localCount = 0

  const find = (stem, slotKey) => {
    const matches = IMAGE_EXTENSIONS.map((ext) => byLowerName.get(`${stem}${ext}`.toLowerCase())).filter(Boolean)
    matches.forEach((name) => recognised.add(name))
    if (matches.length > 1) {
      warnings.push(`${slotKey}: ${matches.join(', ')} — нэг хэсэгт хэд хэдэн файл байна. "${matches[0]}"-г ашиглалаа, бусдыг устгана уу.`)
    }
    return matches[0] || null
  }

  const describe = (fileName, slotKey) => {
    const buffer = readFileSync(path.join(imagesDir, fileName))
    const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 10)
    if (buffer.length > LARGE_FILE_BYTES) {
      warnings.push(`${fileName} — ${formatSize(buffer.length)}. Вебэд зориулж шахаж (≤ 450 KB) хурдыг сайжруулна уу (docs/IMAGES.md).`)
    }
    const earlier = firstFileByHash.get(hash)
    if (!earlier) firstFileByHash.set(hash, { slotKey, fileName })
    else if (earlier.slotKey !== slotKey) {
      warnings.push(`${fileName} нь ${earlier.fileName}-тэй яг ижил зураг. Хэсэг бүрт өөр зураг ашиглана уу.`)
    }
    return { url: `${base}images/${encodeURIComponent(fileName)}?v=${hash}`, size: buffer.length }
  }

  for (const [key, slot] of Object.entries(IMAGE_SLOTS)) {
    const file = find(slot.file, key)
    const mobileFile = slot.mobileFile ? find(slot.mobileFile, key) : null

    if (file) {
      localCount += 1
      const main = describe(file, key)
      const mobile = mobileFile ? describe(mobileFile, key) : null
      images[key] = { src: main.url, mobileSrc: mobile?.url ?? null, alt: slot.alt, local: true, file }
      rows.push(`  ✓ ${key.padEnd(12)} public/images/${file} (${formatSize(main.size)})${mobile ? ` + ${mobileFile}` : ''}`)
    } else {
      if (mobileFile) warnings.push(`${mobileFile} байгаа ч үндсэн "${slot.file}" зураг алга тул түр зураг ашиглагдаж байна.`)
      images[key] = {
        src: slot.placeholder,
        mobileSrc: slot.placeholderMobile ?? null,
        alt: slot.placeholderAlt,
        local: false,
        file: null
      }
      rows.push(`  ○ ${key.padEnd(12)} түр зураг (placeholder) — public/images/${slot.file}.jpg нэмж солино`)
    }
  }

  const unknown = files.filter((name) => !recognised.has(name) && !IGNORED_FILES.has(name.toLowerCase()))
  if (unknown.length > 0) {
    const expected = Object.values(IMAGE_SLOTS).flatMap((s) => [s.file, s.mobileFile].filter(Boolean))
    warnings.push(`Танигдаагүй файл: ${unknown.join(', ')}. Зөв нэрс: ${expected.join(', ')} (.jpg / .jpeg / .webp / .png).`)
  }

  return { images, rows, warnings, localCount, total: Object.keys(IMAGE_SLOTS).length }
}

function printReport(logger, { rows, warnings, localCount, total }) {
  const tail = localCount < total ? ' Бусад хэсэгт түр зураг (placeholder) харагдана — docs/IMAGES.md' : ''
  logger.info(`\n[зураг] public/images/: ${localCount}/${total} албан ёсны зураг олдлоо.${tail}`)
  rows.forEach((row) => logger.info(row))
  warnings.forEach((warning) => logger.warn(`  ⚠ ${warning}`))
}

function preloadTags(hero) {
  if (!hero) return []
  const link = (href, media) => ({
    tag: 'link',
    attrs: { rel: 'preload', as: 'image', href, fetchpriority: 'high', ...(media ? { media } : {}) },
    injectTo: 'head'
  })
  // Media queries mirror the <picture> in Hero so the preloaded file is reused.
  return hero.mobileSrc
    ? [link(hero.mobileSrc, MOBILE_MEDIA), link(hero.src, `not all and ${MOBILE_MEDIA}`)]
    : [link(hero.src)]
}

export default function siteImages() {
  let config
  let imagesDir
  const scan = () => resolveSiteImages({ imagesDir, base: config.base })

  return {
    name: 'ta-mongol-eej:site-images',

    configResolved(resolved) {
      config = resolved
      imagesDir = path.join(resolved.publicDir || path.join(resolved.root, 'public'), 'images')
    },

    buildStart() {
      printReport(config.logger, scan())
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },

    load(id) {
      if (id !== RESOLVED_ID) return undefined
      return `export default ${JSON.stringify(scan().images, null, 2)}\n`
    },

    transformIndexHtml() {
      return preloadTags(scan().images.hero)
    },

    // Dev server: adding, replacing or removing a photo reloads the page with it.
    configureServer(server) {
      const dir = path.resolve(imagesDir)
      const isInImagesDir = (file) => {
        const relative = path.relative(dir, path.resolve(file))
        return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
      }
      const refresh = (file) => {
        if (!isInImagesDir(file)) return
        const module = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        printReport(config.logger, scan())
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(dir)
      server.watcher.on('add', refresh)
      server.watcher.on('change', refresh)
      server.watcher.on('unlink', refresh)
    }
  }
}
