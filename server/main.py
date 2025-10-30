from __future__ import annotations

import asyncio
import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Optional LLM
try:
    from langchain_openai import ChatOpenAI
except Exception:  # pragma: no cover
    ChatOpenAI = None  # type: ignore

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
FRONT_DATA = REPO_ROOT / "data" / "data.json"
STORE_PATH = ROOT / "data" / "matches.json"


class Settings(BaseSettings):
    # Accept unknown env keys (e.g., CORS_ORIGINS) without failing validation
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Keep a sane default list; we'll resolve env manually to avoid JSON decode issues in pydantic-settings
    default_cors_origins: List[str] = Field(default_factory=lambda: [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ])
    openai_api_key: Optional[str] = Field(default=None)
    openai_model: str = Field(default="gpt-4o-mini")

def resolve_cors_origins(defaults: List[str]) -> List[str]:
    """Resolve CORS origins from env with robust fallbacks.
    Supports JSON array (preferred) or comma-separated string.
    Env keys checked: CORS_ORIGINS (preferred), cors_origins.
    """
    val = os.getenv("CORS_ORIGINS") or os.getenv("cors_origins")
    if not val:
        return defaults
    try:
        data = json.loads(val)
        if isinstance(data, list):
            return [str(s) for s in data if str(s).strip()]
    except Exception:
        pass
    # CSV fallback
    return [s.strip() for s in val.split(",") if s.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


class CardData(BaseModel):
    id: str
    imageUrl: str
    category: str
    title: str
    description: str
    skills: List[str]
    duration: Optional[str] = None
    contact: Optional[str] = None
    tags: List[str]
    matchingTags: List[str]
    llmCategory: Optional[str] = None
    llmTags: Optional[List[str]] = None


class MatchResult(BaseModel):
    id: str
    score: float


class CategorySuggestion(BaseModel):
    id: str
    originalCategory: Optional[str] = None
    suggestedCategory: Optional[str] = None
    confidence: float = 0.0


class MatchRequest(BaseModel):
    needs: List[CardData]
    gives: List[CardData]
    top_k: int = 5


class MatchResponse(BaseModel):
    needMatches: Dict[str, List[MatchResult]]
    giveMatches: Dict[str, List[MatchResult]]
    categorySuggestions: List[CategorySuggestion]


class CategoriesResponse(BaseModel):
    needsCategories: List[str]
    givesCategories: List[str]

class EnrichInput(BaseModel):
    title: str = ""
    description: str = ""
    skills: List[str] = []
    tags: List[str] = []
    category: Optional[str] = None

class EnrichResponse(BaseModel):
    suggestedCategory: Optional[str] = None
    tags: List[str] = []
    skills: List[str] = []
    matchingTags: List[str] = []
    confidence: float = 0.0


app = FastAPI(title="LLM Matching API", version="0.1.0")


# CORS
settings = get_settings()
resolved_origins = resolve_cors_origins(settings.default_cors_origins)
cors_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# If wildcard requested or no explicit list, allow any origin via regex for robust preflight handling
if not resolved_origins or "*" in resolved_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        **cors_kwargs,
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_origins,
        **cors_kwargs,
    )


# -------- Utility helpers ---------

def jaccard(a: List[str], b: List[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / max(1, len(sa | sb))

def gather_tags(card: CardData) -> List[str]:
    # Combine all tag signals: matchingTags (heuristic), user tags, and llmTags
    out: List[str] = []
    seen = set()
    for arr in [card.matchingTags or [], card.tags or [], (card.llmTags or [])]:
        for t in arr:
            if t and t not in seen:
                seen.add(t)
                out.append(t)
    return out

def normalize_and_tokenize(text: str) -> List[str]:
    import re
    lowered = text.lower()
    lowered = re.sub(r"[^a-z0-9가-힣\s\-/]", "", lowered)
    lowered = re.sub(r"[#\s]+", " ", lowered).strip()
    if not lowered:
        return []
    parts = re.split(r"[\s/\-]+", lowered)
    return [p for p in parts if len(p) >= 3]


# ----- Corpus-aware normalization helpers -----

@lru_cache
def _load_front_json() -> dict:
    """Load aggregated front data. If data.json is missing, synthesize minimal
    structure from needs/gives cases so vocab-dependent logic still works.
    """
    try:
        with FRONT_DATA.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        # Fallback: try needs_cases.json / gives_cases.json for minimal structure
        data = {"needs": [], "gives": [], "categories": {"needsCategories": [], "givesCategories": []}}
        try:
            needs_path = REPO_ROOT / "data" / "needs_cases.json"
            if needs_path.exists():
                with needs_path.open("r", encoding="utf-8") as f:
                    needs = json.load(f)
                data["needs"] = needs if isinstance(needs, list) else []
                data["categories"]["needsCategories"] = list({
                    n.get("category", "") for n in (needs or []) if isinstance(n, dict) and n.get("category")
                })
            gives_path = REPO_ROOT / "data" / "gives_cases.json"
            if gives_path.exists():
                # gives have no tags/skills, keep empty but present
                data["gives"] = []
        except Exception:
            pass
        return data

@lru_cache
def get_category_pool() -> List[str]:
    data = _load_front_json()
    cats = data.get("categories", {})
    needs = cats.get("needsCategories", []) or []
    gives = cats.get("givesCategories", []) or []
    pool = list(dict.fromkeys([c for c in [*needs, *gives] if isinstance(c, str) and c.strip()]))
    return pool

def _is_all_category(name: str) -> bool:
    n = (name or "").strip().lower()
    return n in {"전체", "all"}

@lru_cache
def get_enrich_category_pool() -> List[str]:
    """Category pool for enrich: exclude the catch-all entry like '전체'.
    Never return empty; if filtering removes everything, fall back to original pool.
    """
    pool = get_category_pool()
    filtered = [c for c in pool if not _is_all_category(str(c))]
    return filtered or pool

@lru_cache
def get_tag_vocab() -> List[str]:
    data = _load_front_json()
    vocab = []
    for coll in [data.get("needs", []), data.get("gives", [])]:
        for item in coll or []:
            for t in (item.get("tags") or []):
                tt = str(t).strip().lower()
                if tt and tt not in vocab:
                    vocab.append(tt)
    return vocab

@lru_cache
def get_skill_vocab() -> List[str]:
    data = _load_front_json()
    vocab = []
    for coll in [data.get("needs", []), data.get("gives", [])]:
        for item in coll or []:
            for s in (item.get("skills") or []):
                ss = str(s).strip()
                if ss and ss.lower() not in {v.lower() for v in vocab}:
                    vocab.append(ss)
    return vocab

def _title_case(s: str) -> str:
    try:
        return " ".join([w.capitalize() for w in s.split()])
    except Exception:
        return s

def snap_one(value: Optional[str], choices: List[str], *, case_insensitive=True, cutoff=0.8) -> Optional[str]:
    if not value:
        return value
    try:
        from difflib import get_close_matches
        val = str(value).strip()
        if not val:
            return value
        pool = choices
        key = val.lower() if case_insensitive else val
        mapping = { (c.lower() if case_insensitive else c): c for c in pool }
        match = get_close_matches(key, list(mapping.keys()), n=1, cutoff=cutoff)
        if match:
            return mapping[match[0]]
        return value
    except Exception:
        return value

def snap_list(values: List[str], choices: List[str], *,
              lower=False, title_case=False, cutoff=0.8, max_items: int = 10) -> List[str]:
    seen = set()
    out: List[str] = []
    for v in values:
        if not v:
            continue
        vv = str(v).strip()
        if not vv:
            continue
        snapped = snap_one(vv, choices, cutoff=cutoff)
        res = snapped or vv
        if lower:
            res = res.lower()
        if title_case:
            res = _title_case(res)
        key = res.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(res)
        if len(out) >= max_items:
            break
    return out


def prefilter_pairs(needs: List[CardData], gives: List[CardData], k: int) -> Dict[str, List[Tuple[CardData, float]]]:
    """Use tag overlap to shortlist top-k gives for each need."""
    result: Dict[str, List[Tuple[CardData, float]]] = {}
    for n in needs:
        n_tags = gather_tags(n)
        scored = [(g, jaccard(n_tags, gather_tags(g))) for g in gives]
        scored.sort(key=lambda x: x[1], reverse=True)
        result[n.id] = scored[: max(1, k * 3)]  # broaden before LLM re-rank
    return result


async def llm_score_pair(llm, need: CardData, give: CardData) -> Tuple[float, Optional[str], float]:
    """Return (similarity_score[0..1], suggested_category, confidence[0..1])."""
    if llm is None:
        # heuristic fallback
        score = max(
            jaccard(gather_tags(need), gather_tags(give)),
            jaccard(need.tags, give.tags) * 0.8,
        )
        return (round(float(score), 4), None, 0.0)

    prompt = (
        "You are a matching assistant. Given a 'Need' and a 'Give' item, "
        "return a JSON with fields: score (0..1 float), suggested_category (string), confidence (0..1 float).\n"
        f"NEED: {need.title}\nDesc: {need.description}\nTags: {need.tags}\nSkills: {need.skills}\n"
        f"GIVE: {give.title}\nDesc: {give.description}\nTags: {give.tags}\nSkills: {give.skills}"
    )
    print(prompt)
    try:
        resp = await llm.ainvoke(prompt)
        content = resp.content if hasattr(resp, "content") else str(resp)
        # Extract JSON-like structure
        import re
        import ast

        m = re.search(r"\{[\s\S]*\}", content)
        data = ast.literal_eval(m.group(0)) if m else {}
        score = float(data.get("score", 0.0))
        cat = data.get("suggested_category")
        conf = float(data.get("confidence", 0.0))
        return (max(0.0, min(1.0, score)), cat, max(0.0, min(1.0, conf)))
    except Exception:
        score = jaccard(gather_tags(need), gather_tags(give))
        return (round(float(score), 4), None, 0.0)


async def compute_matches(req: MatchRequest) -> MatchResponse:
    # Initialize LLM if possible
    llm = None
    if settings.openai_api_key and ChatOpenAI is not None:
        llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.0)

    # Prefilter
    shortlist = prefilter_pairs(req.needs, req.gives, req.top_k)

    need_matches: Dict[str, List[MatchResult]] = {}
    give_matches: Dict[str, List[MatchResult]] = {g.id: [] for g in req.gives}

    # Score with LLM (or fallback)
    for n in req.needs:
        candidates = shortlist.get(n.id, [])
        tasks = [llm_score_pair(llm, n, g) for (g, _pref) in candidates]
        results = await asyncio.gather(*tasks)
        scored: List[Tuple[str, float]] = []
        for (g, _), (score, _cat, _conf) in zip(candidates, results):
            scored.append((g.id, score))
            give_matches[g.id].append(MatchResult(id=n.id, score=score))
        scored.sort(key=lambda x: x[1], reverse=True)
        need_matches[n.id] = [MatchResult(id=gid, score=float(s)) for gid, s in scored[: req.top_k]]

    # Category suggestions (simple: choose most common or LLM-suggested)
    suggestions: List[CategorySuggestion] = []
    # For performance, suggest based on tags & existing category for now
    from collections import Counter

    def suggest(item: CardData) -> CategorySuggestion:
        # naive: pick most frequent tag as category if not present
        tag_counts = Counter([t.lower() for t in item.tags])
        suggested = None
        conf = 0.0
        if tag_counts:
            suggested, count = tag_counts.most_common(1)[0]
            conf = min(1.0, count / max(1, len(item.tags)))
        return CategorySuggestion(
            id=item.id, originalCategory=item.category, suggestedCategory=suggested, confidence=conf
        )

    for n in req.needs:
        suggestions.append(suggest(n))
    for g in req.gives:
        suggestions.append(suggest(g))

    return MatchResponse(needMatches=need_matches, giveMatches=give_matches, categorySuggestions=suggestions)


# ------------ Routes --------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/llm/health")
async def llm_health(performCall: bool = False):
    """LLM readiness probe.
    - configured: OPENAI_API_KEY present and langchain_openai available
    - ready: if performCall=true, attempts a tiny completion to validate connectivity
    Note: The active model is reported but can be overridden via env OPENAI_MODEL.
    """
    configured = bool(settings.openai_api_key and ChatOpenAI is not None)
    status = {
        "configured": configured,
        "model": settings.openai_model,
        "ready": False,
        "error": None,
    }
    if not configured:
        return status
    if not performCall:
        # Don't spend tokens on default health checks
        status["ready"] = True
        return status
    try:
        llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.0)
        async def _ping():
            resp = await llm.ainvoke("Reply with a single word: ok")
            content = getattr(resp, "content", str(resp))
            return str(content).strip().lower().startswith("ok")
        ok = await asyncio.wait_for(_ping(), timeout=8)
        status["ready"] = bool(ok)
    except Exception as e:
        status["error"] = str(e)
    return status


@app.get("/categories", response_model=CategoriesResponse)
async def get_categories():
    if not FRONT_DATA.exists():
        raise HTTPException(status_code=404, detail="data.json not found")
    with FRONT_DATA.open("r", encoding="utf-8") as f:
        data = json.load(f)
    cats = data.get("categories", {})
    needs = cats.get("needsCategories", [])
    gives = cats.get("givesCategories", [])
    return CategoriesResponse(needsCategories=list(dict.fromkeys(needs)), givesCategories=list(dict.fromkeys(gives)))


@app.get("/matches", response_model=MatchResponse)
async def get_matches():
    if not STORE_PATH.exists():
        raise HTTPException(status_code=404, detail="No stored matches")
    with STORE_PATH.open("r", encoding="utf-8") as f:
        return MatchResponse(**json.load(f))


@app.post("/match", response_model=MatchResponse)
async def post_match(req: MatchRequest):
    res = await compute_matches(req)
    return res


@app.post("/save", response_model=MatchResponse)
async def save_matches(res: MatchResponse):
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with STORE_PATH.open("w", encoding="utf-8") as f:
        json.dump(json.loads(res.model_dump_json()), f, ensure_ascii=False, indent=2)
    return res


@app.post("/enrich", response_model=EnrichResponse)
async def enrich(input: EnrichInput) -> EnrichResponse:
    # Try LLM
    llm = None
    if settings.openai_api_key and ChatOpenAI is not None:
        llm = ChatOpenAI(model=settings.openai_model, api_key=settings.openai_api_key, temperature=0.0)
    if llm is not None:
        try:
            # For enrich, do not allow selecting the catch-all category (e.g., '전체')
            cat_pool = get_enrich_category_pool()
            tag_vocab = get_tag_vocab()[:120]
            skill_vocab = get_skill_vocab()[:120]
            prompt = (
                "You are an assistant that generates concise, normalized metadata for matching.\n"
                "Return STRICT JSON only, no commentary. Keys: \n"
                "- suggested_category: string\n"
                "- tags: array of 1..2 short lowercase tags (1-2 words each, hyphenated if needed, no punctuation, no duplicates)\n"
                "- skills: array of 1..2 concise skills or capabilities (1-3 words each, Title Case, no duplicates)\n"
                "- matching_tags: array of 3..10 lowercase tokens useful for matching (may include tags + key terms)\n"
                "- confidence: number 0..1\n"
                "Constraints:\n"
                "- suggested_category MUST be chosen from this list only: " + json.dumps(cat_pool, ensure_ascii=False) + "\n"
                "- Prefer using tags from this vocabulary when relevant: " + json.dumps(tag_vocab, ensure_ascii=False) + "\n"
                "- Prefer using skills from this vocabulary when relevant: " + json.dumps(skill_vocab, ensure_ascii=False) + "\n"
                f"TITLE: {input.title}\nDESC: {input.description}\nSKILLS: {input.skills}\nTAGS: {input.tags}\nCATEGORY: {input.category or ''}"
            )
            resp = await llm.ainvoke(prompt)
            content = resp.content if hasattr(resp, "content") else str(resp)
            import re, json as pyjson
            m = re.search(r"\{[\s\S]*\}", content)
            data = pyjson.loads(m.group(0)) if m else {}
            suggested = data.get("suggested_category")
            tags = data.get("tags") or []
            skills = data.get("skills") or []
            matching = data.get("matching_tags") or []
            conf = float(data.get("confidence", 0.0))
            if isinstance(tags, list):
                tags = [str(t).strip().lower() for t in tags if str(t).strip()]
            else:
                tags = []
            if isinstance(skills, list):
                skills = [str(s).strip() for s in skills if str(s).strip()]
            else:
                skills = []
            if isinstance(matching, list):
                matching = [str(s).strip().lower() for s in matching if str(s).strip()]
            else:
                matching = []
            # Snap to known vocabulary/pool
            suggested = snap_one(suggested, get_enrich_category_pool())
            tags = snap_list(tags, get_tag_vocab(), lower=True, cutoff=0.75, max_items=2)
            skills = snap_list(skills, get_skill_vocab(), title_case=True, cutoff=0.75, max_items=2)
            matching = snap_list((matching or tags), get_tag_vocab(), lower=True, cutoff=0.75, max_items=10)
            # Ensure we always return a category other than '전체'
            if not suggested and get_enrich_category_pool():
                suggested = get_enrich_category_pool()[0]
            return EnrichResponse(
                suggestedCategory=suggested,
                tags=tags[:2],
                skills=skills[:2],
                matchingTags=matching[:10],
                confidence=max(0.0, min(1.0, conf)),
            )
        except Exception:
            pass

    # Heuristic fallback: extract and rank tokens from title/desc/skills/tags (improved with Korean token simplify)
    tokens: List[str] = []
    for part in [input.title, input.description]:
        tokens += normalize_and_tokenize(part or "")
    for s in input.skills or []:
        tokens += normalize_and_tokenize(s)
    for t in input.tags or []:
        tokens += normalize_and_tokenize(t)

    # simple Korean/English stopwords (greetings, generic words)
    STOPWORDS = {
        "안녕하세요", "안녕", "저희", "저희는", "입니다", "있습니다", "있어요", "합니다",
        "하는", "있다", "및", "그리고", "등", "관련", "기반", "서비스", "있으며", "안내",
    }

    # naive Korean particle/ending trimming to improve token quality
    KO_SUFFIXES = [
        "으로", "로", "에서", "에게", "에게서", "까지", "부터", "보다", "처럼", "같이",
        "에게로", "에게서부터", "이라고", "라고", "이며", "이고", "거나", "라도",
        "만", "은", "는", "이", "가", "을", "를", "의", "와", "과", "도", "들",
        "께", "께서", "뿐", "밖에", "마다", "만큼", "인데", "인데요", "입니다",
        "합니다", "해요", "했어요", "하는", "하게", "하고", "하며",
        "해주는", "해주다", "해주며", "입니다만",
    ]

    def ko_simplify(tok: str) -> str:
        t = tok
        for suf in KO_SUFFIXES:
            if t.endswith(suf) and len(t) > len(suf) + 1:
                t = t[: -len(suf)]
                break
        return t

    # filter
    tokens = [ko_simplify(t) for t in tokens if t and t not in STOPWORDS]

    # rank by frequency with higher weight for title terms
    from collections import Counter
    title_tokens = [ko_simplify(t) for t in normalize_and_tokenize(input.title or "") if t not in STOPWORDS]
    desc_tokens = [ko_simplify(t) for t in normalize_and_tokenize(input.description or "") if t not in STOPWORDS]
    skill_tokens = []
    for s in input.skills or []:
        skill_tokens += [ko_simplify(t) for t in normalize_and_tokenize(s) if t not in STOPWORDS]
    tag_tokens = []
    for t in input.tags or []:
        tag_tokens += [ko_simplify(x) for x in normalize_and_tokenize(t) if x not in STOPWORDS]
    counts = Counter(tokens)
    weights: Dict[str, float] = {}
    for w, c in counts.items():
        wgt = c
        if w in title_tokens:
            wgt += 2.5
        if w in desc_tokens:
            wgt += 1.0
        if w in skill_tokens:
            wgt += 1.5
        if w in tag_tokens:
            wgt += 1.5
        weights[w] = float(wgt)
    uniq = [w for w, _ in sorted(weights.items(), key=lambda kv: kv[1], reverse=True)]

    # Suggest category by overlap with known categories, then keyword mapping fallback
    suggested = None
    confidence = 0.0
    try:
        cat_pool = get_enrich_category_pool()
        # score by substring overlap / token equality against filtered pool
        best_score = -1.0
        best_cat = None
        for c in cat_pool:
            c_norm = " ".join(normalize_and_tokenize(str(c)))
            if not c_norm:
                continue
            score = 0.0
            for tk in uniq:
                if tk in c_norm:
                    score += 1.0
            if score > best_score:
                best_score = score
                best_cat = c
        if best_cat and best_score > 0:
            suggested = best_cat
        else:
            token_set = set([t.lower() for t in uniq])
            keyword_map = [
                ({"유기견", "반려", "동물", "보호소"}, ["안전", "치안/범죄예방", "공공서비스"]),
                ({"cctv", "지오펜싱", "목격", "제보"}, ["치안/범죄예방", "안전"]),
            ]
            for keys, candidates in keyword_map:
                if token_set & {k.lower() for k in keys}:
                    for cand in candidates:
                        if cand in cat_pool:
                            suggested = cand
                            break
                if suggested:
                    break
    except Exception:
        pass

    # Build skills from top n-grams (1..3 words) based on title+desc (skip stopwords)
    def top_ngrams(words: List[str], max_items: int = 7) -> List[str]:
        out: List[str] = []
        seen = set()
        for n in (3, 2, 1):
            for i in range(len(words) - n + 1):
                chunk = words[i : i + n]
                if any(tok in STOPWORDS for tok in chunk):
                    continue
                if not any(len(tok) >= 3 for tok in chunk):
                    continue
                # skip phrases with duplicated tokens like "유기견 시스템 유기견"
                if len(set(chunk)) < len(chunk):
                    continue
                phrase = " ".join(chunk)
                key = phrase.lower()
                if key in seen:
                    continue
                seen.add(key)
                out.append(phrase)
                if len(out) >= max_items:
                    return out
        return out

    skill_phrases = top_ngrams(title_tokens + desc_tokens, max_items=10)
    # Title Case for skills
    def title_case(s: str) -> str:
        try:
            return " ".join([w.capitalize() for w in s.split()])
        except Exception:
            return s

    skills_raw = [title_case(p) for p in skill_phrases][:10]
    # matching and tags — prefer tokens of length >=3 and not stopwords
    matching_raw = [ko_simplify(w).lower() for w in uniq if len(w) >= 3 and w not in STOPWORDS][:15]
    tags_raw = [ko_simplify(w).lower() for w in uniq if len(w) >= 3 and w not in STOPWORDS][:10]
    # Snap to vocab
    suggested = snap_one(suggested, get_enrich_category_pool())
    tags = snap_list(tags_raw, get_tag_vocab(), lower=True, cutoff=0.75, max_items=2)
    skills = snap_list(skills_raw, get_skill_vocab(), title_case=True, cutoff=0.75, max_items=2)
    matching = snap_list(matching_raw, get_tag_vocab(), lower=True, cutoff=0.6, max_items=10)
    # Compose confidence from multiple signals so it's not 0 when category is None
    tag_score = min(1.0, len(tags) / 2.0)
    skill_score = min(1.0, len(skills) / 2.0)
    match_score = min(1.0, len(matching) / 10.0)
    conf = 0.0
    if suggested:
        conf += 0.4
    conf += 0.3 * tag_score
    conf += 0.2 * skill_score
    conf += 0.1 * match_score

    if not suggested and get_enrich_category_pool():
        suggested = get_enrich_category_pool()[0]
    return EnrichResponse(
        suggestedCategory=suggested,
        tags=tags,
        skills=skills,
        matchingTags=matching,
        confidence=round(max(0.0, min(1.0, conf)), 2),
    )
