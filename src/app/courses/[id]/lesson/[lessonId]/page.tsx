import { getLessonById, getCourseLessons } from "@/lib/moodle";
import { LessonView } from "@/components/lesson/LessonView";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function ActiveLessonPage({ params }: PageProps) {
  const { id: courseId, lessonId } = await params;
  const [lesson, allLessons] = await Promise.all([
    getLessonById(lessonId),
    getCourseLessons(courseId),
  ]);

  return (
    <LessonView
      lesson={lesson}
      courseId={courseId}
      allLessons={Array.isArray(allLessons) ? allLessons : []}
    />
  );
}
