import { NextResponse } from "next/server";

const MOCK_POSTS = [
  { id: "1", author: "Omar K.", avatar: "O", content: "JazakAllah khair for this lesson! The explanation of Tawheed was very clear.", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: "2", author: "Amirah S.", avatar: "A", content: "Could you please explain the difference between Tawheed Al-Rububiyyah and Tawheed Al-Uluhiyyah?", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "3", author: "Sheikh Ahmed", avatar: "SA", content: "Great question Amirah! Tawheed Al-Rububiyyah refers to the oneness of Allah in His lordship and actions, while Al-Uluhiyyah refers to the oneness of Allah in worship. I'll cover this in more detail next class.", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId: _lessonId } = await params;
  return NextResponse.json(MOCK_POSTS);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId: _lessonId } = await params;
  const { content } = await req.json() as { content: string };
  const post = { id: String(Date.now()), author: "You", avatar: "Y", content, timestamp: new Date().toISOString() };
  return NextResponse.json(post);
}
