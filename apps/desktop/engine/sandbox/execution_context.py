from typing import List, Dict, Any

class SandboxedExecutionContext:
    """
    Exposes high-level drawing primitives, telemetry registries, and data access
    APIs to the dynamic user indicator scripts.
    """
    def __init__(self, df_candles):
        self.candles = df_candles
        self.drawings = {
            "lines": [],
            "rectangles": [],
            "polygons": [],
            "texts": []
        }

    def get_series(self, col: str) -> List[float]:
        """Returns Open, High, Low, Close, or Volume series."""
        if col in self.candles.columns:
            return self.candles[col].tolist()
        return []

    def get_timestamps(self) -> List[int]:
        """Returns sequence timestamps."""
        if "timestamp" in self.candles.columns:
            return self.candles["timestamp"].astype(int).tolist()
        return []

    def draw_line(self, x1: float, y1: float, x2: float, y2: float, color: tuple = (255, 255, 255, 255), width: float = 1.0):
        self.drawings["lines"].append({
            "start": {"x": float(x1), "y": float(y1)},
            "end": {"x": float(x2), "y": float(y2)},
            "color": {"r": int(color[0]), "g": int(color[1]), "b": int(color[2]), "a": int(color[3])},
            "width": float(width)
        })

    def draw_rect(self, x1: float, y1: float, x2: float, y2: float, color: tuple = (255, 0, 0, 100), fill: bool = True):
        self.drawings["rectangles"].append({
            "x1": float(x1),
            "y1": float(y1),
            "x2": float(x2),
            "y2": float(y2),
            "color": {"r": int(color[0]), "g": int(color[1]), "b": int(color[2]), "a": int(color[3])},
            "fill": bool(fill)
        })

    def draw_polygon(self, points: List[Dict[str, float]], color: tuple = (0, 255, 0, 100), fill: bool = True):
        self.drawings["polygons"].append({
            "points": [{"x": float(p["x"]), "y": float(p["y"])} for p in points],
            "color": {"r": int(color[0]), "g": int(color[1]), "b": int(color[2]), "a": int(color[3])},
            "fill": bool(fill)
        })

    def draw_text(self, x: float, y: float, text: str, color: tuple = (255, 255, 255, 255), size: float = 12.0):
        self.drawings["texts"].append({
            "x": float(x),
            "y": float(y),
            "text": str(text),
            "color": {"r": int(color[0]), "g": int(color[1]), "b": int(color[2]), "a": int(color[3])},
            "size": float(size)
        })
