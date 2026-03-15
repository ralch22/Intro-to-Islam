import { NextResponse } from "next/server";

const MOCK_BOOKINGS = [
  {
    uid: "mock-1",
    title: "1:1 Consultation with Sheikh Ahmed",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    attendees: [{ name: "You", email: "student@example.com" }],
    status: "ACCEPTED",
    cancelUrl: "https://cal.com/cancellations/mock-1",
    rescheduleUrl: "https://cal.com/reschedule/mock-1",
  },
];

export async function GET() {
  const CAL_API_KEY = process.env.CAL_API_KEY;

  if (!CAL_API_KEY) {
    return NextResponse.json(MOCK_BOOKINGS);
  }

  try {
    const res = await fetch(`https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(MOCK_BOOKINGS);
    }
    const data = await res.json();
    return NextResponse.json(data.bookings ?? MOCK_BOOKINGS);
  } catch {
    return NextResponse.json(MOCK_BOOKINGS);
  }
}
