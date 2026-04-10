import { Request, Response } from "express"

const fetchFn = (...args: any[]) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))

export default async function qcProxy(req: Request, res: Response) {
  const text = (req.query.text || req.body.text) as string
  const name = (req.query.name || req.body.name || "User") as string
  const photo = (req.query.photo || req.body.photo || "") as string

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }

  try {
    const response = await fetchFn("https://brat.siputzx.my.id/quoted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            from: {
              id: 1,
              first_name: name,
              last_name: "",
              name: "",
              photo: {
                url: photo
              }
            },
            text,
            entities: [],
            avatar: true,
            media: {
              url: ""
            },
            mediaType: "",
            replyMessage: {
              name: "",
              text: "",
              entities: [],
              chatId: 1
            }
          }
        ],
        backgroundColor: "#F5F5F5",
        width: 512,
        height: 512,
        scale: 2,
        type: "quote",
        format: "png",
        emojiStyle: "apple"
      })
    })

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