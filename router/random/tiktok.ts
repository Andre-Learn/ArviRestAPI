import { Request, Response } from 'express';
import axios from 'axios';

const queryList = [
  "islami","lucu","sepak%20bola","qoutes%20islami","ceramah%20singkat","anime","video%20menarik",
  "funny%20video","video%20viral","humor","video%20sad%20vibes","lagu%20galau","sad%20story",
  "vibes%20galau","Moonlight","moon","vibes%20bulan%20malam%20hari","vibes%20bintang","vibes%20hujan",
  "vibes%20bulan","vibes%20laut","vibes%20anime%20sad","vibes%20melancholy","vibes%20sunset","vibes%20nostalgia"
];

async function getRandomTikTok(q: string) {
  const res = await axios.post(
    'https://tikwm.com/api/feed/search',
    { keywords: q, count: 10, cursor: 0, HD: 1 },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie: 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      }
    }
  );

  const videos = res.data?.data?.videos;
  if (!videos || !videos.length) throw new Error('Video tidak ditemukan');

  const v = videos[Math.floor(Math.random() * videos.length)];
  return {
    title: v.title,
    no_watermark: "https://tikwm.com" + v.play,
    watermark: "https://tikwm.com" + v.wmplay,
    author: {
      nickname: v.author.nickname,
      avatar: v.author.avatar
    },
    stats: {
      plays: v.play_count,
      likes: v.digg_count,
      comments: v.comment_count,
      shares: v.share_count
    }
  };
}

export default async function tiktokRandomHandler(req: Request, res: Response) {
  try {

    const q = queryList[Math.floor(Math.random() * queryList.length)];

    const video = await getRandomTikTok(q);

    res.json({
      status: true,
      query: decodeURIComponent(q),
      result: video
    });

  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message || 'Terjadi kesalahan saat mengambil video TikTok.'
    });
  }
}
