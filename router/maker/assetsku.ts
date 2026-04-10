/**
 * Local mock for @putuofc/assetsku
 * Replace URL strings with actual GitHub raw URLs for your assets
 */
import path from "path"

const __dir = __dirname

// ── Font Paths (local files in router/maker/) ───────────────────
const FONTS: Record<string, string> = {
  "ARRIAL":         path.join(__dir, "arial.ttf"),
  "ARIAL":          path.join(__dir, "arial.ttf"),
  "ARIAL-BOLD":     path.join(__dir, "Arial Bold.ttf"),
  "ARRIAL-BOLD":    path.join(__dir, "Arial Bold.ttf"),
  "POPPINS-BOLD":   path.join(__dir, "Poppins-Bold.ttf"),
  "POPPINS-MEDIUM": path.join(__dir, "Poppins-Bold.ttf"),
  "THEBOLDFONT":    path.join(__dir, "Arial Bold.ttf"),
  "CUBESTMEDIUM":   path.join(__dir, "Arial Bold.ttf"),
  "MONTSERRAT-BOLD":path.join(__dir, "Arial Bold.ttf"),
  "Montserrat-Bold":path.join(__dir, "Arial Bold.ttf"),
  "IMPACT":         path.join(__dir, "impact.ttf"),
  "NULIS":          path.join(__dir, "nulis.ttf"),
  "CHARINE":        path.join(__dir, "Charine.otf"),
  "SIGN":           path.join(__dir, "Charine.otf"),
  "OCR":            path.join(__dir, "arial.ttf"),
  "NUNITO":         path.join(__dir, "Nunito-MediumItalic.ttf"),
  "TEUTON":         path.join(__dir, "Teuton.otf"),
}

// ── Image URLs ──────────────────────────────────────────────────
const IMAGES: Record<string, string> = {
  // ⚠️ Isi URL raw gambar sesuai asset kamu
  // Contoh: "https://raw.githubusercontent.com/USER/REPO/main/gambar.png"
  "BEAUTIFUL":      "",
  "BGAY":           "",
  "GYF":            "",
  "TEMPLATE":       "",  // ektp template
  "FACEPALM":       "",
  "GOODBYE":        "",
  "GOODBYE2":       "",
  "WELCOME":        "",
  "WELCOME2":       "",
  "WELCOME3":       "",
  "DEFAULT_AVATAR": "https://files.catbox.moe/g45kly.jpg",
  "DEFAULT_BG":     "https://files.catbox.moe/g45kly.jpg",
  "DEFAULT_FRAME":  "",
}

const assets = {
  font: {
    get(key: string): string {
      const p = FONTS[key] || FONTS[key.toUpperCase()]
      if (!p) {
        console.warn(`[assetsku] Font key '${key}' not found, using fallback`)
        return path.join(__dir, "arial.ttf")
      }
      return p
    }
  },
  image: {
    get(key: string): string {
      const url = IMAGES[key] || IMAGES[key.toUpperCase()] || ""
      if (!url) {
        console.warn(`[assetsku] Image key '${key}' not configured in router/maker/assetsku.ts`)
      }
      return url
    }
  },
  // Direct property accessors (used by nokia.ts, flaming.ts, ephoto3.ts)
  nokia:    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771087955018.jpeg",
  flaming:  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771089889521.jpeg",
  ephoto:   "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771091097762.jpeg",
}

export default assets
