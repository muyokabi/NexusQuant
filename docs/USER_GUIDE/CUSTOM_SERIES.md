# Custom Chart Series & Market Visualizations Guide

This document describes the high-performance visualization types built natively into the NexusQuant Pro charting engine. Our custom Canvas/WebGL stage renders massive tick streams under heavy trade throughput with ultra-low latency.

## Supported Series Types

### 1. Standard Candlesticks
- Traditional Open-High-Low-Close (OHLC) candles.
- Custom colors for bullish/bearish bodies, borders, and wicks.

### 2. Hollow Candlesticks
- Hollow bodies for bullish candles to increase visual scan-ability during high volatility.
- Filled bodies for bearish candles using low-contrast color offsets.

### 3. Volume Candlesticks
- Modulates candle width based on trade volume weight relative to the visible window max.
- Instantly highlights high-liquidity execution spikes on the price axis.

### 4. Heikin-Ashi
- Noise-filtering candles built on computed moving average values:
  - $Close = (Open + High + Low + Close) / 4$
  - $Open = (Prior\ HA\ Open + Prior\ HA\ Close) / 2$
  - $High = Max(High, HA\ Open, HA\ Close)$
  - $Low = Min(Low, HA\ Open, HA\ Close)$

### 5. Renko Bricks
- Time-independent price-based bricks.
- Formed only when price moves by a predefined brick size or ATR-based multiplier.

### 6. Kagi Trend Lines
- Time-noise filtering lines that reverse direction based on a specified trend reversal percentage.
- Line thickness/color shifts based on breaking previous structural highs or lows.

### 7. Point & Figure (P&F)
- Classical columns of Xs (rising price) and Os (falling price) to capture structural buy/sell zones.

### 8. Line Break
- Identifies major breakout series by comparing the current close against 1, 2, or 3 previous close bounds.

### 9. Classic Line
- Simple close-to-close continuous line render.

### 10. Line with Markers
- Classic line series decorated with micro-marker nodes at every close interval.

### 11. Step Line
- Staircase-style step line indicating support and resistance levels.

### 12. Standard Area
- Continuous close series underlaid with a semi-transparent linear gradient down to the time axis.

### 13. HLC Area
- Visualizes the range boundaries of High, Low, and Close prices with a purple glassmorphism overlay.

### 14. Baseline
- Delta visualization measuring distance and direction relative to a customizable horizontal baseline price.

### 15. Bar Chart (OHLC)
- Minimalist bar charts displaying open-close ticks on the left and right of wicks.

### 16. High-Low Bars
- Pure range bars displaying wicks without body fills to emphasize price range expansion.

### 17. Range Bars
- Candles formed purely when a specified constant price movement is reached.

### 18. Columns Chart
- Macro histogram representing volume or pricing series heights.

### 19. Volume Footprint
- Displays Bid vs Ask volume counts directly inside candle bodies to locate order flow imbalances.

### 20. Time Price Opportunity (TPO / Market Profile)
- Displays distribution profile structures using letters to represent price levels visited over specific time intervals.

### 21. Session Volume Profile (SVP)
- Overlay of session volume histograms directly on price candles to track the Point of Control (POC).
