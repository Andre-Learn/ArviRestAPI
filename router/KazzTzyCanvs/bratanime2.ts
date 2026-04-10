import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import fs from "fs"
import path from "path"

function toUnified(str) {
  return Array.from(str)
    .map(e => e.codePointAt(0).toString(16))
    .join("-")
    .toLowerCase()
}

function tokenize(text) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
  const raw = []
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

  const tokens = []
  for (const seg of raw) {
    if (seg.type === "emoji") tokens.push(seg)
    else {
      const words = seg.value.split(/\s+/).filter(w => w.length > 0)
      words.forEach((w, i) => {
        if (tokens.length > 0) tokens.push({ type: "space" })
        tokens.push({ type: "text", value: w })
      })
    }
  }

  return tokens
}

async function getEmojiImage(emoji) {
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

function getTokenWidth(ctx, token, fontSize) {
  if (token.type === "space") return ctx.measureText(" ").width
  if (token.type === "emoji") return fontSize * 1.15
  return ctx.measureText(token.value).width
}

function buildLines(ctx, tokens, fontSize, maxW) {
  ctx.font = `bold ${fontSize}px sans-serif`
  const lines = []
  let line = []
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
      lines.push({ items: line, width: lineW })
      line = [{ ...token, w }]
      lineW = w
    } else {
      line.push({ ...token, w })
      lineW += w
    }
  }

  if (line.length > 0) lines.push({ items: line, width: lineW })

  return lines
}

export default async function bratanime2(req, res) {

  try {

    const { text } = req.query

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Parameter text wajib diisi"
      })
    }

    const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229408480.jpeg"
    const bg = await loadImage(bgUrl)

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0)

    const boxX = canvas.width * 0.48
    const boxY = canvas.height * 0.47
    const boxW = canvas.width * 0.40
    const boxH = canvas.height * 0.30

    const tokens = tokenize(text)

    let fontSize = 78
    let lines = buildLines(ctx, tokens, fontSize, boxW)

    const lineHeight = fontSize * 1.1
    let startY = boxY + 90

    ctx.fillStyle = "#000000"
    ctx.textBaseline = "top"

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {

      const line = lines[lineIndex]
      const y = startY + lineIndex * lineHeight

      ctx.font = `bold ${fontSize}px sans-serif`

      let currentX = boxX + boxW / 2 - line.width / 2

      for (const token of line.items) {

        if (token.type === "text") {
          ctx.fillText(token.value, currentX, y)
          currentX += token.w
        }

        else if (token.type === "space") {
          currentX += token.w
        }

        else if (token.type === "emoji") {
          const img = await getEmojiImage(token.value)
          const size = fontSize * 1.15
          if (img) ctx.drawImage(img, currentX, y, size, size)
          currentX += token.w
        }
      }
    }

    const buffer = canvas.toBuffer("image/png")

    res.set({
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
      "Cache-Control": "public, max-age=3600"
    })

    res.send(buffer)

  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}