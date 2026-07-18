from __future__ import annotations

import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    def __init__(self, requests_per_minute: int) -> None:
        self.limit = max(requests_per_minute, 1)
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> tuple[bool, int]:
        now = time.monotonic()
        window = self._requests[key]
        while window and now - window[0] >= 60:
            window.popleft()
        if len(window) >= self.limit:
            retry_after = max(1, round(60 - (now - window[0])))
            return False, retry_after
        window.append(now)
        return True, 0
