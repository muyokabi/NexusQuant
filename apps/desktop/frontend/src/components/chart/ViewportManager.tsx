import { useState } from "react";

export interface ViewportState {
  zoomLevel: number;
  timeframe: string;
  autoScroll: boolean;
}

export function useViewportManager(initialTimeframe: string = "1D") {
  const [viewport, setViewport] = useState<ViewportState>({
    zoomLevel: 100,
    timeframe: initialTimeframe,
    autoScroll: true
  });

  const zoomIn = () => {
    setViewport(prev => ({
      ...prev,
      zoomLevel: Math.min(200, prev.zoomLevel + 10)
    }));
  };

  const zoomOut = () => {
    setViewport(prev => ({
      ...prev,
      zoomLevel: Math.max(30, prev.zoomLevel - 10)
    }));
  };

  const setTimeframe = (tf: string) => {
    setViewport(prev => ({
      ...prev,
      timeframe: tf
    }));
  };

  const toggleAutoScroll = () => {
    setViewport(prev => ({
      ...prev,
      autoScroll: !prev.autoScroll
    }));
  };

  return {
    viewport,
    zoomIn,
    zoomOut,
    setTimeframe,
    toggleAutoScroll
  };
}
