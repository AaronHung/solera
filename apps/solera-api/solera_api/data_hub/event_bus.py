from __future__ import annotations

import asyncio
from collections import defaultdict
from collections.abc import AsyncIterator
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol


@dataclass(frozen=True)
class IndustrialEvent:
    event_id: str
    tenant_id: str
    topic: str
    occurred_at: datetime
    payload: dict[str, Any]
    synthetic: bool


class EventBus(Protocol):
    async def publish(self, event: IndustrialEvent) -> None: ...

    def subscribe(self, topic: str) -> AsyncIterator[IndustrialEvent]: ...


class InProcessEventBus:
    """Bounded local EventBus seam for the modular-monolith core demo."""

    def __init__(self, *, subscriber_queue_size: int = 256) -> None:
        if subscriber_queue_size < 1:
            raise ValueError("subscriber queue size must be positive")
        self.subscriber_queue_size = subscriber_queue_size
        self._subscribers: dict[str, set[asyncio.Queue[IndustrialEvent]]] = defaultdict(
            set
        )

    async def publish(self, event: IndustrialEvent) -> None:
        queues = tuple(self._subscribers.get(event.topic, ()))
        for queue in queues:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull as error:
                raise RuntimeError(
                    f"in-process EventBus subscriber is behind on {event.topic}"
                ) from error

    async def _subscription(self, topic: str) -> AsyncIterator[IndustrialEvent]:
        queue: asyncio.Queue[IndustrialEvent] = asyncio.Queue(
            maxsize=self.subscriber_queue_size
        )
        self._subscribers[topic].add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self._subscribers[topic].discard(queue)
            if not self._subscribers[topic]:
                self._subscribers.pop(topic, None)

    def subscribe(self, topic: str) -> AsyncIterator[IndustrialEvent]:
        if not topic:
            raise ValueError("EventBus topic is required")
        return self._subscription(topic)
