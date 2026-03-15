import { NextResponse } from "next/server";
import { getLessonById } from "@/lib/moodle";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const lesson = await getLessonById(lessonId);
  return NextResponse.json({ notes: lesson?.notes ?? "No notes available for this lesson." });
}
