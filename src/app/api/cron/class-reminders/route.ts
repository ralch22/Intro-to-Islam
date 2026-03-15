import { NextResponse } from "next/server";
import { getUpcomingMeetings, type ZoomMeeting } from "@/lib/zoom";
import { sendPushNotification } from "@/lib/push";
import { readSubscriptions } from "@/lib/subscription-store";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = now + 55 * 60 * 1000; // 55 minutes from now
  const windowEnd = now + 65 * 60 * 1000;   // 65 minutes from now

  const meetings = await getUpcomingMeetings();

  const upcoming = meetings.filter((meeting: ZoomMeeting) => {
    const meetingTime = new Date(meeting.start_time).getTime();
    return meetingTime >= windowStart && meetingTime <= windowEnd;
  });

  const subscriptions = readSubscriptions();

  let notificationsSent = 0;
  let errors = 0;

  for (const meeting of upcoming as ZoomMeeting[]) {
    console.log(
      `[Cron] Sending reminders for meeting: "${meeting.topic}" starting at ${meeting.start_time} — ${subscriptions.length} subscriber(s)`
    );

    for (const sub of subscriptions) {
      try {
        await sendPushNotification(sub.subscription, {
          title: "Class starting in 1 hour",
          body: `"${meeting.topic}" begins at ${new Date(meeting.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          url: "/schedule",
        });
        notificationsSent++;
      } catch (err) {
        errors++;
        console.error(
          `[Cron] Failed to notify endpoint ${sub.subscription.endpoint.slice(0, 60)}...:`,
          err
        );
      }
    }
  }

  console.log(
    `[Cron] class-reminders complete — meetingsChecked=${meetings.length} upcomingInWindow=${upcoming.length} notificationsSent=${notificationsSent} errors=${errors}`
  );

  return NextResponse.json({
    meetingsChecked: meetings.length,
    upcomingInWindow: upcoming.length,
    notificationsSent,
    errors,
  });
}
