"use client";

import { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

const slides = [
  {
    icon: "📖",
    title: "Learn at Your Own Pace",
    description:
      "Watch structured video lessons from our Foundation Course and Life of the Prophet series, guided by qualified instructors.",
  },
  {
    icon: "📹",
    title: "Join Live Classes",
    description:
      "Attend weekly live Zoom sessions with instructors. Get reminders, join with one tap, and watch replays if you miss a class.",
  },
  {
    icon: "🤲",
    title: "Book Private Guidance",
    description:
      "Book a private one-to-one consultation with an instructor at a time that suits you. Completely free, completely private.",
  },
];

export default function OnboardingCarousel() {
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  if (!showOnboarding) return null;

  const goToNext = () => {
    if (animating) return;
    if (currentSlide < slides.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setAnimating(false);
      }, 150);
    } else {
      completeOnboarding();
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={completeOnboarding}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to IntroToIslam"
      >
        {/* Slide content */}
        <div
          className={`transition-opacity duration-150 ${animating ? "opacity-0" : "opacity-100"}`}
        >
          {/* Icon */}
          <div className="text-6xl text-center mb-6" aria-hidden="true">
            {slide.icon}
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {slide.title}
          </h2>
          <p className="text-gray-500 text-center text-base leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                i === currentSlide
                  ? "bg-[#E81C74] scale-110"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={completeOnboarding}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors py-2"
          >
            Skip
          </button>

          <button
            onClick={goToNext}
            className="bg-[#E81C74] hover:bg-pink-600 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-md text-sm"
          >
            {isLastSlide ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
