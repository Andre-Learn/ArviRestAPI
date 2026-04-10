import { Request, Response } from "express"
import axios from "axios"
import * as cheerio from "cheerio"

const CONFIG = {
  searchQuery: "",
  scaEsv: "",
  cookies: {
    secureBucket: "",
    aec: "",
    nid: "529=OKvnlQof9VyGSj8i4D78MACTB3eJrt4czjKWdQ9HLbafIcHkasxr_4NQuVFh6JG1XwmnpCGAxCg4OKdNr5goE6mmDz8o75eZkPcSk-aIrs_aV1NoIQlhhjaLHnbeuElar-VqRkDh25RMKL7dlyC576E5Pm4GQ5BfFZMStAJ-1pRpu08voGD_iZ7_OGGfu5uQqyMP__oIrIVK9OQgmv1OL86_fG7NOmFdZDK9NC48GHVCp6l7mmG0jaQZYPIJfPtgZcwquFASMnwfEB2HTpTkI39tNTQ8qqmp5RH5yyB0AwfQFpvXgAuOz4NSj4ELZlUCZBZzNMI1BtFONSFeW6beey6vBCDbuAI3o9OifdYSIz3TIScAz6ovtiDoPfw4Fl4sIEoEFILeePAc3Dg7vqK-BS2bZigFAzsgJuHjSU6RZRk12VU70Ibr_b-nViQE5d1nGw",
    dv: "",
    secureStrp: ""
  },
  userAgent:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
  chromeVersion: "137"
}

const buildUrl = () => {
  const params = new URLSearchParams({
    q: CONFIG.searchQuery,
    sca_esv: CONFIG.scaEsv,
    source: "hp"
  })
  return `https://www.google.com/search?${params.toString()}`
}

const buildCookieString = () => {
  return [
    `__Secure-BUCKET=${CONFIG.cookies.secureBucket}`,
    `AEC=${CONFIG.cookies.aec}`,
    `NID=${CONFIG.cookies.nid}`,
    `DV=${CONFIG.cookies.dv}`,
    `__Secure-STRP=${CONFIG.cookies.secureStrp}`
  ].join("; ")
}

async function GoogleLyrics(judul: string) {
  CONFIG.searchQuery = "lirik+" + judul.replaceAll(" ", "+")

  const url = buildUrl()

  const res = await axios.get(url, {
    headers: {
      "authority": "www.google.com",
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "user-agent": CONFIG.userAgent,
      "sec-ch-ua": `"Chromium";v="${CONFIG.chromeVersion}"`,
      "cookie": buildCookieString()
    }
  })

  const $ = cheerio.load(res.data)

  const lyrics = $('div[data-attrid="kc:/music/recording_cluster:lyrics"] div[jsname="U8S5sf"]')
    .map((_, div) =>
      $(div)
        .find('span[jsname="YS01Ge"]')
        .map((_, s) => $(s).text().trim())
        .get()
        .join("\n")
    )
    .get()
    .join("\n\n")

  return {
    title: $('div[data-attrid="title"]').text().trim(),
    subtitle: $('div[data-attrid="subtitle"]').text().trim(),
    lyrics: lyrics || "Lirik tidak ditemukan"
  }
}

export default async function lyricHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await GoogleLyrics(q)

    return res.json({
      status: true,
      creator: "KazzTzy",
      result
    })
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    })
  }
}