import axios from "axios";
import { Request, Response } from "express";

class AllInOneDownloader {
  baseURL = "https://allinonedownloader.com";
  endpoint = "/system/3c829fbbcf0387c.php";

  async download(url: string) {
    const headers = {
      "accept": "*/*",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "origin": this.baseURL,
      "referer": `${this.baseURL}/`,
      "user-agent": "Mozilla/5.0"
    };

    const payload = new URLSearchParams({
      url: url,
      token: "ac98e0708b18806a7e0aedaf8bfd135b9605ce9e617aebbdf3118d402ae6f15f",
      urlhash: "/EW6oWxKREb5Ji1lQRgY2f4FkImCr6gbFo1HX4VAUuiJrN+7veIcnrr+ZrfMg0Jyo46ABKmFUhf2LpwuIxiFJZZObl9tfJG7E9EMVNIbkNyiqCIdpc61WKeMmmbMW+n6"
    });

    const res = await axios.post(
      `${this.baseURL}${this.endpoint}`,
      payload.toString(),
      { headers }
    );

    return res.data;
  }
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

    const downloader = new AllInOneDownloader();
    const result = await downloader.download(url);

    res.json({
      status: true,
      result
    });

  } catch (err: any) {
    console.log("DOWNLOADER ERROR:", err.response?.data || err.message);

    res.json({
      status: false,
      message: err.response?.data || err.message
    });
  }
}