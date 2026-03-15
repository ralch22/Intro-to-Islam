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

// Module-level token cache — Zoom S2S tokens are valid for 1 hour
let zoomTokenCache: { token: string; expiresAt: number } | null = null;

export async function getZoomToken(): Promise<string | null> {
  // Return cached token if still valid with a 60-second safety buffer
  if (zoomTokenCache && Date.now() < zoomTokenCache.expiresAt - 60_000) {
    return zoomTokenCache.token;
  }

  try {
    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
    const res = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      { method: "POST", headers: { Authorization: `Basic ${credentials}` } }
    );

    if (!res.ok) {
      console.error("[Zoom] Token fetch failed", { status: res.status });
      return null;
    }

    const data = await res.json() as { access_token?: string; expires_in?: number };

    if (!data.access_token) {
      console.error("[Zoom] No access_token in response");
      return null;
    }

    // Cache with expiry; expires_in is in seconds, default 3600 if absent
    zoomTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };

    return data.access_token;
  } catch (err) {
    console.error("[Zoom] Token fetch error", { error: (err as Error).message });
    return null;
  }
}

export async function getUpcomingMeetings() {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    return MOCK_MEETINGS;
  }
  try {
    const token = await getZoomToken();
    if (!token) {
      console.warn("[Zoom] No token available — falling back to mock meetings");
      return MOCK_MEETINGS;
    }
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
