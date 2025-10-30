# LLM Enrich API and Test Harness

This backend exposes a FastAPI server providing matching endpoints and an `/enrich` endpoint to generate normalized metadata (category, tags, skills, matching tags) from a title/description. A companion test script lets you run enrichment:

- Against the running server (`--mode server`)
- Locally using LangChain/OpenAI (`--mode local`)
- Compare both side-by-side (`--mode compare`)

## Install

```sh
# from repo root
pip install -r server/requirements.txt
```

## Run server

```sh
cd server
python3 -m uvicorn main:app --reload --port 8000
```

Port 8000 in use? Either kill the process or change the port:

```sh
lsof -i :8000
kill -9 <PID>
# or
python3 -m uvicorn main:app --reload --port 8001
```

## Environment variables

Create `server/.env` (already supported) with optional OpenAI configuration. Example:

```
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Note: `.gitignore` excludes `.env` and `server/.env`. Do not commit secrets.

## Test harness (server/test_enrich.py)

Run from repo root or inside `server/`.

- Server mode (calls the API):

```sh
cd server
python3 test_enrich.py --mode server --case '다잇다잉'
```

- Local mode (LangChain/OpenAI if API key present; otherwise heuristic fallback):

```sh
cd server
# with OpenAI key
export OPENAI_API_KEY=sk-...
python3 test_enrich.py --mode local --case '다잇다잉'
# without key (falls back to heuristic)
python3 test_enrich.py --mode local --all
```

- Compare results:

```sh
cd server
python3 test_enrich.py --mode compare --case '다잇다잉'
python3 test_enrich.py --mode compare --case '다잇다잉' --json  # machine-readable
```

- Customizations:

```sh
# Different server port
python3 test_enrich.py --mode server --base-url http://localhost:8001 --case '다잇다잉'
# Choose model or pass key explicitly
python3 test_enrich.py --mode local --model gpt-4o-mini --api-key sk-... --case '다잇다잉'
```

## Data sources

Vocabulary (categories, tags, skills) is loaded from `data/data.json` when present. If missing, the server and test harness synthesize a minimal vocabulary by reading `data/needs_cases.json` and `data/gives_cases.json` so enrichment remains consistent.

## Notes

- If your editor flags `langchain_openai` as unresolved, ensure dependencies are installed: `pip install -r server/requirements.txt`.
- The API returns the following shape for `/enrich`:

```json
{
  "suggestedCategory": "...",
  "tags": ["..."],
  "skills": ["..."],
  "matchingTags": ["..."],
  "confidence": 0.0
}
```
