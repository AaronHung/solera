FROM ghcr.io/astral-sh/uv:0.9.26 AS uv
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/apps/solera-api:/app/connectors/easy-pi:/app/flows"

COPY --from=uv /uv /uvx /bin/

RUN groupadd --system solera \
    && useradd --system --gid solera --home-dir /app solera \
    && mkdir -p /app /data \
    && chown -R solera:solera /app /data

WORKDIR /app
COPY --chown=solera:solera pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY --chown=solera:solera apps/solera-api ./apps/solera-api
COPY --chown=solera:solera connectors/easy-pi ./connectors/easy-pi
COPY --chown=solera:solera flows ./flows

USER solera
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"]

CMD ["uvicorn", "solera_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
