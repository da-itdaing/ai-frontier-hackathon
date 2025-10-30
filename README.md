## Run (Docker only)

Run everything in Docker. No local Node or Python installs are modified.

Start services:

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend:  http://localhost:8000 (health: `/health`, matches: `/matches`)

### Frontend in Docker (no backend in this container)

Vite inlines env at build time. If your backend runs elsewhere, set `VITE_API_BASE` at build time.

Build image (replace API base as needed):

```bash
docker build \
	--build-arg VITE_API_BASE=http://localhost:8000 \
	-t hackathon-frontend:latest .
```

Run container:

```bash
docker run --rm -p 3000:80 hackathon-frontend:latest
```

Open http://localhost:3000

## Full stack (Frontend + FastAPI backend)

We added a FastAPI server that computes LLM-based card matching and suggests categories. It uses LangChain with OpenAI optionally (falls back to heuristic if no key).

Start everything with Docker Compose:

```bash
docker compose up --build
```

The frontend calls the backend at `http://localhost:8000` (provided via build arg and also inferred at runtime), so no local environment setup is required.

### Environment variables
- Frontend build arg: `VITE_API_BASE` (Compose passes `http://localhost:8000`)
- Backend: `OPENAI_API_KEY`, `OPENAI_MODEL` (default `gpt-4o-mini`), `CORS_ORIGINS`

## Notes
- Card type now supports optional `llmCategory` to store suggested categories.
- Card type now supports optional `llmTags` to store suggested tags.
- On submit (RequestHelp/ProvideSolution), the app calls `/enrich` to normalize category/tags automatically; users can still edit fields.
- If the backend is unreachable, the app falls back to local matching by tag overlap and skips enrichment.

## Troubleshooting

- API not reachable banner: Ensure the backend container is healthy at `http://localhost:8000/health`.
- Different API port: Adjust `docker-compose.yml` `VITE_API_BASE` build arg and the backend port mapping accordingly.