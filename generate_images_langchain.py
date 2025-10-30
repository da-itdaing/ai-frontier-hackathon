#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generate card thumbnails using LangChain (for prompt refinement) + OpenAI Images API,
and save to public/images/generated/<id>.jpg for the frontend to consume.

Flow:
1) Build a base image prompt from item details.
2) (Optional) Refine the prompt with a chat model via LangChain's ChatOpenAI.
3) Generate a square image via OpenAI Images API (gpt-image-1).
4) Convert PNG -> JPEG and save under public/images/generated/<id>.jpg.

Usage:
  OPENAI_API_KEY=sk-... python3 generate_images_langchain.py --size 1024 --limit 20

Notes:
- Idempotent: overwrites images with the same id unless you omit --overwrite.
- Reads items from data/*.json: data.json, needs_cases.json, gives_cases.json.
- Use --dry-run to print actions without any API calls or file writes.
- Allowed sizes: auto | 1024x1024 | 1024x1536 | 1536x1024
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, List, Optional
from urllib.request import urlopen

from tqdm import tqdm

# Dependencies:
#   pip install openai pillow tqdm langchain-openai langchain-community
try:
    from openai import OpenAI
except Exception:
    raise SystemExit("OpenAI SDK is required. Install with: pip install openai")

try:
    from PIL import Image
    from io import BytesIO
except Exception:
    raise SystemExit("Pillow is required. Install with: pip install pillow")

# LangChain (for prompt refinement only)
try:
    from langchain_openai import ChatOpenAI
    from langchain.schema import HumanMessage, SystemMessage
    _HAS_LANGCHAIN = True
except Exception:
    _HAS_LANGCHAIN = False  # allow --no-llm path without LangChain installed


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
PUBLIC_DIR = ROOT / "public" / "images" / "generated"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)


# -----------------------------
# Data Model & Loading
# -----------------------------

@dataclass
class Card:
    id: str
    title: str
    category: Optional[str]
    description: Optional[str] = None
    source: Optional[str] = None  # e.g., data.needs | data.gives | needs_cases | gives_cases


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def iter_cards() -> Iterable[Card]:
    """Yield Card items from data.json, needs_cases.json, gives_cases.json."""
    data_json = load_json(DATA_DIR / "data.json")
    for coll in ["needs", "gives"]:
        for item in (data_json.get(coll, []) or []):
            id_ = str(item.get("id") or "").strip()
            if not id_:
                continue
            yield Card(
                id=id_,
                title=str(item.get("title") or id_),
                category=item.get("category"),
                description=item.get("description"),
                source=f"data.{coll}",
            )

    needs_cases = load_json(DATA_DIR / "needs_cases.json")
    for item in needs_cases:
        id_ = str(item.get("id") or "").strip()
        if not id_:
            continue
        yield Card(
            id=id_,
            title=str(item.get("title") or id_),
            category=item.get("category"),
            description=item.get("description"),
            source="needs_cases",
        )

    gives_cases = load_json(DATA_DIR / "gives_cases.json")
    for idx, row in enumerate(gives_cases):
        year = row.get("year")
        month = row.get("month")
        id_ = f"givecase-{year or 'y'}{str(month or 'm').zfill(2)}-{idx}"
        yield Card(
            id=id_,
            title=str(row.get("name") or id_),
            category=None,
            description=str(row.get("content") or ""),
            source="gives_cases",
        )


# -----------------------------
# Prompting
# -----------------------------

def build_image_prompt(card: Card) -> str:
    """Construct a direct image prompt from the card details."""
    parts: List[str] = []
    parts.append("Design a square, high-quality illustrative thumbnail (no text) for:")
    parts.append(f"Title: {card.title}")
    if card.category:
        parts.append(f"Category: {card.category}")
    if card.description:
        parts.append(f"Description: {card.description}")
    parts.append(
        "Style: vector art, modern flat illustration, clean composition, subtle gradients, "
        "soft lighting, coherent color palette, high contrast focal point, centered composition, "
        "no logos, no words."
    )
    return "\n".join(parts)


def refine_prompt_with_llm_langchain(base_prompt: str, model: str) -> str:
    """Refine the prompt with LangChain's ChatOpenAI. Return only the final prompt text."""
    if not _HAS_LANGCHAIN:
        return base_prompt
    try:
        # Use LangChain defaults (e.g., default temperature)
        llm = ChatOpenAI(model=model)
        messages = [
            SystemMessage(content="You are an elite prompt engineer for image generation. Return only the final prompt."),
            HumanMessage(content=(
                "Given these requirements, write a vivid, safe prompt for the Images API.\n"
                "Rules: no brand names, no text in the image, no logos, square composition, illustrative (not photorealistic).\n\n"
                f"Requirements:\n{base_prompt}"
            )),
        ]
        resp = llm.invoke(messages)
        content = (resp.content or "").strip()
        return content if content else base_prompt
    except Exception:
        return base_prompt


# -----------------------------
# Image Generation (OpenAI SDK)
# -----------------------------

ALLOWED_SIZES = {"auto", "1024x1024", "1024x1536", "1536x1024"}

def normalize_size_arg(size_arg: str) -> str:
    """Normalize CLI --size to one of the allowed values.
    - '1024' -> '1024x1024'
    - already-allowed strings pass through
    - anything else raises ValueError (e.g., '512', '512x512')
    """
    s = str(size_arg).strip().lower()
    if s == "1024":
        return "1024x1024"
    if s in ALLOWED_SIZES:
        return s
    raise ValueError(
        f"Unsupported size '{size_arg}'. Allowed: {', '.join(sorted(ALLOWED_SIZES))} or '1024'."
    )


def generate_image_bytes(client: OpenAI, prompt: str, size: str) -> bytes:
    """Call OpenAI Images API (gpt-image-1) and return raw PNG bytes.
    - We pass only required args to respect API defaults.
    """
    resp = client.images.generate(
        model="gpt-image-1",
        prompt=prompt,
        size=size,  # must be one of ALLOWED_SIZES
    )

    data0 = resp.data[0]

    # Prefer base64 when available
    b64 = getattr(data0, "b64_json", None)
    if b64:
        return base64.b64decode(b64)

    # Fallback to URL download
    url = getattr(data0, "url", None)
    if url:
        with urlopen(url, timeout=30) as r:
            return r.read()

    raise RuntimeError("Images API response missing both b64_json and url fields.")


def png_to_jpeg_bytes(png_bytes: bytes, quality: int = 88) -> bytes:
    with Image.open(BytesIO(png_bytes)) as im:
        rgb = im.convert("RGB")
        out = BytesIO()
        rgb.save(out, format="JPEG", quality=quality)
        return out.getvalue()


def save_jpeg(jpeg_bytes: bytes, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(jpeg_bytes)


def backoff_sleep(attempt: int) -> None:
    # Exponential backoff up to 10s
    time.sleep(min(1.5 * (2 ** attempt), 10))


# -----------------------------
# CLI Main
# -----------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate images via LangChain + OpenAI and save under public/images/generated.")
    parser.add_argument(
        "--size",
        type=str,
        default="auto",
        help="Image size: auto | 1024 | 1024x1024 | 1024x1536 | 1536x1024 (default: auto)",
    )
    parser.add_argument("--limit", type=int, default=0, help="Process only N items (0 = all)")
    parser.add_argument("--no-llm", dest="use_llm", action="store_false", help="Do not refine prompt with a chat model")
    parser.add_argument("--llm-model", type=str, default="gpt-4o-mini", help="Chat model for prompt refinement (LangChain)")
    parser.add_argument("--overwrite", action="store_true", help="Re-generate even if the file already exists")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without calling APIs")
    args = parser.parse_args()

    # Normalize/validate size early (fail fast for unsupported values such as 512/512x512)
    try:
        normalized_size = normalize_size_arg(args.size)
    except ValueError as e:
        raise SystemExit(str(e))

    if args.dry_run:
        print("[INFO] Dry run enabled: will NOT call APIs or write any image files.\n")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key and not args.dry_run:
        raise SystemExit("OPENAI_API_KEY is not set in environment (required unless --dry-run).")

    client = OpenAI(api_key=api_key) if not args.dry_run else None  # type: ignore

    items = list(iter_cards())
    if args.limit and args.limit > 0:
        items = items[: args.limit]

    processed = 0
    for card in tqdm(items, desc="Generating images", ncols=100):
        out_path = PUBLIC_DIR / f"{card.id}.jpg"
        if out_path.exists() and not args.overwrite:
            continue

        base_prompt = build_image_prompt(card)
        final_prompt = (
            refine_prompt_with_llm_langchain(base_prompt, args.llm_model)
            if (args.use_llm)
            else base_prompt
        )

        if args.dry_run:
            print(f"[DRY] Would generate {out_path.name} with size={normalized_size} and prompt:\n{final_prompt}\n")
            processed += 1
            continue

        # Call Images API with retries
        png_bytes: Optional[bytes] = None
        last_err: Optional[BaseException] = None
        for attempt in range(5):
            try:
                png_bytes = generate_image_bytes(
                    client,
                    final_prompt,
                    size=normalized_size,
                )
                break
            except Exception as e:
                last_err = e
                backoff_sleep(attempt)

        if png_bytes is None:
            raise RuntimeError(f"Images API failed for {card.id}: {last_err}")

        # Convert to JPEG and save
        jpeg_bytes = png_to_jpeg_bytes(png_bytes, quality=88)
        save_jpeg(jpeg_bytes, out_path)
        processed += 1
        time.sleep(0.25)  # polite pacing

    if args.dry_run:
        print(f"Done (dry run). Simulated generating {processed} images. To actually write files, re-run without --dry-run.")
    else:
        print(f"Done. Generated {processed} images into {PUBLIC_DIR}")


if __name__ == "__main__":
    main()
