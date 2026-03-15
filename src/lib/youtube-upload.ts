// YouTube upload utility — called by Zoom webhook handler
// Requires YOUTUBE_OAUTH_CLIENT_ID, YOUTUBE_OAUTH_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_OAUTH_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

async function getYouTubeAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID ?? "",
      client_secret: YOUTUBE_CLIENT_SECRET ?? "",
      refresh_token: YOUTUBE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

export async function uploadRecordingToYouTube(opts: {
  downloadUrl: string;
  title: string;
  description: string;
  zoomToken: string;
}): Promise<{ youtubeVideoId: string } | null> {
  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    console.log("[YouTube Upload] Skipped — OAuth not configured");
    return null;
  }

  // 1. Download from Zoom
  const recordingRes = await fetch(opts.downloadUrl, {
    headers: { Authorization: `Bearer ${opts.zoomToken}` },
  });
  if (!recordingRes.ok) throw new Error("Failed to download Zoom recording");
  const videoBuffer = Buffer.from(await recordingRes.arrayBuffer());

  // 2. Upload to YouTube
  const accessToken = await getYouTubeAccessToken();
  const metadata = {
    snippet: { title: opts.title, description: opts.description, categoryId: "27" },
    status: { privacyStatus: "unlisted" },
  };

  const boundary = "iti_boundary_xyz";
  const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const videoPart = `--${boundary}\r\nContent-Type: video/mp4\r\n\r\n`;
  const closing = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(metaPart),
    Buffer.from(videoPart),
    videoBuffer,
    Buffer.from(closing),
  ]);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary="${boundary}"`,
      },
      body,
    }
  );
  const uploadData = await uploadRes.json();
  return { youtubeVideoId: uploadData.id };
}
