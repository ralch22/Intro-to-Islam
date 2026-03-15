import { NextResponse } from "next/server";
import { sendPushNotification, type PushSubscriptionData } from "@/lib/push";

export async function POST(req: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const headerSecret = req.headers.get("x-admin-secret");

  if (adminSecret && headerSecret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    subscription: PushSubscriptionData;
    notification: { title: string; body: string; url?: string };
  };

  const { subscription, notification } = body;

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  try {
    await sendPushNotification(subscription, notification);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Push Send] Error:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
