import { NextResponse } from "next/server";
import { getCourseById, getCourseLessons, getModulesByCourse } from "@/lib/moodle";

// Public endpoint: course details are viewable without authentication
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [course, lessons, modules] = await Promise.all([
    getCourseById(id),
    getCourseLessons(id),
    getModulesByCourse(id),
  ]);
  return NextResponse.json({ course, lessons, modules });
}
