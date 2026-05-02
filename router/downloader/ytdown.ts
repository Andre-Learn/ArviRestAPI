import axios from "axios";
import { Request, Response } from "express";

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

  const video = mediaItems.find((v: any) => v.type === "Video") || null;
  const audio = mediaItems.find((a: any) => a.type === "Audio") || null;

  let finalVideo = null;
  let finalAudio = null;

  // 🔥 resolve video
  if (video?.mediaUrl) {
    try {
      const r: any = await axios.get(video.mediaUrl);
      finalVideo = r.data?.downloadUrl || r.data?.fileUrl || video.mediaUrl;
    } catch {
      finalVideo = video.mediaUrl;
    }
  }

  // 🔥 resolve audio
  if (audio?.mediaUrl) {
    try {
      const r: any = await axios.get(audio.mediaUrl);
      finalAudio = r.data?.downloadUrl || r.data?.fileUrl || audio.mediaUrl;
    } catch {
      finalAudio = audio.mediaUrl;
    }
  }

  return {
    title: api.title,
    thumbnail: api.imagePreviewUrl,
    video: finalVideo,
    audio: finalAudio
  };
}

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