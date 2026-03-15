import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const allBookings = data.bookings ?? MOCK_BOOKINGS;
    // Filter to only return bookings where the session user is an attendee
    const userEmail = session.user.email;
    const userBookings = userEmail
      ? allBookings.filter((booking: { attendees?: { email: string }[] }) =>
          booking.attendees?.some((a) => a.email === userEmail)
        )
      : allBookings;
    return NextResponse.json(userBookings);
  } catch {
    return NextResponse.json(MOCK_BOOKINGS);
  }
}
