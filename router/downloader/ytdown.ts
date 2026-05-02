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

  return {
    code: 200,
    timestamp: Date.now(),
    data: {
      id: api.id || null,
      title: api.title || null,
      description: api.description || null,
      thumbnail: api.imagePreviewUrl || null,
      preview_url: api.previewUrl || null,
      permanent_link: api.permanentLink || null,
      service: api.service || null,
      author: {
        name: api.userInfo?.name || null,
        username: api.userInfo?.username || null,
        user_id: api.userInfo?.userId || null,
        avatar: api.userInfo?.userAvatar || null,
        channel_url: api.userInfo?.internalUrl || null,
        date_joined: api.userInfo?.dateJoined || null
      },
      stats: {
        media_count: api.mediaStats?.mediaCount || null,
        followers: api.mediaStats?.followersCount || null,
        views: api.mediaStats?.viewsCount || null
      },
      video_formats: videoFormats.map((v: any) => ({
        url: v.mediaUrl || null,
        quality: v.mediaQuality || null,
        resolution: v.mediaRes || null,
        duration: v.mediaDuration || null,
        extension: v.mediaExtension || null,
        file_size: v.mediaFileSize || null,
        task: v.mediaTask || null
      })),
      audio_formats: audioFormats.map((a: any) => ({
        url: a.mediaUrl || null,
        quality: a.mediaQuality || null,
        duration: a.mediaDuration || null,
        extension: a.mediaExtension || null,
        file_size: a.mediaFileSize || null,
        task: a.mediaTask || null
      })),
      best_video: bestVideo
        ? {
            url: bestVideo.mediaUrl,
            quality: bestVideo.mediaQuality,
            resolution: bestVideo.mediaRes,
            file_size: bestVideo.mediaFileSize
          }
        : null,
      best_audio: bestAudio
        ? {
            url: bestAudio.mediaUrl,
            quality: bestAudio.mediaQuality,
            extension: bestAudio.mediaExtension,
            file_size: bestAudio.mediaFileSize
          }
        : null
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