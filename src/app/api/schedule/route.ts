import { NextResponse } from "next/server";
import { getUpcomingMeetings } from "@/lib/zoom";

// Public endpoint: schedule is viewable without authentication
export async function GET() {
  const meetings = await getUpcomingMeetings();
  return NextResponse.json(meetings);
}
