from typing import Dict, Any, Set

class MarketDataDeduplicator:
    """
    Prevents storage of redundant ticks in short-window streams.
    """
    def __init__(self, cache_size: int = 1000):
        self.cache: Set[str] = set()
        self.history = []
        self.cache_size = cache_size

    def is_duplicate(self, tick: Dict[str, Any]) -> bool:
        if not tick:
            return True
        key = f"{tick.get('symbol')}:{tick.get('timestamp')}:{tick.get('price')}:{tick.get('volume')}"
        if key in self.cache:
            return True
        self.cache.add(key)
        self.history.append(key)
        if len(self.history) > self.cache_size:
            oldest = self.history.pop(0)
            self.cache.discard(oldest)
        return False
