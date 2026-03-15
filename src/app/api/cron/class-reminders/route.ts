import { NextResponse } from "next/server";
import { getUpcomingMeetings, type ZoomMeeting } from "@/lib/zoom";

export async function GET() {
  const now = Date.now();
  const windowStart = now + 55 * 60 * 1000; // 55 minutes from now
  const windowEnd = now + 65 * 60 * 1000;   // 65 minutes from now

  const meetings = await getUpcomingMeetings();

  const upcoming = meetings.filter((meeting: ZoomMeeting) => {
    const meetingTime = new Date(meeting.start_time).getTime();
    return meetingTime >= windowStart && meetingTime <= windowEnd;
  });

  // In production: look up subscribed students and push notifications
  // For now, log and return count
  for (const meeting of upcoming as ZoomMeeting[]) {
    console.log(`[Cron] Sending reminder for meeting: "${meeting.topic}" starting at ${meeting.start_time}`);
    // TODO: Fetch subscribed students from DB, send via sendPushNotification for each
  }

  return NextResponse.json({ checked: true, remindersQueued: upcoming.length });
}
