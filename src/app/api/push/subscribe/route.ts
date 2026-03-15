import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { VAPID_PUBLIC_KEY, type PushSubscriptionData } from "@/lib/push";
import {
  readSubscriptions,
  writeSubscription,
} from "@/lib/subscription-store";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "anonymous";

  const all = readSubscriptions();
  const mine = all.filter((s) => s.userId === userId);

  // Merge preferences from all stored endpoints for this user into a single object.
  // If a user has multiple browser subscriptions, last-write wins per key.
  const preferences: Record<string, boolean> = {};
  for (const s of mine) {
    Object.assign(preferences, s.preferences);
  }

  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY || null, preferences });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "anonymous";

  const body = (await req.json()) as {
    subscription: PushSubscriptionData;
    preferences: { classes: boolean; content: boolean; consultations: boolean };
  };

  const { subscription, preferences } = body;

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  writeSubscription({
    userId,
    subscription,
    preferences,
    createdAt: new Date().toISOString(),
  });

  console.log(
    `[Push] Subscription saved for userId=${userId} endpoint=${subscription.endpoint.slice(0, 60)}...`
  );

  return NextResponse.json({ success: true });
}
