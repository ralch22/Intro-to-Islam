// src/lib/subscription-store.ts
// TODO(sprint-6): Migrate this file-based store to Redis or Postgres before Hetzner production deployment.
// The /tmp directory on Vercel is ephemeral (shared within a warm instance but lost on cold starts/deploys).
// For durable push subscriptions, use: ioredis SET with EXPIRE, or a Postgres table:
//   CREATE TABLE push_subscriptions (
//     user_id TEXT NOT NULL,
//     endpoint TEXT NOT NULL PRIMARY KEY,
//     keys JSONB NOT NULL,
//     preferences JSONB NOT NULL DEFAULT '{}',
//     created_at TIMESTAMPTZ DEFAULT NOW()
//   );

import fs from "fs";

const STORE_PATH = "/tmp/push-subscriptions.json";

export interface StoredSubscription {
  userId: string;
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  preferences: Record<string, boolean>;
  createdAt: string;
}

export function readSubscriptions(): StoredSubscription[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data) as StoredSubscription[];
  } catch {
    return [];
  }
}

export function writeSubscription(sub: StoredSubscription): void {
  const all = readSubscriptions();
  const idx = all.findIndex(
    (s) => s.subscription.endpoint === sub.subscription.endpoint
  );
  if (idx >= 0) {
    all[idx] = sub; // update existing
  } else {
    all.push(sub);
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(all, null, 2));
}

export function removeSubscription(endpoint: string): void {
  const all = readSubscriptions().filter(
    (s) => s.subscription.endpoint !== endpoint
  );
  fs.writeFileSync(STORE_PATH, JSON.stringify(all, null, 2));
}
