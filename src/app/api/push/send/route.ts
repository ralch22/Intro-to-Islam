import { NextResponse } from "next/server";
import { sendPushNotification, type PushSubscriptionData } from "@/lib/push";
import { readSubscriptions } from "@/lib/subscription-store";

export async function POST(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Push send endpoint not configured" },
      { status: 503 }
    );
  }
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    subscription?: PushSubscriptionData;
    notification: { title: string; body: string; url?: string };
  };

  const { subscription, notification } = body;

  // Single-target mode: a specific subscription was provided in the request body.
  if (subscription) {
    if (!subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    try {
      await sendPushNotification(subscription, notification);
      return NextResponse.json({ success: true, sent: 1 });
    } catch (err) {
      console.error("[Push Send] Error:", err);
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      );
    }
  }

  // Broadcast mode: no specific subscription provided — send to all stored subscribers.
  const allSubscriptions = readSubscriptions();
  if (allSubscriptions.length === 0) {
    return NextResponse.json({ success: true, sent: 0, errors: 0 });
  }

  let sent = 0;
  let errors = 0;

  for (const sub of allSubscriptions) {
    try {
      await sendPushNotification(sub.subscription, notification);
      sent++;
    } catch (err) {
      errors++;
      console.error(
        `[Push Send] Failed for endpoint ${sub.subscription.endpoint.slice(0, 60)}...:`,
        err
      );
    }
  }

  console.log(`[Push Send] Broadcast complete — sent=${sent} errors=${errors}`);
  return NextResponse.json({ success: true, sent, errors });
}
