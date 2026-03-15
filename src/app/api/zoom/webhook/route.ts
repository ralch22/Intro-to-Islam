import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyZoomWebhook(body: string, signature: string, timestamp: string): boolean {
  const secret = process.env.ZOOM_WEBHOOK_SECRET;
  if (!secret) return true; // skip validation in dev
  const message = `v0:${timestamp}:${body}`;
  const hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
  return `v0=${hash}` === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-zm-signature") ?? "";
  const timestamp = req.headers.get("x-zm-request-timestamp") ?? "";

  // Zoom URL validation challenge
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (parsed.event === "endpoint.url_validation") {
    const payload = parsed.payload as { plainToken: string };
    const hash = crypto
      .createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET ?? "")
      .update(payload.plainToken)
      .digest("hex");
    return NextResponse.json({ plainToken: payload.plainToken, encryptedToken: hash });
  }

  if (!verifyZoomWebhook(body, signature, timestamp)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (parsed.event === "recording.completed") {
    const payload = parsed.payload as {
      object: {
        uuid: string;
        topic: string;
        recording_files: Array<{ download_url: string; file_type: string; recording_type: string }>;
      };
    };
    // Fire-and-forget upload (would call youtube-upload lib in production)
    console.log(`[Zoom Webhook] Recording completed: ${payload.object.topic}`);
    // TODO: call uploadRecordingToYouTube(payload.object) when YouTube OAuth is configured
  }

  return NextResponse.json({ received: true });
}
