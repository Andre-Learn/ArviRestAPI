import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import { createCanvas, loadImage } from "canvas"

function toUnified(str: string) {
  return Array.from(str)
    .map(e => e.codePointAt(0)?.toString(16))
    .join("-")
    .toLowerCase()
}

function tokenize(text: string) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const raw: { type: "text" | "emoji"; value: string }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = emojiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      raw.push({ type: "text", value: text.slice(lastIndex, match.index) })
    }
    raw.push({ type: "emoji", value: match[0] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    raw.push({ type: "text", value: text.slice(lastIndex) })
  }

  const tokens: { type: "text" | "emoji" | "space"; value?: string }[] = []
  for (const seg of raw) {
    if (seg.type === "emoji") {
      tokens.push(seg)
    } else {
      const words = seg.value.split(/\s+/).filter(w => w.length > 0)
      words.forEach((w, i) => {
        if (tokens.length > 0) tokens.push({ type: "space" })
        tokens.push({ type: "text", value: w })
      })
    }
  }

  return tokens
}

async function getEmojiImage(emoji: string) {
  const unified = toUnified(emoji)
  const filePath = path.join(
    process.cwd(),
    "node_modules",
    "emoji-datasource-apple",
    "img",
    "apple",
    "64",
    `${unified}.png`
  )
  if (!fs.existsSync(filePath)) return null
  return loadImage(fs.readFileSync(filePath))
}

function getTokenWidth(ctx: CanvasRenderingContext2D, token: { type: string; value?: string; w?: number }, fontSize: number) {
  if (token.type === "space") return ctx.measureText(" ").width
  if (token.type === "emoji") return fontSize * 1.15
  return ctx.measureText(token.value || "").width
}

function buildLines(ctx: CanvasRenderingContext2D, tokens: any[], fontSize: number, maxW: number) {
  ctx.font = `bold ${fontSize}px sans-serif`
  const lines: any[] = []
  let line: any[] = []
  let lineW = 0

  for (const token of tokens) {
    const w = getTokenWidth(ctx, token, fontSize)

    if (token.type === "space") {
      if (line.length > 0) {
        line.push({ ...token, w })
        lineW += w
      }
      continue
    }

    if (line.length > 0 && lineW + w > maxW) {
      while (line.length > 0 && line[line.length - 1].type === "space") {
        lineW -= line[line.length - 1].w
        line.pop()
      }
      lines.push({ items: line, width: lineW })
      line = [{ ...token, w }]
      lineW = w
    } else {
      line.push({ ...token, w })
      lineW += w
    }
  }

  if (line.length > 0) {
    while (line.length > 0 && line[line.length - 1].type === "space") {
      lineW -= line[line.length - 1].w
      line.pop()
    }
    lines.push({ items: line, width: lineW })
  }

  return lines
}

export default async function bratAnimeHandler(req: any, res: any) {
  try {
    const text = (req.query.text || req.body?.text) as string
    if (!text || !text.trim()) return res.status(400).json({ status: false, message: "Masukkan teks" })

    const bgUrl =
      "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772989415819.jpeg"
    const bgBuffer = await fetch(bgUrl).then(r => r.buffer())
    const bg = await loadImage(bgBuffer)

    const width = 800
    const height = 800
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(bg, 0, 0, width, height)

    const tokens = tokenize(text)

    const areaX = 170
    const areaW = 460
    const areaCY = 530
    const areaMaxH = 210

    let fontSize = 72
    let lines = buildLines(ctx, tokens, fontSize, areaW)

    while (fontSize > 20) {
      const totalH = lines.length * fontSize * 1.45
      if (totalH <= areaMaxH) break
      fontSize -= 3
      lines = buildLines(ctx, tokens, fontSize, areaW)
    }

    const totalH = lines.length * fontSize * 1.45
    let y = areaCY - totalH / 2 + fontSize * 0.85

    for (const line of lines) {
      ctx.font = `bold ${fontSize}px sans-serif`
      let x = areaX + (areaW - line.width) / 2

      for (const token of line.items) {
        if (token.type === "text") {
          ctx.fillStyle = "#000000"
          ctx.textBaseline = "alphabetic"
          ctx.fillText(token.value, x, y)
          x += token.w
        } else if (token.type === "space") {
          x += token.w
        } else if (token.type === "emoji") {
          const img = await getEmojiImage(token.value)
          const size = fontSize * 1.15
          if (img) ctx.drawImage(img, x, y - size * 0.85, size, size)
          x += token.w
        }
      }

      y += fontSize * 1.45
    }

    const buffer = canvas.toBuffer("image/jpeg")
    res.setHeader("Content-Type", "image/jpeg")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)
  } catch (e: any) {
    res.status(500).json({ status: false, message: e.message || "Gagal membuat gambar" })
  }
}