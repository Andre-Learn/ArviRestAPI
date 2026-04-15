import axios from "axios";
import { Request, Response } from "express";

class SaveWeb2ZipAPI {
  baseURL = "https://copier.saveweb2zip.com";

  headers = {
    "accept": "*/*",
    "content-type": "application/json",
    "origin": "https://saveweb2zip.com",
    "referer": "https://saveweb2zip.com/",
    "user-agent": "Mozilla/5.0"
  };

  async copySite(url: string) {
    const payload = {
      url,
      renameAssets: false,
      saveStructure: false,
      alternativeAlgorithm: false,
      mobileVersion: false
    };

    const res = await axios.post(
      `${this.baseURL}/api/copySite`,
      payload,
      { headers: this.headers }
    );

    return res.data;
  }

  async getStatus(md5: string) {
    const res = await axios.get(
      `${this.baseURL}/api/getStatus/${md5}`,
      { headers: this.headers }
    );

    return res.data;
  }

  async wait(md5: string) {
    for (let i = 0; i < 30; i++) {
      const status = await this.getStatus(md5);

      if (status.isFinished) return status;

      await new Promise(r => setTimeout(r, 2000));
    }

    throw new Error("Timeout");
  }
}

// 🔥 HANDLER
export default async function handler(req: Request, res: Response) {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.json({
        status: false,
        message: "url parameter required"
      });
    }

    const api = new SaveWeb2ZipAPI();

    // start copy
    const start = await api.copySite(url);

    if (!start.md5) {
      return res.json({
        status: false,
        message: "Gagal memulai proses"
      });
    }

    // tunggu selesai
    const result = await api.wait(start.md5);

    if (!result.success) {
      return res.json({
        status: false,
        message: "Gagal saat proses"
      });
    }

    // 🔥 return link download (bukan save file)
    const downloadUrl = `https://copier.saveweb2zip.com/api/downloadArchive/${start.md5}`;

    res.json({
      status: true,
      result: {
        url: result.url,
        files: result.copiedFilesAmount,
        download: downloadUrl
      }
    });

  } catch (err: any) {
    console.log("SAVEWEB ERROR:", err.response?.data || err.message);

    res.json({
      status: false,
      message: err.response?.data || err.message
    });
  }
}