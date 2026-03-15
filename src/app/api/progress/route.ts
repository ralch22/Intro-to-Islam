import { NextResponse } from "next/server";
import { getCourses, getCourseLessons } from "@/lib/moodle";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const courses = (await getCourses()) as Array<{
    id: number;
    fullname: string;
    progress?: number;
  }>;
  const results = await Promise.all(
    courses.map(async (course) => {
      const lessons = (await getCourseLessons(String(course.id))) as Array<{
        completed: boolean;
        title: string;
        id: string;
      }>;
      const total = lessons.length;
      const completed = lessons.filter((l) => l.completed).length;
      const pct =
        total > 0 ? Math.round((completed / total) * 100) : course.progress ?? 0;
      const lastActivity = lessons.find((l) => l.completed)?.title ?? null;
      return {
        courseId: course.id,
        title: course.fullname,
        total,
        completed,
        pct,
        lastActivity,
      };
    })
  );
  return NextResponse.json(results);
}
