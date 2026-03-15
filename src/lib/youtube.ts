const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Canonical playlist IDs — hardcoded, never change
export const COURSE_PLAYLISTS: Record<string, string> = {
  "2": "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", // Foundation Course
  "3": "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", // Life of the Prophet
};

export type PlaylistItem = {
  videoId: string;
  title: string;
  description: string;
  position: number; // 0-indexed
  thumbnailUrl: string;
};

/**
 * Fetch all videos from a YouTube playlist via Data API v3.
 * Handles pagination — returns every item in the playlist.
 * Returns [] when YOUTUBE_API_KEY is not configured.
 */
export async function getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  if (!YOUTUBE_API_KEY) return [];

  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) break;
    const data = await res.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId: string | undefined = snippet.resourceId?.videoId;
      if (!videoId) continue;
      items.push({
        videoId,
        title: snippet.title ?? `Lesson ${snippet.position + 1}`,
        description: snippet.description ?? "",
        position: snippet.position ?? items.length,
        thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "",
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

/**
 * Convert a PlaylistItem array into the lesson shape used by moodle.ts.
 * courseId must be the string course ID (e.g. "2" or "3").
 */
export function playlistItemsToLessons(courseId: string, items: PlaylistItem[]) {
  const playlistId = COURSE_PLAYLISTS[courseId];
  return items.map((item) => ({
    id: `${courseId}-yt-${item.position}`,
    courseId,
    moduleId: String(Math.floor(item.position / 5) + 1), // group every 5 videos into a module
    title: item.title,
    youtubeVideoId: item.videoId,
    youtubePlaylistId: playlistId,
    order: item.position + 1,
    completed: false,
    notes: item.description || "Watch the video above and take your own notes.",
    thumbnailUrl: item.thumbnailUrl,
  }));
}
