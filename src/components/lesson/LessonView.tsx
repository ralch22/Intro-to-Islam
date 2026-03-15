"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { YouTubePlayer } from "./YouTubePlayer";

type Lesson = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  youtubeVideoId: string;
  order: number;
  completed: boolean;
  notes: string;
};

interface LessonViewProps {
  lesson: Lesson;
  courseId: string;
  allLessons: Lesson[];
}

type DiscussionPost = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

export function LessonView({ lesson, courseId, allLessons }: LessonViewProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(lesson.completed);
  const [marking, setMarking] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "discussion" | "about">("notes");

  // Notes tab state
  const [notesText, setNotesText] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);

  // Discussion tab state
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  // Sort lessons by order to find prev/next
  const sorted = [...allLessons].sort((a, b) => a.order - b.order);
  const currentIndex = sorted.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextLesson = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  const goToPrev = useCallback(() => {
    if (prevLesson) {
      router.push(`/courses/${courseId}/lesson/${prevLesson.id}`);
    }
  }, [prevLesson, courseId, router]);

  const goToNext = useCallback(() => {
    if (nextLesson) {
      router.push(`/courses/${courseId}/lesson/${nextLesson.id}`);
    }
  }, [nextLesson, courseId, router]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  // Fetch notes when tab is active
  useEffect(() => {
    if (activeTab === "notes" && notesText === null) {
      setNotesLoading(true);
      fetch(`/api/lessons/${lesson.id}/notes`)
        .then((r) => r.json())
        .then((data: { notes: string }) => {
          setNotesText(data.notes ?? lesson.notes);
          setNotesLoading(false);
        })
        .catch(() => {
          setNotesText(lesson.notes);
          setNotesLoading(false);
        });
    }
  }, [activeTab, lesson.id, lesson.notes, notesText]);

  // Fetch discussion posts when tab is active
  useEffect(() => {
    if (activeTab === "discussion" && posts.length === 0) {
      setDiscussionLoading(true);
      fetch(`/api/lessons/${lesson.id}/discussion`)
        .then((r) => r.json())
        .then((data: DiscussionPost[]) => {
          setPosts(data);
          setDiscussionLoading(false);
        })
        .catch(() => setDiscussionLoading(false));
    }
  }, [activeTab, lesson.id, posts.length]);

  async function handleMarkComplete() {
    if (completed || marking) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, { method: "POST" });
      if (res.ok) {
        setCompleted(true);
      }
    } catch {
      // silently fail — mock env
      setCompleted(true);
    } finally {
      setMarking(false);
    }
  }

  async function handlePostDiscussion() {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost.trim() }),
      });
      const post = await res.json() as DiscussionPost;
      setPosts((prev) => [...prev, post]);
      setNewPost("");
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  }

  const progress = allLessons.length > 0
    ? Math.round((allLessons.filter((l) => l.completed).length / allLessons.length) * 100)
    : 0;

  const tabs = [
    { id: "notes" as const, label: "Instructor Notes" },
    { id: "discussion" as const, label: "Discussion" },
    { id: "about" as const, label: "About" },
  ];

  return (
    <main className="flex-grow flex flex-col bg-gradient-to-b from-gray-50 to-[#F3F4F6]">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Breadcrumb & Progress */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex text-sm text-gray-500 mb-2">
              <Link href={`/courses/${courseId}`} className="flex items-center hover:text-[#E81C74] transition-colors">
                ← Course Overview
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-400">Lesson {lesson.order}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{lesson.title}</h1>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Course Progress</span>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div className="bg-[#E81C74] h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-bold text-[#E81C74]">{progress}%</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: lesson content */}
          <div className="flex-1 space-y-6">

            {/* Video card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50">
                <YouTubePlayer
                  videoId={lesson.youtubeVideoId}
                  lessonId={lesson.id}
                />
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 px-6">
                <nav className="flex space-x-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-1 border-b-2 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab.id
                          ? "border-[#E81C74] text-[#E81C74]"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 md:p-8">
                {/* Notes Tab */}
                {activeTab === "notes" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{lesson.title}</h2>
                    {notesLoading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    ) : (
                      <p className="text-gray-600 leading-relaxed">{notesText ?? lesson.notes}</p>
                    )}
                  </div>
                )}

                {/* Discussion Tab */}
                {activeTab === "discussion" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Discussion</h2>

                    {discussionLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2].map((i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-24" />
                              <div className="h-3 bg-gray-200 rounded w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        {posts.map((post) => (
                          <div key={post.id} className="flex gap-3 items-start">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E81C74] to-[#1E40AF] flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {post.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">{post.author}</span>
                                <span className="text-xs text-gray-400">{formatRelative(post.timestamp)}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
                            </div>
                          </div>
                        ))}
                        {posts.length === 0 && (
                          <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first!</p>
                        )}
                      </div>
                    )}

                    {/* Post form */}
                    <div className="border-t border-gray-100 pt-4">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share a question or comment..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E81C74] resize-none"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handlePostDiscussion}
                          disabled={posting || !newPost.trim()}
                          className="bg-[#E81C74] hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-full text-sm transition-colors"
                        >
                          {posting ? "Posting..." : "Post"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Lesson</h2>
                    <p className="text-gray-600">
                      This is lesson {lesson.order} of the course. Use the arrow keys on your keyboard to navigate between lessons.
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-[#1E40AF] rounded-r-lg">
                      <p className="text-sm text-[#1E40AF]">
                        <strong>Tip:</strong> Use ← → arrow keys to navigate between lessons.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              {prevLesson ? (
                <button
                  onClick={goToPrev}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  ← Previous Lesson
                </button>
              ) : (
                <span className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-100 text-gray-300 font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                  ← Previous Lesson
                </span>
              )}

              <button
                onClick={handleMarkComplete}
                disabled={completed || marking}
                className={`w-full sm:w-auto px-8 py-3 rounded-full font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  completed
                    ? "bg-green-500 text-white cursor-default"
                    : marking
                    ? "bg-gray-300 text-gray-500 cursor-wait"
                    : "bg-[#E81C74] text-white hover:bg-pink-600"
                }`}
              >
                {completed ? "✓ Completed" : marking ? "Saving..." : "✓ Mark as Complete"}
              </button>

              {nextLesson ? (
                <button
                  onClick={goToNext}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Next Lesson →
                </button>
              ) : (
                <span className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-100 text-gray-400 font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                  Next Lesson →
                </span>
              )}
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="w-full lg:w-80 space-y-6">

            {/* Live class banner */}
            <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#1E40AF] border-y border-r border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50" />
              <div className="relative z-10">
                <span className="bg-[#1E40AF] text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Live Soon</span>
                <h4 className="font-bold text-gray-900 mt-3 mb-1">Weekly Q&amp;A Session</h4>
                <p className="text-sm text-gray-600 mb-4">Join the live session for this course</p>
                <Link href="/schedule" className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-medium py-2 rounded-lg transition-colors text-sm flex justify-center items-center gap-2">
                  📹 View Schedule
                </Link>
              </div>
            </div>

            {/* Module contents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">Course Lessons</h3>
                <span className="text-xs font-medium text-gray-500">
                  {allLessons.filter((l) => l.completed).length}/{allLessons.length} Completed
                </span>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {sorted.map((item) =>
                  item.id === lesson.id ? (
                    <div key={item.id} className="block p-4 bg-pink-50/50 border-l-2 border-[#E81C74]">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-[#E81C74] text-[#E81C74] flex items-center justify-center text-xs shrink-0">▶</div>
                        <span className="text-[#E81C74] font-semibold text-sm">{item.title}</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/courses/${courseId}/lesson/${item.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          item.completed
                            ? "bg-green-100 text-green-600"
                            : "border border-gray-300 text-gray-400"
                        }`}>
                          {item.completed ? "✓" : item.order}
                        </div>
                        <span className={`text-sm ${item.completed ? "text-gray-600" : "text-gray-500"}`}>
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
