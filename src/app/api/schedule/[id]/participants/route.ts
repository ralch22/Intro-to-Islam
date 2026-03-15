import { NextResponse } from "next/server";
import { getMeetingById } from "@/lib/zoom";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const meeting = await getMeetingById(id);
  // In production: call Zoom API for live participant count
  return NextResponse.json({ participants: meeting?.participants ?? 0 });
}
