"use client";
import { useEffect, useRef, useState } from "react";
import { useVideoProgress } from "@/hooks/useVideoProgress";

// Minimal YouTube IFrame API typings (no external @types/youtube needed)
interface YTPlayerVars {
  rel?: number;
  modestbranding?: number;
  start?: number;
  enablejsapi?: number;
  origin?: string;
}

interface YTPlayer {
  getCurrentTime?: () => number;
  destroy: () => void;
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: () => void;
  };
}

interface YTNamespace {
  Player: new (el: HTMLElement, opts: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT: YTNamespace;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  lessonId: string;
  /** Fallback: embed the full playlist when no individual videoId is available */
  playlistId?: string;
  onProgress?: (seconds: number) => void;
}

/**
 * Playlist-only embed — simple iframe, no IFrame API needed.
 * Used when individual video IDs are not yet available (e.g. no YouTube API key).
 */
function PlaylistEmbed({ playlistId }: { playlistId: string }) {
  const src = `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`;
  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full rounded-xl bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Course Playlist"
      />
    </div>
  );
}

export function YouTubePlayer({ videoId, lessonId, playlistId, onProgress }: YouTubePlayerProps) {
  // If no individual videoId, fall back to playlist embed
  if (!videoId && playlistId) {
    return <PlaylistEmbed playlistId={playlistId} />;
  }

  return <YouTubeAPIPlayer videoId={videoId} lessonId={lessonId} onProgress={onProgress} />;
}

function YouTubeAPIPlayer({ videoId, lessonId, onProgress }: Omit<YouTubePlayerProps, "playlistId">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);
  const { getSavedProgress, saveProgress } = useVideoProgress(videoId);

  useEffect(() => {
    let mounted = true;

    function initPlayer() {
      if (!mounted || !containerRef.current) return;
      const startSeconds = getSavedProgress();
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          start: startSeconds,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: () => {
            if (mounted) setReady(true);
            intervalRef.current = setInterval(() => {
              if (playerRef.current) {
                const t = playerRef.current.getCurrentTime?.() ?? 0;
                if (t > 0) {
                  saveProgress(t);
                  onProgress?.(t);
                }
              }
            }, 5000);
          },
        },
      });
    }

    if (typeof window !== "undefined") {
      if (window.YT?.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
        if (!document.getElementById("yt-api-script")) {
          const script = document.createElement("script");
          script.id = "yt-api-script";
          script.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(script);
        }
      }
    }

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      try { playerRef.current?.destroy(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, lessonId]);

  return (
    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full rounded-xl bg-black"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-white text-sm">Loading video...</div>
        </div>
      )}
    </div>
  );
}
