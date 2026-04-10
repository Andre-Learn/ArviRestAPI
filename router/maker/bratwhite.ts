import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import fs from "fs"
import path from "path"

function toUnified(str: string) {
  return Array.from(str)
    .map(e => e.codePointAt(0).toString(16))
    .join("-")
    .toLowerCase()
}

function tokenize(text: string) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const raw: any[] = []
  let lastIndex = 0
  let match

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

  const tokens: any[] = []
  for (const seg of raw) {
    if (seg.type === "emoji") {
      tokens.push(seg)
    } else {
      const words = seg.value.split(/\s+/).filter(w => w.length > 0)
      words.forEach((w) => {
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

function getTokenWidth(ctx: any, token: any, fontSize: number) {
  if (token.type === "space") return ctx.measureText(" ").width
  if (token.type === "emoji") return fontSize * 1.15
  return ctx.measureText(token.value).width
}

function buildLines(ctx: any, tokens: any[], fontSize: number, maxW: number) {
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

export default async function bratwhite(req: Request, res: Response) {
  const { text } = req.query
  if (!text) return res.status(400).json({ error: "text required" })

  try {
    const bgUrl =
      "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771727655279.jpeg"
    const bg = await loadImage(bgUrl)

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const maxWidth = 480
    const maxHeight = 280
    const centerX = canvas.width / 2 + 10
    const centerY = canvas.height / 2 + 285
    const rotationAngle = -7.5 * Math.PI / 180

    const tokens = tokenize(String(text))

    let fontSize = 130
    let lines = buildLines(ctx, tokens, fontSize, maxWidth)

    while (fontSize > 10) {
      lines = buildLines(ctx, tokens, fontSize, maxWidth)
      const totalHeight = lines.length * fontSize * 1.2
      if (totalHeight <= maxHeight) break
      fontSize -= 2
    }

    const lineHeight = fontSize * 1.2
    const totalHeight = lines.length * lineHeight

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(rotationAngle)
    ctx.fillStyle = "#000000"
    ctx.textBaseline = "middle"

    let startY = -(totalHeight / 2) + (lineHeight / 2)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const y = startY + i * lineHeight

      ctx.font = `bold ${fontSize}px sans-serif`
      let currentX = -line.width / 2

      for (const token of line.items) {
        if (token.type === "text") {
          ctx.fillText(token.value, currentX, y)
          currentX += token.w
        } else if (token.type === "space") {
          currentX += token.w
        } else if (token.type === "emoji") {
          const img = await getEmojiImage(token.value)
          const size = fontSize * 1.15
          if (img) ctx.drawImage(img, currentX, y - size / 2, size, size)
          currentX += token.w
        }
      }
    }

    ctx.restore()

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ error: err.message || "error" })
  }
}