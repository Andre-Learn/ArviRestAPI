import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { createCanvas, loadImage, registerFont } from 'canvas'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const fontPath = path.join(process.cwd(), 'tmp_font.ttf')

async function ensureFont() {
  if (!fs.existsSync(fontPath)) {
    const res = await fetch('https://raw.githubusercontent.com/KazzTzyPrivat7777/KazzCdn/main/file_1774357026967.octet-stream')
    const buffer = await res.buffer()
    fs.writeFileSync(fontPath, buffer)
  }
  registerFont(fontPath, { family: 'BratFont' })
}

const toUnified = (str) => Array.from(str).map(e => e.codePointAt(0).toString(16)).join('-').toLowerCase()

const getEmojiImage = async (emoji) => {
  const unified = toUnified(emoji)
  const filePath = path.join(process.cwd(), 'node_modules/emoji-datasource-apple/img/apple/64', `${unified}.png`)
  if (!fs.existsSync(filePath)) return null
  return loadImage(fs.readFileSync(filePath))
}

const tokenize = (t) => {
  const re = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const raw = []
  let last = 0, m
  while ((m = re.exec(t)) !== null) {
    if (m.index > last) raw.push({ type: 'text', value: t.slice(last, m.index) })
    raw.push({ type: 'emoji', value: m[0] })
    last = m.index + m[0].length
  }
  if (last < t.length) raw.push({ type: 'text', value: t.slice(last) })
  const tokens = []
  for (const seg of raw) {
    if (seg.type === 'emoji') { tokens.push(seg); continue }
    const words = seg.value.split(/\s+/).filter(w => w.length > 0)
    words.forEach(w => { if (tokens.length > 0) tokens.push({ type: 'space' }); tokens.push({ type: 'text', value: w }) })
  }
  return tokens
}

const getW = (ctx, tok, fs) => {
  if (tok.type === 'space') return ctx.measureText(' ').width
  if (tok.type === 'emoji') return fs * 1.15
  return ctx.measureText(tok.value).width
}

const buildLines = (ctx, tokens, fs, maxW) => {
  ctx.font = `${fs}px BratFont`
  const lines = []
  let line = [], lineW = 0
  for (const tok of tokens) {
    const w = getW(ctx, tok, fs)
    if (tok.type === 'space') { if (line.length > 0) { line.push({ ...tok, w }); lineW += w } continue }
    if (line.length > 0 && lineW + w > maxW) {
      while (line.length > 0 && line[line.length - 1].type === 'space') { lineW -= line[line.length - 1].w; line.pop() }
      lines.push({ items: line, width: lineW })
      line = [{ ...tok, w }]; lineW = w
    } else { line.push({ ...tok, w }); lineW += w }
  }
  if (line.length > 0) {
    while (line.length > 0 && line[line.length - 1].type === 'space') { lineW -= line[line.length - 1].w; line.pop() }
    lines.push({ items: line, width: lineW })
  }
  return lines
}

const renderBrat = async (text, bgColor, textColor) => {
  const SIZE = 512
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bgColor || '#FFFFFF'
  ctx.fillRect(0, 0, SIZE, SIZE)

  const tokens = tokenize(text.toLowerCase())

  let fontSize = 150
  let lines = buildLines(ctx, tokens, fontSize, SIZE - 40)

  while (fontSize > 16) {
    lines = buildLines(ctx, tokens, fontSize, SIZE - 40)
    ctx.font = `${fontSize}px BratFont`
    if (lines.length * fontSize * 1.15 <= SIZE - 40) break
    fontSize -= 2
  }

  let y = 20 + fontSize

  for (const line of lines) {
    let x = 20
    for (const tok of line.items) {
      if (tok.type === 'text') {
        ctx.fillStyle = textColor || '#000000'
        ctx.fillText(tok.value, x, y)
        x += tok.w
      } else if (tok.type === 'space') {
        x += tok.w
      } else if (tok.type === 'emoji') {
        const img = await getEmojiImage(tok.value)
        const size = fontSize * 1.15
        if (img) ctx.drawImage(img, x, y - size * 0.85, size, size)
        x += tok.w
      }
    }
    y += fontSize * 1.15
  }

  return canvas.toBuffer('image/png')
}

let handler = async (m, { KazzTzy, text }) => {
  if (!text) throw 'Masukkan warna!\nContoh:\n.brathd merah halo'

  await ensureFont()

  let [warna, ...teksArr] = text.split(' ')
  let teks = teksArr.join(' ')

  const warnaMap = {
    merah: '#ff0000',
    biru: '#0000ff',
    hijau: '#00ff00',
    kuning: '#ffff00',
    ungu: '#800080',
    hitam: '#000000',
    putih: '#ffffff'
  }

  let bg = warnaMap[warna.toLowerCase()] || warna
  let textColor = bg === '#000000' ? '#ffffff' : '#000000'

  try {
    await KazzTzy.sendMessage(m.chat, { react: { text: global.react, key: m.key } })

    const buffer = await renderBrat(teks, bg, textColor)

    const sticker = new Sticker(buffer, {
      pack: global.namebot || 'Z4Z',
      author: global.namaOwner || 'Owner',
      type: StickerTypes.FULL,
      quality: 50
    })

    const stickerBuffer = await sticker.toBuffer()
    await KazzTzy.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    await KazzTzy.sendMessage(m.chat, { react: { text: global.reactSuccess, key: m.key } })

  } catch (e) {
    console.error(e)
    await KazzTzy.sendMessage(m.chat, { react: { text: global.reactError, key: m.key } })
    throw 'Gagal membuat sticker'
  }
}

handler.help = ['brathd warna teks']
handler.tags = ['sticker']
handler.command = /^bratcolor$/i

export default handler