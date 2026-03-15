import { NextResponse } from "next/server";
import { getCourses } from "@/lib/moodle";

// Public endpoint: course catalog is viewable without authentication
export async function GET() {
  const courses = await getCourses();
  return NextResponse.json(courses);
}
