import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const PLAYLISTS = [
  { courseId: "2", playlistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu" },
  { courseId: "3", playlistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO" },
];

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ status: "skipped", reason: "YOUTUBE_API_KEY not configured" });
  }

  const results = [];
  for (const { courseId, playlistId } of PLAYLISTS) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      results.push({ courseId, playlistId, videoCount: data.items?.length ?? 0, synced: true });
    } catch {
      results.push({ courseId, playlistId, synced: false, error: "fetch failed" });
    }
  }

  return NextResponse.json({ syncedAt: new Date().toISOString(), results });
}
