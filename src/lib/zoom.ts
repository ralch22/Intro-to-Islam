const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

const MOCK_MEETINGS = [
  {
    id: "mock_meeting_1",
    topic: "Weekly Q&A with Sheikh Ahmed",
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    join_url: "https://zoom.us/j/mock",
    cohort: "Online",
    participants: 45,
  },
  {
    id: "mock_meeting_2",
    topic: "Foundation Course — Module 2 Review",
    start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    join_url: "https://zoom.us/j/mock2",
    cohort: "Sydney",
    participants: 28,
  },
  {
    id: "mock_meeting_3",
    topic: "Life of the Prophet — Week 3",
    start_time: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    join_url: "https://zoom.us/j/mock3",
    cohort: "Melbourne",
    participants: 32,
  },
];

async function getZoomToken(): Promise<string> {
  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    { method: "POST", headers: { Authorization: `Basic ${credentials}` } }
  );
  const data = await res.json();
  return data.access_token;
}

export async function getUpcomingMeetings() {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    return MOCK_MEETINGS;
  }
  try {
    const token = await getZoomToken();
    const res = await fetch(
      "https://api.zoom.us/v2/users/me/meetings?type=scheduled&page_size=30",
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } }
    );
    const data = await res.json();
    return data.meetings ?? MOCK_MEETINGS;
  } catch {
    return MOCK_MEETINGS;
  }
}

export async function getMeetingById(meetingId: string) {
  return MOCK_MEETINGS.find(m => m.id === meetingId) ?? MOCK_MEETINGS[0];
}

export type ZoomMeeting = typeof MOCK_MEETINGS[0];
