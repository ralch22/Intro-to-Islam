import { getPlaylistItems, playlistItemsToLessons, COURSE_PLAYLISTS } from "@/lib/youtube";

const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

// Mock data for when Moodle is not yet provisioned
const MOCK_COURSES = [
  {
    id: 2,
    fullname: "Foundation Course",
    shortname: "FOUND",
    summary: "A comprehensive introduction to Islam covering core beliefs, practices, and history.",
    categoryid: 1,
    visible: 1,
    progress: 75,
    youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu",
  },
  {
    id: 3,
    fullname: "Life of the Prophet",
    shortname: "PROPHET",
    summary: "An in-depth study of the life of Prophet Muhammad (peace be upon him).",
    categoryid: 1,
    visible: 1,
    progress: 0,
    youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO",
  },
];

// Fallback lessons used only when neither Moodle NOR YouTube API key is available.
// Video IDs sourced from real playlist RSS feeds.
const MOCK_LESSONS = [
  { id: "2-pl-1", courseId: "2", moduleId: "1", title: "The Big Picture", youtubeVideoId: "D00SponKhI0", youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", order: 1, completed: true, notes: "Islam means submission to the will of God. It is a monotheistic faith that emphasises the oneness of Allah." },
  { id: "2-pl-2", courseId: "2", moduleId: "1", title: "What Is Islam", youtubeVideoId: "ion646ZPvjc", youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", order: 2, completed: true, notes: "The Five Pillars of Islam are the core acts of worship: Shahada, Salah, Zakat, Sawm, and Hajj." },
  { id: "2-pl-3", courseId: "2", moduleId: "1", title: "The 6 Articles of Iman", youtubeVideoId: "yf15KyOSEXo", youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", order: 3, completed: false, notes: "Tawheed is the concept of monotheism in Islam — the belief in the oneness of Allah." },
  { id: "2-pl-4", courseId: "2", moduleId: "1", title: "The 5 Pillars of Islam", youtubeVideoId: "4whjsJtEbCk", youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", order: 4, completed: false, notes: "Belief in angels is the second article of faith in Islam. Angels are created from light and serve Allah." },
  { id: "2-pl-5", courseId: "2", moduleId: "1", title: "Purification, Wudu, and Salat Overview", youtubeVideoId: "0htJ7efj93o", youtubePlaylistId: "PLVnGeZczzv1C_UXk3Ko4pb5uIh7usQjsu", order: 5, completed: false, notes: "Salah is the ritual prayer performed five times daily. It is the second pillar of Islam." },
  { id: "3-pl-1", courseId: "3", moduleId: "1", title: "Why Study Seerah?", youtubeVideoId: "B_L3vkYIqQU", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 1, completed: false, notes: "Understanding the life of the Prophet ﷺ is foundational to understanding Islam itself." },
  { id: "3-pl-2", courseId: "3", moduleId: "1", title: "Early Life", youtubeVideoId: "pBoNTW2ACS8", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 2, completed: false, notes: "The Prophet Muhammad ﷺ was born in Makkah around 570 CE." },
  { id: "3-pl-3", courseId: "3", moduleId: "1", title: "Marriage to Khadija", youtubeVideoId: "5JlJbv4xYLs", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 3, completed: false, notes: "Khadija RA was the first wife of the Prophet ﷺ and the first person to accept Islam." },
  { id: "3-pl-4", courseId: "3", moduleId: "1", title: "The Revelation", youtubeVideoId: "j614Ak4G0NU", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 4, completed: false, notes: "The first revelation came to the Prophet ﷺ in the Cave of Hira." },
  { id: "3-pl-5", courseId: "3", moduleId: "1", title: "Reactions of Quraysh", youtubeVideoId: "8gL7DowHBFc", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 5, completed: false, notes: "The leaders of Quraysh initially mocked and persecuted the early Muslims." },
  { id: "3-pl-6", courseId: "3", moduleId: "2", title: "Hamza and Omar Accept Islam", youtubeVideoId: "pzrbBhvDVDk", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 6, completed: false, notes: "The acceptance of Islam by Hamza and Umar RA strengthened the Muslim community greatly." },
  { id: "3-pl-7", courseId: "3", moduleId: "2", title: "The Night Journey", youtubeVideoId: "rTnB33OccGs", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 7, completed: false, notes: "Al-Isra wal-Miraj — the miraculous night journey and ascension of the Prophet ﷺ." },
  { id: "3-pl-8", courseId: "3", moduleId: "2", title: "Hijra to Medina", youtubeVideoId: "Biejm-h3QJY", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 8, completed: false, notes: "The migration (Hijra) to Medina marks the beginning of the Islamic calendar." },
  { id: "3-pl-9", courseId: "3", moduleId: "2", title: "Establishing Medina", youtubeVideoId: "XpxRWu4u3Fc", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 9, completed: false, notes: "The Prophet ﷺ established the first Islamic state in Medina, uniting the Ansar and Muhajirun." },
  { id: "3-pl-10", courseId: "3", moduleId: "2", title: "Battle of Badr", youtubeVideoId: "2CMCxSFrDTQ", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 10, completed: false, notes: "The Battle of Badr was the first major battle of Islam, a decisive Muslim victory." },
  { id: "3-pl-11", courseId: "3", moduleId: "3", title: "Between Badr and Uhud", youtubeVideoId: "4rEF_sLZ7jw", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 11, completed: false, notes: "The period between the battles of Badr and Uhud saw significant developments for the Muslim community." },
  { id: "3-pl-12", courseId: "3", moduleId: "3", title: "The Battle of Uhud", youtubeVideoId: "Z8CP43sES3M", youtubePlaylistId: "PLVnGeZczzv1B549C1kmtFHOpK194F1CgO", order: 12, completed: false, notes: "The Battle of Uhud was a painful but important lesson for the Muslim community." },
];

const MOCK_MODULES = [
  { id: "1", courseId: "2", title: "Module 1: Foundations", order: 1, completed: true },
  { id: "1", courseId: "3", title: "Module 1: Makkah Period", order: 1, completed: false },
  { id: "2", courseId: "3", title: "Module 2: Medina Period", order: 2, completed: false },
  { id: "3", courseId: "3", title: "Module 3: Battles & Legacy", order: 3, completed: false },
];

async function moodleRequest(wsfunction: string, params: Record<string, unknown> = {}): Promise<unknown> {
  if (!MOODLE_URL || !MOODLE_TOKEN) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
    url.searchParams.set("wstoken", MOODLE_TOKEN);
    url.searchParams.set("wsfunction", wsfunction);
    url.searchParams.set("moodlewsrestformat", "json");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error("[Moodle] HTTP error", { wsfunction, status: res.status, statusText: res.statusText });
      return null;
    }

    const data = await res.json();

    // Moodle returns errors as { exception: string, message: string }
    if (data && typeof data === "object" && "exception" in data) {
      console.error("[Moodle] API error", { wsfunction, exception: (data as Record<string, unknown>).exception, message: (data as Record<string, unknown>).message });
      return null;
    }

    return data;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      console.error("[Moodle] Request timeout", { wsfunction });
    } else {
      console.error("[Moodle] Fetch error", { wsfunction, error: (err as Error).message });
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCourses() {
  const data = await moodleRequest("core_course_get_courses");
  return data ?? MOCK_COURSES;
}

export async function getCourseById(id: string) {
  const data = await moodleRequest("core_course_get_courses", { "options[ids][0]": id });
  return ((data as Array<unknown>)?.[0]) ?? MOCK_COURSES.find(c => String(c.id) === id) ?? MOCK_COURSES[0];
}

export async function getCourseLessons(courseId: string) {
  // 1. Try Moodle (live)
  const data = await moodleRequest("core_course_get_contents", { courseid: courseId });
  if (data) return data;

  // 2. Try YouTube Data API — builds real lesson list from playlist
  const playlistId = COURSE_PLAYLISTS[courseId];
  if (playlistId) {
    const items = await getPlaylistItems(playlistId);
    if (items.length > 0) return playlistItemsToLessons(courseId, items);
  }

  // 3. Static fallback — embeds the playlist (no individual video IDs)
  return MOCK_LESSONS.filter(l => l.courseId === courseId);
}

export async function getLessonById(lessonId: string) {
  // Check mock lessons first
  const mock = MOCK_LESSONS.find(l => l.id === lessonId);
  if (mock) return mock;
  // Try to derive course from lessonId prefix (e.g. "2-yt-3" → courseId "2")
  const courseId = lessonId.split("-")[0];
  const lessons = await getCourseLessons(courseId);
  return (lessons as typeof MOCK_LESSONS).find(l => l.id === lessonId) ?? MOCK_LESSONS[0];
}

export async function getModulesByCourse(courseId: string | number): Promise<MoodleModule[]> {
  const data = await moodleRequest("core_course_get_contents", { courseid: courseId });

  if (!data || !Array.isArray(data)) {
    // Fall back to mock when Moodle not configured or error
    return MOCK_MODULES.filter(m => String(m.courseId) === String(courseId));
  }

  // data is an array of sections; each section has a 'modules' array.
  // MoodleModule shape (inferred from MOCK_MODULES): id, courseId, title, order, completed
  const modules: MoodleModule[] = (data as Array<{ id: number; name: string; modules?: unknown[] }>)
    .map((section, idx) => ({
      id: String(section.id),
      courseId: String(courseId),
      title: section.name || `Module ${idx + 1}`,
      order: idx + 1,
      completed: false,
    }));

  return modules.length > 0 ? modules : MOCK_MODULES.filter(m => String(m.courseId) === String(courseId));
}

export async function getCourseProgress(userId: string, courseId: string) {
  const data = await moodleRequest("core_completion_get_course_completion_status", { courseid: courseId, userid: userId });
  const course = MOCK_COURSES.find(c => String(c.id) === courseId);
  return data ?? { completionpercentage: course?.progress ?? 0 };
}

export async function markLessonComplete(userId: string, cmid: string) {
  if (!MOODLE_URL || !MOODLE_TOKEN) {
    return { status: "mock_success" };
  }
  return moodleRequest("core_completion_update_activity_completion_status_manually", {
    cmid,
    completed: "1",
  });
}

export async function enrollUser(userId: string, courseId: string) {
  if (!MOODLE_URL || !MOODLE_TOKEN) {
    return { status: "mock_enrolled" };
  }
  return moodleRequest("core_enrol_enrol_users", {
    "enrolments[0][roleid]": "5",
    "enrolments[0][userid]": userId,
    "enrolments[0][courseid]": courseId,
  });
}

export async function linkVideoToLesson(
  courseId: string | number,
  sectionId: string | number,
  youtubeUrl: string,
  title: string
): Promise<{ status: string }> {
  // NOTE: Creating a URL resource in Moodle via REST API requires the following:
  // 1. A Moodle web service token with 'mod/url:addinstance' capability
  // 2. The section number (not section ID) for the target section
  // Moodle does not expose a direct 'create URL module' REST function in standard web services.
  // The recommended approach is either:
  //   a) Use Moodle's course module creation via its internal API (requires custom web service plugin)
  //   b) Use Moodle's assignment/page/url module endpoints if available in your Moodle version
  // TODO(sprint-6): Implement via Moodle admin REST endpoint or custom web service plugin

  if (!MOODLE_URL || !MOODLE_TOKEN) {
    return { status: "mock_linked" };
  }

  // Best-effort: log the video link for manual admin action until custom WS plugin is available
  console.log("[Moodle] linkVideoToLesson — manual action required", {
    courseId,
    sectionId,
    youtubeUrl,
    title,
    note: "Automatic URL module creation requires custom Moodle web service plugin. Link this video manually in Moodle admin.",
  });

  return { status: "logged_for_manual_action" };
}

export type MoodleCourse = typeof MOCK_COURSES[0];
export type MoodleLesson = typeof MOCK_LESSONS[0];
export type MoodleModule = typeof MOCK_MODULES[0];
