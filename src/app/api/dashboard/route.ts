import { NextResponse } from "next/server";
import { getCourses, getCourseProgress } from "@/lib/moodle";
import { getUpcomingMeetings } from "@/lib/zoom";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ?? "guest";

  const [courses, meetings] = await Promise.all([
    getCourses(),
    getUpcomingMeetings(),
  ]);

  // Get progress for each course
  const coursesWithProgress = await Promise.all(
    (courses as Array<{ id: number; fullname: string; progress?: number }>).map(async (course) => {
      const progress = await getCourseProgress(userId, String(course.id));
      const pct = (progress as Record<string, unknown> | null)?.completionpercentage;
      return { ...course, progress: typeof pct === "number" ? pct : (course.progress ?? 0) };
    })
  );

  const nextMeeting = (meetings as Array<{ start_time: string }>)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .find(m => new Date(m.start_time) > new Date());

  return NextResponse.json({ courses: coursesWithProgress, nextMeeting });
}
