// YouTube upload utility — called by Zoom webhook handler
// Requires YOUTUBE_OAUTH_CLIENT_ID, YOUTUBE_OAUTH_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_OAUTH_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

async function getYouTubeAccessToken(): Promise<string | null> {
  try {
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

    if (!res.ok) {
      console.error("[YouTube Upload] Token refresh failed", { status: res.status });
      return null;
    }

    const data = await res.json() as { access_token?: string; error?: string };

    if (data.error || !data.access_token) {
      console.error("[YouTube Upload] Token refresh error", { error: data.error ?? "no access_token in response" });
      return null;
    }

    return data.access_token;
  } catch (err) {
    console.error("[YouTube Upload] Token fetch threw", { error: (err as Error).message });
    return null;
  }
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

  // 1. Start Zoom recording download to get Content-Length before streaming
  const recordingRes = await fetch(opts.downloadUrl, {
    headers: { Authorization: `Bearer ${opts.zoomToken}` },
  });
  if (!recordingRes.ok) throw new Error(`Failed to download Zoom recording: ${recordingRes.status}`);

  const contentLength = recordingRes.headers.get("Content-Length");
  if (!contentLength) throw new Error("Zoom recording response missing Content-Length — cannot stream to YouTube");

  // 2. Get a fresh YouTube access token
  const accessToken = await getYouTubeAccessToken();
  if (!accessToken) throw new Error("Could not obtain YouTube access token — check OAuth credentials");

  // 3. Initiate a resumable upload session to get the upload URI
  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": contentLength,
      },
      body: JSON.stringify({
        snippet: { title: opts.title, description: opts.description, categoryId: "27" },
        status: { privacyStatus: "unlisted" },
      }),
    }
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Failed to initiate YouTube resumable upload: ${initRes.status} — ${errText}`);
  }

  const uploadUri = initRes.headers.get("Location");
  if (!uploadUri) throw new Error("YouTube did not return a resumable upload URI");

  // 4. Stream the Zoom recording body directly to YouTube — no full buffer in memory
  const uploadRes = await fetch(uploadUri, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": contentLength,
    },
    body: recordingRes.body,
    // @ts-expect-error — Node.js fetch supports duplex streaming
    duplex: "half",
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`YouTube upload failed: ${uploadRes.status} — ${errText}`);
  }

  const uploadData = await uploadRes.json() as { id?: string };
  if (!uploadData.id) throw new Error("YouTube upload response did not include a video ID");

  return { youtubeVideoId: uploadData.id };
}
