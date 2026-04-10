import { Request, Response } from "express";
import axios from "axios";

const BASE_URL = "https://api.spotify.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: "https://open.spotify.com/",
  Origin: "https://open.spotify.com/"
};

async function getToken(): Promise<string | null> {
  try {
    const { data } = await axios.get(
      "https://open.spotify.com/embed/track/3HHqVJHqwgkxWhOQ4MhLB6",
      {
        headers: {
          ...HEADERS,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
      }
    );

    const match = data.match(/"accessToken":"(BQ[^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function formatTime(ms: number) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

async function searchSpotify(query: string, limit: number = 10) {
  const token = await getToken();
  if (!token) throw new Error("Gagal mendapatkan token");

  const safeLimit = Math.max(1, Math.min(limit || 10, 50));

  const { data } = await axios.get(`${BASE_URL}/v1/search`, {
    params: {
      q: query,
      type: "track",
      limit: safeLimit,
      offset: 0
    },
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${token}`
    }
  });

  if (!data.tracks || !data.tracks.items) return [];

  return data.tracks.items.map((track: any) => ({
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
    album: track.album.name,
    duration: formatTime(track.duration_ms),
    popularity: track.popularity,
    releaseDate: track.album.release_date,
    imageUrl: track.album.images?.[0]?.url || null,
    trackUrl: `https://open.spotify.com/track/${track.id}`
  }));
}

export default async function spotifyHandler(
  req: Request,
  res: Response
) {
  const q = (req.query.q || req.body.q) as string;
  const limit = parseInt((req.query.limit || req.body.limit) as string) || 10;

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    });
  }

  try {
    const result = await searchSpotify(q, limit);

    return res.json({
      status: true,
      creator: "Aoshi",
      total: result.length,
      result
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
}