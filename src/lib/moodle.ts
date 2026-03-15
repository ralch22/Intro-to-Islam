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

const MOCK_LESSONS = [
  { id: "1-1", courseId: "2", moduleId: "1", title: "Introduction to Islam", youtubeVideoId: "dQw4w9WgXcQ", order: 1, completed: true, notes: "Islam means submission to the will of God. It is a monotheistic faith that emphasizes the oneness of Allah." },
  { id: "1-2", courseId: "2", moduleId: "1", title: "The Five Pillars", youtubeVideoId: "dQw4w9WgXcQ", order: 2, completed: true, notes: "The Five Pillars of Islam are the core acts of worship: Shahada, Salah, Zakat, Sawm, and Hajj." },
  { id: "2-1", courseId: "2", moduleId: "2", title: "Understanding Tawheed", youtubeVideoId: "dQw4w9WgXcQ", order: 3, completed: false, notes: "Tawheed is the concept of monotheism in Islam — the belief in the oneness of Allah." },
  { id: "2-2", courseId: "2", moduleId: "2", title: "Angels and Belief", youtubeVideoId: "dQw4w9WgXcQ", order: 4, completed: false, notes: "Belief in angels is the second article of faith in Islam. Angels are created from light and serve Allah." },
  { id: "3-1", courseId: "2", moduleId: "3", title: "Salah — The Prayer", youtubeVideoId: "dQw4w9WgXcQ", order: 5, completed: false, notes: "Salah is the ritual prayer performed five times daily. It is the second pillar of Islam." },
];

const MOCK_MODULES = [
  { id: "1", courseId: "2", title: "Module 1: Introduction", order: 1, completed: true },
  { id: "2", courseId: "2", title: "Module 2: Core Beliefs", order: 2, completed: false },
  { id: "3", courseId: "2", title: "Module 3: Daily Practices", order: 3, completed: false },
];

export async function moodleRequest(wsfunction: string, params: Record<string, string> = {}) {
  if (!MOODLE_URL || !MOODLE_TOKEN) {
    return null; // caller handles null → use mock
  }
  const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
  url.searchParams.set("wstoken", MOODLE_TOKEN);
  url.searchParams.set("wsfunction", wsfunction);
  url.searchParams.set("moodlewsrestformat", "json");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  return res.json();
}

export async function getCourses() {
  const data = await moodleRequest("core_course_get_courses");
  return data ?? MOCK_COURSES;
}

export async function getCourseById(id: string) {
  const data = await moodleRequest("core_course_get_courses", { "options[ids][0]": id });
  return (data?.[0]) ?? MOCK_COURSES.find(c => String(c.id) === id) ?? MOCK_COURSES[0];
}

export async function getCourseLessons(courseId: string) {
  const data = await moodleRequest("core_course_get_contents", { courseid: courseId });
  return data ?? MOCK_LESSONS.filter(l => l.courseId === courseId);
}

export async function getLessonById(lessonId: string) {
  return MOCK_LESSONS.find(l => l.id === lessonId) ?? MOCK_LESSONS[0];
}

export async function getModulesByCourse(courseId: string) {
  return MOCK_MODULES.filter(m => m.courseId === courseId);
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

export async function linkVideoToLesson(courseId: string, sectionId: string, youtubeVideoId: string, title: string) {
  if (!MOODLE_URL || !MOODLE_TOKEN) {
    return { status: "mock_linked" };
  }
  return moodleRequest("core_course_add_content_item_to_user_favourites", {
    componentname: "mod_url",
    contentitemid: sectionId,
  });
}

export type MoodleCourse = typeof MOCK_COURSES[0];
export type MoodleLesson = typeof MOCK_LESSONS[0];
export type MoodleModule = typeof MOCK_MODULES[0];
