import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

function toUnified(str: string) {
  return Array.from(str)
    .map(e => e.codePointAt(0).toString(16))
    .join("-")
    .toLowerCase();
}

function tokenize(text: string) {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
  const raw: any[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = emojiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      raw.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    raw.push({ type: "emoji", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    raw.push({ type: "text", value: text.slice(lastIndex) });
  }

  const tokens: any[] = [];
  for (const seg of raw) {
    if (seg.type === "emoji") {
      tokens.push(seg);
    } else {
      const words = seg.value.split(/\s+/).filter(w => w.length > 0);
      words.forEach(w => {
        if (tokens.length > 0) tokens.push({ type: "space" });
        tokens.push({ type: "text", value: w });
      });
    }
  }
  return tokens;
}

async function getEmojiImage(emoji: string) {
  const unified = toUnified(emoji);
  const filePath = path.join(
    process.cwd(),
    "node_modules",
    "emoji-datasource-apple",
    "img",
    "apple",
    "64",
    `${unified}.png`
  );
  if (!fs.existsSync(filePath)) return null;
  return loadImage(fs.readFileSync(filePath));
}

function getTokenWidth(ctx: any, token: any, fontSize: number) {
  if (token.type === "space") return ctx.measureText(" ").width;
  if (token.type === "emoji") return fontSize * 1.15;
  return ctx.measureText(token.value).width;
}

function buildLines(ctx: any, tokens: any[], fontSize: number, maxW: number) {
  ctx.font = `bold ${fontSize}px sans-serif`;
  const lines: any[] = [];
  let line: any[] = [];
  let lineW = 0;

  for (const token of tokens) {
    const w = getTokenWidth(ctx, token, fontSize);

    if (token.type === "space") {
      if (line.length > 0) {
        line.push({ ...token, w });
        lineW += w;
      }
      continue;
    }

    if (line.length > 0 && lineW + w > maxW) {
      while (line.length > 0 && line[line.length - 1].type === "space") {
        lineW -= line[line.length - 1].w;
        line.pop();
      }
      lines.push({ items: line, width: lineW });
      line = [{ ...token, w }];
      lineW = w;
    } else {
      line.push({ ...token, w });
      lineW += w;
    }
  }

  if (line.length > 0) {
    while (line.length > 0 && line[line.length - 1].type === "space") {
      lineW -= line[line.length - 1].w;
      line.pop();
    }
    lines.push({ items: line, width: lineW });
  }

  return lines;
}

export default async function bratnezuko(req: any, res: any) {
  const { text } = req.query;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ status: false, message: "Parameter text diperlukan" });
  }

  try {
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772793912974.jpeg");
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const tokens = tokenize(text);
    const maxWidth = 820;
    const maxHeight = 480;
    const centerX = canvas.width / 2;
    const centerY = 1245;

    let fontSize = 140;
    let lines = buildLines(ctx, tokens, fontSize, maxWidth);

    while (fontSize > 20) {
      lines = buildLines(ctx, tokens, fontSize, maxWidth);
      const totalH = lines.length * fontSize * 1.25;
      if (totalH <= maxHeight) break;
      fontSize -= 5;
    }

    const lineHeight = fontSize * 1.25;
    const totalBlockHeight = lines.length * lineHeight;
    let startY = centerY - totalBlockHeight / 2 + fontSize / 2;

    ctx.fillStyle = "#000000";
    ctx.textBaseline = "middle";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = startY + i * lineHeight;

      ctx.font = `bold ${fontSize}px sans-serif`;
      let x = centerX - line.width / 2;

      for (const token of line.items) {
        if (token.type === "text") {
          ctx.fillText(token.value, x, y);
          x += token.w;
        } else if (token.type === "space") {
          x += token.w;
        } else if (token.type === "emoji") {
          const img = await getEmojiImage(token.value);
          const size = fontSize * 1.15;
          if (img) ctx.drawImage(img, x, y - size / 2, size, size);
          x += token.w;
        }
      }
    }

    const buffer = canvas.toBuffer("image/png");
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message });
  }
}