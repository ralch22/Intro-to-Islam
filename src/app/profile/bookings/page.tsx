"use client";
import { useEffect, useState } from "react";

type Attendee = {
  name: string;
  email: string;
};

type Booking = {
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
  status: string;
  cancelUrl: string;
  rescheduleUrl: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

function toGoogleCalURL(booking: Booking) {
  const title = encodeURIComponent(booking.title);
  const start = new Date(booking.startTime)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const end = new Date(booking.endTime)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
}

function toICSDataURI(booking: Booking) {
  const dtstart = new Date(booking.startTime)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const dtend = new Date(booking.endTime)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IntroToIslam//BookingExport//EN",
    "BEGIN:VEVENT",
    `UID:${booking.uid}@introtoislam.org`,
    `DTSTAMP:${dtstart}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${booking.title}`,
    `DESCRIPTION:Booking via IntroToIslam\\nCancel: ${booking.cancelUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACCEPTED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cal/bookings")
      .then((r) => r.json())
      .then((data: Booking[]) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Header */}
      <header className="gradient-brand text-white py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3">
            <a href="/profile" className="text-blue-200 hover:text-white text-sm font-medium inline-flex items-center gap-1 transition-colors">
              ← Profile
            </a>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-blue-100">Your upcoming and past consultation sessions.</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-6">Schedule a consultation with one of our instructors.</p>
            <a
              href="/booking"
              className="inline-block bg-[#E81C74] hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md"
            >
              Book a Session
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.uid}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{booking.title}</h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.startTime)} &middot; {formatTime(booking.startTime)} &ndash; {formatTime(booking.endTime)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  {booking.status !== "CANCELLED" && (
                    <>
                      <a
                        href={booking.rescheduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#1E40AF] hover:text-blue-800 border border-[#1E40AF] px-4 py-2 rounded-full transition-colors"
                      >
                        Reschedule
                      </a>
                      <a
                        href={booking.cancelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 px-4 py-2 rounded-full transition-colors"
                      >
                        Cancel
                      </a>
                    </>
                  )}

                  {/* Google Calendar */}
                  <a
                    href={toGoogleCalURL(booking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-full transition-colors"
                  >
                    + Google Calendar
                  </a>

                  {/* .ics download */}
                  <a
                    href={toICSDataURI(booking)}
                    download={`booking-${booking.uid}.ics`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-full transition-colors"
                  >
                    Download .ics
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
