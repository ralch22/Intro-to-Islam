import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const secret = process.env.CAL_WEBHOOK_SECRET;

  // Validate HMAC signature if secret is configured
  if (secret) {
    const signature = req.headers.get("x-cal-signature-256");
    if (signature) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      if (signature !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const triggerEvent = payload.triggerEvent as string | undefined;
  const bookingUid = (payload.payload as Record<string, unknown> | undefined)?.uid as string | undefined;

  console.log(`[Cal Webhook] Event: ${triggerEvent ?? "unknown"}, UID: ${bookingUid ?? "unknown"}`);

  switch (triggerEvent) {
    case "BOOKING_CREATED":
      // TODO: Trigger Mautic email sequence, create Zoom meeting override
      console.log("[Cal Webhook] Booking created:", bookingUid);
      break;
    case "BOOKING_CANCELLED":
      // TODO: Update Mautic contact, cancel Zoom meeting
      console.log("[Cal Webhook] Booking cancelled:", bookingUid);
      break;
    case "BOOKING_RESCHEDULED":
      // TODO: Update Zoom meeting time, notify via push
      console.log("[Cal Webhook] Booking rescheduled:", bookingUid);
      break;
    default:
      console.log("[Cal Webhook] Unhandled event:", triggerEvent);
  }

  return NextResponse.json({ received: true });
}
