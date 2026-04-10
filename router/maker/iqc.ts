import { Request, Response } from "express"

const fetchFn = (...args: any[]) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

export default async function iqcProxy(req: Request, res: Response) {
  const messageText = (req.query.text || req.body.text) as string

  if (!messageText) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }

  try {
    const d = new Date()
    const t = new Date(d.getTime() + 7 * 3600000)
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    const batteryPercentage = Math.floor(Math.random() * 100) + 1
    const url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
      t
    )}&messageText=${encodeURIComponent(messageText)}&carrierName=INDOSAT%20OORE...&batteryPercentage=${batteryPercentage}&signalStrength=4&emojiStyle=apple`

    const response = await fetchFn(url)
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", "image/png")
    return res.send(buffer)

  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message || "API error"
    })
  }
}