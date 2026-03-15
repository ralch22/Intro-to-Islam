import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCourses, getCourseLessons } from "@/lib/moodle";

export async function GET() {
  const session = await auth();
  const courses = (await getCourses()) as Array<{
    id: number;
    fullname: string;
    progress?: number;
  }>;
  const lessonsData = await Promise.all(
    courses.map((c) => getCourseLessons(String(c.id)))
  );
  const allLessons = lessonsData.flat() as Array<{ completed: boolean }>;
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) => l.completed).length;

  return NextResponse.json({
    name: session?.user?.name ?? "Guest Student",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? null,
    enrolledCourses: courses.length,
    completedLessons,
    totalLessons,
    joinDate: "March 2026",
    city: "Sydney",
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  // In production: update Moodle + WordPress profile
  return NextResponse.json({ success: true, updated: body });
}
