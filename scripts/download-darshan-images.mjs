#!/usr/bin/env node
/**
 * Downloads all Darshan images into public/darshan/
 * Wikimedia Commons (temples/hubs) + Picsum (stays, transport, packages, events, misc).
 */
import { copyFile, access, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public', 'darshan')

const WIKI_SEARCH = {
  'temples/tirupati-balaji.jpg': 'Tirumala Venkateswara temple',
  'temples/padmavathi.jpg': 'Padmavathi temple Tiruchanur',
  'temples/srikalahasti.jpg': 'Srikalahasti temple gopuram',
  'temples/kanipakam.jpg': 'Kanipakam Vinayaka temple',
  'temples/shirdi.jpg': 'Shirdi Sai Baba temple',
  'temples/kashi.jpg': 'Kashi Vishwanath Varanasi',
  'temples/vaishno-devi.jpg': 'Vaishno Devi temple',
  'temples/yadadri.jpg': 'Yadadri Narasimha temple',
  'temples/chilkur.jpg': 'Chilkur Balaji temple',
  'temples/iskcon-tirupati.jpg': 'ISKCON temple Tirupati',
  'temples/kapileswara.jpg': 'Kapileswara temple Tirupati',
  'temples/golden-temple.jpg': 'Harmandir Sahib Golden Temple',
  'temples/govindaraja.jpg': 'Govindaraja temple Tirupati',
  'hubs/tirupati.jpg': 'Tirumala temple Andhra Pradesh',
  'hubs/shirdi.jpg': 'Shirdi temple Maharashtra',
  'hubs/varanasi.jpg': 'Varanasi ghats temple',
  'hubs/puri.jpg': 'Jagannath temple Puri',
}

/** Picsum seeds — unique per asset, always resolves */
const PICSUM_ASSETS = [
  'stays/a1.jpg',
  'stays/a2.jpg',
  'stays/a3.jpg',
  'stays/a4.jpg',
  'stays/a5.jpg',
  'stays/a6.jpg',
  'transport/v1.jpg',
  'transport/v2.jpg',
  'transport/v3.jpg',
  'transport/v4.jpg',
  'packages/tirupati-weekend.jpg',
  'packages/family-darshan.jpg',
  'packages/luxury-sed.jpg',
  'packages/shirdi-weekend.jpg',
  'packages/kashi-ganga.jpg',
  'packages/vaishno-trek.jpg',
  'packages/golden-amritsar.jpg',
  'packages/south-circuit.jpg',
  'events/brahmotsavam.jpg',
  'events/vaikunta-ekadasi.jpg',
  'events/sarva-darshan.jpg',
  'events/ganga-aarti.jpg',
  'events/guru-purnima-shirdi.jpg',
  'events/kanipakam-festival.jpg',
  'misc/hero-backdrop.jpg',
  'misc/hero-gopuram.jpg',
  'misc/plan-pilgrimage.jpg',
  'misc/prasadam-laddoo.jpg',
  'misc/tirupati-laddoo.jpg',
]

async function wikiThumbUrl(search) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.searchParams.set('action', 'query')
  api.searchParams.set('format', 'json')
  api.searchParams.set('generator', 'search')
  api.searchParams.set('gsrnamespace', '6')
  api.searchParams.set('gsrsearch', search)
  api.searchParams.set('gsrlimit', '1')
  api.searchParams.set('prop', 'imageinfo')
  api.searchParams.set('iiprop', 'url')
  api.searchParams.set('iiurlwidth', '1280')

  const res = await fetch(api, { headers: { 'User-Agent': 'PresentTrip-AssetSync/1.0' } })
  if (!res.ok) throw new Error(`Wiki API ${res.status}`)
  const data = await res.json()
  const page = Object.values(data.query?.pages ?? {})[0]
  const info = page?.imageinfo?.[0]
  if (!info?.thumburl) throw new Error('No image found')
  return info.thumburl
}

async function downloadUrl(dest, url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PresentTrip-AssetSync/1.0' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 500) throw new Error(`Too small (${buf.length}b)`)
  await writeFile(dest, buf)
  return buf.length
}

async function downloadPicsum(rel) {
  const seed = rel.replace(/\//g, '-').replace(/\.jpg$/, '')
  const w = rel.includes('hero-backdrop') ? 2400 : rel.includes('packages') ? 1400 : 900
  const h = rel.includes('hero-backdrop') ? 1350 : rel.includes('packages') ? 500 : 600
  const url = `https://picsum.photos/seed/${seed}/${w}/${h}`
  return downloadUrl(join(PUBLIC, rel), url)
}

async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('Downloading Darshan images…\n')
  let ok = 0
  let fail = 0

  for (const [rel, search] of Object.entries(WIKI_SEARCH)) {
    const dest = join(PUBLIC, rel)
    await mkdir(dirname(dest), { recursive: true })
    try {
      const thumb = await wikiThumbUrl(search)
      const bytes = await downloadUrl(dest, thumb)
      console.log(`  ✓ ${rel} (wiki, ${Math.round(bytes / 1024)} KB)`)
      ok++
      await new Promise((r) => setTimeout(r, 300))
    } catch (e) {
      console.error(`  ✗ ${rel}: ${e.message}`)
      fail++
    }
  }

  for (const rel of PICSUM_ASSETS) {
    const dest = join(PUBLIC, rel)
    await mkdir(dirname(dest), { recursive: true })
    try {
      const bytes = await downloadPicsum(rel)
      console.log(`  ✓ ${rel} (picsum, ${Math.round(bytes / 1024)} KB)`)
      ok++
      await new Promise((r) => setTimeout(r, 150))
    } catch (e) {
      console.error(`  ✗ ${rel}: ${e.message}`)
      fail++
    }
  }

  const fallback = join(PUBLIC, 'temples/srikalahasti.jpg')
  const hasFallback = await fileExists(fallback)
  for (const rel of Object.keys(WIKI_SEARCH)) {
    const dest = join(PUBLIC, rel)
    if (!(await fileExists(dest)) && hasFallback) {
      await copyFile(fallback, dest)
      console.log(`  ↻ ${rel} (copied fallback)`)
      ok++
      fail = Math.max(0, fail - 1)
    }
  }

  console.log(`\nDone: ${ok} files in public/darshan/`)
  if (fail > 0) console.warn(`${fail} required manual retry`)
}

main()
