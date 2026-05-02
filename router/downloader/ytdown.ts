import axios from "axios";
import { Request, Response } from "express";

// 🔥 WAIT SAMPAI FILE READY
async function resolveWorker(url: string, maxTry = 10) {
  for (let i = 0; i < maxTry; i++) {
    try {
      const res = await axios.get(url);
      const data = res.data;

      const final =
        data?.downloadUrl ||
        data?.fileUrl ||
        null;

      if (final) return final;

    } catch {}

    await new Promise(r => setTimeout(r, 1500));
  }

  return null;
}

// 🔥 MAIN FUNCTION
async function ytDownload(videoUrl: string) {
  if (!videoUrl) throw Error("URL tidak boleh kosong");

  const headers = {
    "accept": "*/*",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "origin": "https://app.ytdown.to",
    "referer": "https://app.ytdown.to/en27/",
    "user-agent": "Mozilla/5.0",
    "x-requested-with": "XMLHttpRequest"
  };

  const body = new URLSearchParams();
  body.append("url", videoUrl);

  const res = await axios.post(
    "https://app.ytdown.to/proxy.php",
    body.toString(),
    { headers }
  );

  const data = res.data;

  if (!data.api || data.api.status !== "ok") {
    throw Error("Gagal mengambil video");
  }

  const api = data.api;
  const mediaItems = api.mediaItems || [];

  const video =
    mediaItems.find((v: any) => v.type === "Video") || null;

  const audio =
    mediaItems.find((a: any) => a.type === "Audio") || null;

  let finalVideo = null;
  let finalAudio = null;

  // 🔥 PROSES VIDEO
  if (video?.mediaUrl) {
    finalVideo = await resolveWorker(video.mediaUrl);
  }

  // 🔥 PROSES AUDIO
  if (audio?.mediaUrl) {
    finalAudio = await resolveWorker(audio.mediaUrl);
  }

  // ❗ WAJIB: pastiin dua-duanya ready
  if (!finalVideo || !finalAudio) {
    throw new Error("File masih diproses, coba lagi");
  }

  return {
    title: api.title,
    thumbnail: api.imagePreviewUrl,
    video: finalVideo,
    audio: finalAudio
  };
}

// 🔥 EXPRESS HANDLER
export default async function handler(req: Request, res: Response) {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: "url required"
      });
    }

    const result = await ytDownload(url);

    return res.status(200).json({
      status: true,
      result
    });

  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
}