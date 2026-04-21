import axios from "axios";
import FormData from "form-data";
import { Request, Response } from "express";

async function teraboxdl(url: string) {
  const form = new FormData();
  form.append("action", "terabox_fetch");
  form.append("url", url);
  form.append("nonce", "96dddaff35");

  const res = await axios.post(
    "https://terabxdownloader.org/wp-admin/admin-ajax.php",
    form,
    {
      headers: {
        ...form.getHeaders(),
        "user-agent": "Mozilla/5.0",
        "accept": "*/*",
        "referer": "https://terabxdownloader.org/",
        "x-requested-with": "XMLHttpRequest"
      }
    }
  );

  const result = res.data;
  const data = result.data;

  const files = data?.["📄 Files"] || [];

  return {
    status: data?.["✅ Status"] || "Unknown",
    files: files.map((f: any) => ({
      name: f["📂 Name"] || "",
      downloadLink: f["🔽 Direct Download Link"] || "",
      size: f["📏 Size"] || ""
    })),
    shortLink: data?.["🔗 ShortLink"] || ""
  };
}

// 🔥 EXPORT HANDLER
export default async function handler(req: Request, res: Response) {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.json({
        status: false,
        message: "url parameter required"
      });
    }

    const result = await teraboxdl(url);

    res.json({
      status: true,
      result
    });

  } catch (err: any) {
    console.log("TERABOX ERROR:", err.response?.data || err.message);

    res.json({
      status: false,
      message: err.response?.data || err.message
    });
  }
}