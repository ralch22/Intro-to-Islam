import { NextResponse } from "next/server";
import { VAPID_PUBLIC_KEY, type PushSubscriptionData } from "@/lib/push";

// In-memory store (in production: persist to database)
const subscriptions = new Map<string, { subscription: PushSubscriptionData; preferences: Record<string, boolean> }>();

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY || null });
}

export async function POST(req: Request) {
  const body = await req.json() as {
    subscription: PushSubscriptionData;
    preferences: { classes: boolean; content: boolean; consultations: boolean };
  };

  const { subscription, preferences } = body;

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  subscriptions.set(subscription.endpoint, { subscription, preferences });

  console.log(`[Push] Subscription saved for endpoint: ${subscription.endpoint.slice(0, 60)}...`);

  return NextResponse.json({ success: true });
}
