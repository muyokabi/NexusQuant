import { useState, useMemo } from "react";
import { MarketBar } from "../utils/math";

export interface ViewportRange {
  minPrice: number;
  maxPrice: number;
  startIndex: number;
  endIndex: number;
}

export function useChartEngine(bars: MarketBar[], zoomLevel: number = 100) {
  const [dragOffset, setDragOffset] = useState(0);

  const range = useMemo<ViewportRange>(() => {
    if (bars.length === 0) {
      return { minPrice: 0, maxPrice: 100, startIndex: 0, endIndex: 0 };
    }

    const visibleCount = Math.max(10, Math.min(bars.length, Math.floor((zoomLevel / 100) * 40)));
    const offset = Math.max(0, Math.min(bars.length - visibleCount, Math.floor(dragOffset)));

    const startIndex = bars.length - visibleCount - offset;
    const endIndex = bars.length - 1 - offset;

    const visibleBars = bars.slice(startIndex, endIndex + 1);

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleBars.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
    });

    // Add some margins top & bottom
    const pad = (maxPrice - minPrice) * 0.1 || 10;
    return {
      minPrice: Math.max(0, minPrice - pad),
      maxPrice: maxPrice + pad,
      startIndex,
      endIndex
    };
  }, [bars, zoomLevel, dragOffset]);

  const getX = (index: number, width: number) => {
    const totalVisible = range.endIndex - range.startIndex + 1;
    const barWidth = width / totalVisible;
    const relativeIndex = index - range.startIndex;
    return relativeIndex * barWidth + barWidth / 2;
  };

  const getY = (price: number, height: number) => {
    const priceRange = range.maxPrice - range.minPrice || 1;
    return height - ((price - range.minPrice) / priceRange) * height;
  };

  const getPrice = (y: number, height: number) => {
    const priceRange = range.maxPrice - range.minPrice || 1;
    return range.minPrice + ((height - y) / height) * priceRange;
  };

  return {
    range,
    dragOffset,
    setDragOffset,
    getX,
    getY,
    getPrice
  };
}
