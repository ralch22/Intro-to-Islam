import { NextResponse } from "next/server";
import { enrollUser } from "@/lib/moodle";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const result = await enrollUser(session.user.id ?? "mock_user", id);
  return NextResponse.json(result);
}
