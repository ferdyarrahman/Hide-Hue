"use client";

import { useState, useEffect, useCallback } from "react";
import { audio } from "@/lib/audio";

const MUTE_STORAGE_KEY = "hide-and-hue-muted";

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Reads localStorage, an external system unavailable during SSR — this
    // must stay in an effect rather than a lazy useState initializer, since
    // Next.js still renders "use client" components once on the server.
    const stored = localStorage.getItem(MUTE_STORAGE_KEY);
    if (stored !== null) {
      const muted = stored === "true";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMuted(muted);
      audio.setMuted(muted);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audio.setMuted(newMuted);
    localStorage.setItem(MUTE_STORAGE_KEY, String(newMuted));
  }, [isMuted]);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    audio.setMuted(muted);
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  }, []);

  return {
    isMuted,
    toggleMute,
    setMuted,
    audio,
  };
}
