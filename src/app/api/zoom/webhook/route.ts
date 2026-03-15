import { NextResponse } from "next/server";
import crypto from "crypto";
import { uploadRecordingToYouTube } from "@/lib/youtube-upload";
import { getZoomToken } from "@/lib/zoom";

function verifyZoomWebhook(body: string, signature: string, timestamp: string): boolean {
  const secret = process.env.ZOOM_WEBHOOK_SECRET;
  if (!secret) return false;
  const message = `v0:${timestamp}:${body}`;
  const hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
  return `v0=${hash}` === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-zm-signature") ?? "";
  const timestamp = req.headers.get("x-zm-request-timestamp") ?? "";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!verifyZoomWebhook(body, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Zoom URL validation challenge — only handled after signature is verified
  if (parsed.event === "endpoint.url_validation") {
    const payload = parsed.payload as { plainToken: string };
    const hash = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET ?? "")
      .update(payload.plainToken)
      .digest("hex");
    return NextResponse.json({ plainToken: payload.plainToken, encryptedToken: hash });
  }

  if (parsed.event === "recording.completed") {
    const payload = parsed.payload as {
      object: {
        uuid: string;
        topic: string;
        recording_files: Array<{ download_url: string; file_type: string; recording_type: string }>;
      };
    };

    console.log(`[Zoom Webhook] Recording completed: ${payload.object.topic}`);

    // Respond 200 immediately — Zoom requires fast acknowledgement before we do any async work
    void Promise.resolve().then(async () => {
      // Guard: skip upload if YouTube OAuth is not configured
      if (
        !process.env.YOUTUBE_OAUTH_CLIENT_ID ||
        !process.env.YOUTUBE_OAUTH_CLIENT_SECRET ||
        !process.env.YOUTUBE_REFRESH_TOKEN
      ) {
        console.warn("[Zoom Webhook] YouTube OAuth not configured — skipping upload");
        return;
      }

      try {
        const mp4File = payload.object.recording_files.find(
          f => f.file_type === "MP4" && f.recording_type === "shared_screen_with_speaker_view"
        ) ?? payload.object.recording_files.find(f => f.file_type === "MP4");

        if (!mp4File) {
          console.warn("[Zoom Webhook] No MP4 recording file found — skipping upload");
          return;
        }

        const zoomToken = await getZoomToken();
        if (!zoomToken) {
          console.error("[Zoom Webhook] Could not obtain Zoom token — skipping upload");
          return;
        }

        const result = await uploadRecordingToYouTube({
          downloadUrl: mp4File.download_url,
          title: payload.object.topic,
          description: `Recorded session: ${payload.object.topic} (ID: ${payload.object.uuid})`,
          zoomToken,
        });
        if (result) {
          console.log(`[Zoom Webhook] Uploaded to YouTube: ${result.youtubeVideoId}`);
        }
      } catch (err) {
        console.error("[Zoom Webhook] YouTube upload failed", { error: (err as Error).message });
      }
    });
  }

  return NextResponse.json({ received: true });
}
