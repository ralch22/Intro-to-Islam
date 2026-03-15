import { NextResponse } from "next/server";

const MOCK_ACTIVITY = [
  { id: "1", type: "lesson_complete", description: "Completed: The Five Pillars", courseId: "2", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "2", type: "lesson_complete", description: "Completed: Introduction to Islam", courseId: "2", timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
  { id: "3", type: "class_attended", description: "Attended: Weekly Q&A with Sheikh Ahmed", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "4", type: "lesson_complete", description: "Completed: Understanding Tawheed", courseId: "2", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "5", type: "enrolled", description: "Enrolled in: Foundation Course", courseId: "2", timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

export async function GET() {
  // Filter out events older than 90 days
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recent = MOCK_ACTIVITY.filter(a => new Date(a.timestamp) > cutoff).slice(0, 5);
  return NextResponse.json(recent);
}
