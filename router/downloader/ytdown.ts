import axios from "axios";
import { Request, Response } from "express";

function extractVideoId(url: string) {
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  } else if (url.includes("/shorts/")) {
    videoId = url.split("/shorts/")[1].split("?")[0];
  }
  return videoId;
}

async function ytDownload(videoUrl: string) {
  if (!videoUrl) throw Error("URL tidak boleh kosong");

  const headers = {
    "accept": "*/*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
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
    throw Error("Gagal mengambil video YouTube");
  }

  const api = data.api;
  const mediaItems = api.mediaItems || [];

  const videoFormats = mediaItems.filter((item: any) => item.type === "Video");
  const audioFormats = mediaItems.filter((item: any) => item.type === "Audio");

  const bestVideo =
    videoFormats.find((v: any) => v.mediaQuality === "FHD") ||
    videoFormats[0] ||
    null;

  const bestAudio =
    audioFormats.find((a: any) => a.mediaExtension === "MP3") ||
    audioFormats.find((a: any) => a.mediaQuality === "128K") ||
    audioFormats[0] ||
    null;

  // 🔥 FETCH FINAL LINK VIDEO
  let finalVideo = null;
  let videoSize = null;

  if (bestVideo?.mediaUrl) {
    try {
      const r: any = await axios.get(bestVideo.mediaUrl);
      finalVideo = r.data?.fileUrl || bestVideo.mediaUrl;
      videoSize = r.data?.fileSize || null;
    } catch {
      finalVideo = bestVideo.mediaUrl;
    }
  }

  // 🔥 FETCH FINAL LINK AUDIO
  let finalAudio = null;
  let audioSize = null;

  if (bestAudio?.mediaUrl) {
    try {
      const r: any = await axios.get(bestAudio.mediaUrl);
      finalAudio = r.data?.fileUrl || bestAudio.mediaUrl;
      audioSize = r.data?.fileSize || null;
    } catch {
      finalAudio = bestAudio.mediaUrl;
    }
  }

  return {
    code: 200,
    timestamp: Date.now(),
    data: {
      title: api.title || null,
      thumbnail: api.imagePreviewUrl || null,

      video: {
        url: finalVideo,
        size: videoSize
      },

      audio: {
        url: finalAudio,
        size: audioSize
      }
    }
  };
}

// 🔥 EXPORT HANDLER
export default async function handler(req: Request, res: Response) {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.json({
        status: false,
        message: "url required"
      });
    }

    const result = await ytDownload(url);

    res.json({
      status: true,
      result
    });

  } catch (err: any) {
    res.json({
      status: false,
      message: err.message
    });
  }
}