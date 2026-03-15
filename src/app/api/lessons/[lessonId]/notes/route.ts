import { NextResponse } from "next/server";
import { getLessonById } from "@/lib/moodle";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);
  return NextResponse.json({ notes: lesson?.notes ?? "No notes available for this lesson." });
}
