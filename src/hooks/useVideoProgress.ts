"use client";
import { useCallback } from "react";

export function useVideoProgress(videoId: string) {
  const saveProgress = useCallback((seconds: number) => {
    try {
      localStorage.setItem(`yt_progress_${videoId}`, String(Math.floor(seconds)));
    } catch {}
  }, [videoId]);

  const getSavedProgress = useCallback((): number => {
    try {
      return Number(localStorage.getItem(`yt_progress_${videoId}`)) || 0;
    } catch {
      return 0;
    }
  }, [videoId]);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(`yt_progress_${videoId}`);
    } catch {}
  }, [videoId]);

  return { saveProgress, getSavedProgress, clearProgress };
}
