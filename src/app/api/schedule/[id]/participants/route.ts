import { NextResponse } from "next/server";
import { getMeetingById } from "@/lib/zoom";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = await getMeetingById(id);
  // In production: call Zoom API for live participant count
  return NextResponse.json({ participants: meeting?.participants ?? 0 });
}
