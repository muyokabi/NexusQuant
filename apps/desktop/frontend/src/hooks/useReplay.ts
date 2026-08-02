import { useState, useEffect, useRef } from "react";
import { MarketBar } from "../utils/math";

export function useReplay(allBars: MarketBar[]) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step
  const [currentIndex, setCurrentIndex] = useState<number>(() => Math.floor(allBars.length * 0.7));
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= allBars.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, allBars.length]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stepForward = () => {
    setCurrentIndex(prev => Math.min(allBars.length - 1, prev + 1));
  };
  const resetTo = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(Math.max(0, Math.min(allBars.length - 1, index)));
  };

  const visibleBars = allBars.slice(0, currentIndex + 1);

  return {
    isPlaying,
    playbackSpeed,
    currentIndex,
    visibleBars,
    play,
    pause,
    stepForward,
    resetTo,
    setPlaybackSpeed
  };
}
