# NexusRed – Minimal Reference Implementation

This repository contains a **very lightweight** skeleton of the NexusRed platform described in the design spec. It demonstrates:

- A Next.js + Tailwind front‑end with a Dashboard and simple pages.
- A FastAPI back‑end exposing health and simulation creation endpoints.
- Basic Docker‑Compose configuration to run both services together.

The code is intentionally minimal – it does **not** implement the full telemetry pipeline, AI planner, or HIBP integration. Those are left as extension points.

## Directory layout
```
├─ frontend/            # React/Next.js application
│   ├─ pages/          # Next.js page routes
│   ├─ styles/         # Tailwind globals
│   └─ ...
├─ backend/             # FastAPI service
│   ├─ main.py         # API implementation
│   └─ requirements.txt
└─ docker-compose.yml   # Development stack
```

## Getting started (local dev)
```bash
# 1. Clone this repo (already in your workspace)
cd nexusred

# 2. Start services with Docker Compose (requires Docker)
docker compose up --build
```

The front‑end will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

## Extending the platform
- **Telemetry** – add a Kafka/Pulsar consumer in `backend/` that writes to Elastic and then stores evidence objects.
- **AI Planner** – replace the `/simulations` POST handler with a call to an LLM service that generates a chain of ATT&CK techniques.
- **Exposure Intelligence** – implement a new FastAPI router that queries breach‑feed APIs and returns risk scores.
- **Authentication** – protect the API with OAuth2/JWT; add role‑based UI guards.

Feel free to iterate and replace the placeholder logic with real job orchestration (Kubernetes Jobs) and evidence correlation.
