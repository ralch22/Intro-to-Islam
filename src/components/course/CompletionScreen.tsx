"use client";
import { useRouter } from "next/navigation";

interface CompletionScreenProps {
  courseTitle: string;
  courseId: string;
  onClose: () => void;
}

export function CompletionScreen({
  courseTitle,
  courseId,
  onClose,
}: CompletionScreenProps) {
  const router = useRouter();

  function handleDownload() {
    const url = `/api/completion/badge/${courseId}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `iti-completion-${courseId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleContinue() {
    onClose();
    router.push("/courses");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      {/* Confetti dots */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti-dot {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: confettiFall linear infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Confetti elements */}
      {[
        { left: "10%", color: "#E81C74", delay: "0s", dur: "3s", top: "0%" },
        { left: "20%", color: "#1E40AF", delay: "0.5s", dur: "2.5s", top: "5%" },
        { left: "35%", color: "#6B21A8", delay: "1s", dur: "3.5s", top: "0%" },
        { left: "55%", color: "#E81C74", delay: "0.3s", dur: "2.8s", top: "3%" },
        { left: "70%", color: "#1E40AF", delay: "0.8s", dur: "3.2s", top: "0%" },
        { left: "85%", color: "#6B21A8", delay: "0.2s", dur: "2.6s", top: "8%" },
        { left: "45%", color: "#E81C74", delay: "1.2s", dur: "3s", top: "2%" },
        { left: "60%", color: "#1E40AF", delay: "0.6s", dur: "3.8s", top: "0%" },
      ].map((dot, i) => (
        <div
          key={i}
          className="confetti-dot"
          style={{
            left: dot.left,
            top: dot.top,
            backgroundColor: dot.color,
            animationDelay: dot.delay,
            animationDuration: dot.dur,
          }}
        />
      ))}

      {/* Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center relative z-10">
        <div className="text-6xl mb-4">🎉</div>

        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "#E81C74" }}
        >
          Congratulations!
        </h1>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {courseTitle}
        </h2>

        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          You&apos;ve completed this course. May Allah bless you with knowledge
          that benefits you and others.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownload}
            className="flex-1 border-2 border-[#E81C74] text-[#E81C74] hover:bg-pink-50 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
          >
            Download Achievement
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-[#E81C74] hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm shadow-md"
          >
            Continue to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
