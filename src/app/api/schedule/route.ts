import { NextResponse } from "next/server";
import { getUpcomingMeetings } from "@/lib/zoom";

export async function GET() {
  const meetings = await getUpcomingMeetings();
  return NextResponse.json(meetings);
}
