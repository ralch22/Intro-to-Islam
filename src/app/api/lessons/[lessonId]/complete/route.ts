import { NextResponse } from "next/server";
import { markLessonComplete } from "@/lib/moodle";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { lessonId } = await params;
  const result = await markLessonComplete(session.user.id ?? "mock_user", lessonId);
  return NextResponse.json(result);
}
