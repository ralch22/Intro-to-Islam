import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/moodle";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const course = (await getCourseById(courseId)) as { fullname?: string };
  const title = course?.fullname ?? "Course";
  const date = new Date().toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E40AF"/>
      <stop offset="100%" style="stop-color:#6B21A8"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#bg)" rx="20"/>
  <rect x="20" y="20" width="760" height="360" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="16"/>
  <text x="400" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" fill="white">&#x1F393;</text>
  <text x="400" y="160" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="32" fill="white">Certificate of Completion</text>
  <text x="400" y="210" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" fill="rgba(255,255,255,0.85)">${title}</text>
  <rect x="200" y="235" width="400" height="2" fill="rgba(255,255,255,0.3)"/>
  <text x="400" y="285" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="rgba(255,255,255,0.7)">IntroToIslam.org</text>
  <text x="400" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.6)">${date}</text>
  <circle cx="100" cy="200" r="30" fill="#E81C74" opacity="0.8"/>
  <circle cx="700" cy="200" r="30" fill="#E81C74" opacity="0.8"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="iti-completion-${courseId}.svg"`,
    },
  });
}
