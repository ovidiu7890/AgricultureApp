import os
import json
import base64
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

import numpy as np
import faiss
from openai import OpenAI

from config import (
    OUTPUT_DIR,
    EMBED_MODEL,
    CHAT_MODEL,
    TOP_K,
    MIN_EVIDENCE_CHARS,
    MAX_IMAGES_PER_ANSWER,
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("mm-chat")

load_dotenv()

def b64_png(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("utf-8")


def normalize(x: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(x, axis=1, keepdims=True)
    n = np.clip(n, 1e-12, None)
    return x / n


def embed_query(client: OpenAI, text: str) -> np.ndarray:
    resp = client.embeddings.create(
        model=EMBED_MODEL,
        input=[text],
        encoding_format="float",
    )
    v = np.array([resp.data[0].embedding], dtype=np.float32)
    return normalize(v)


def load_index_and_records():
    mm_dir = OUTPUT_DIR / "mm_index"
    index_path = mm_dir / "faiss.index"
    records_path = mm_dir / "records.json"

    if not index_path.exists() or not records_path.exists():
        raise RuntimeError("Missing mm_index. Run 05_build_mm_index.py first.")

    index = faiss.read_index(str(index_path))
    records = json.loads(records_path.read_text(encoding="utf-8"))
    return index, records


def retrieve(client: OpenAI, index: faiss.Index, records: List[Dict[str, Any]], question: str, k: int):
    qv = embed_query(client, question)
    scores, ids = index.search(qv, k)

    hits = []
    for i in ids[0].tolist():
        if i == -1:
            continue
        hits.append(records[i])
    return hits


def system_prompt() -> str:
    return (
        "You are an expert assistant answering ONLY using the provided DOCUMENT EVIDENCE.\n"
        "Strict rules:\n"
        "1) If the answer is not clearly supported by the evidence, say exactly:\n"
        "   \"I don't know based on the provided document.\"\n"
        "   Then ask one clarifying question.\n"
        "2) Do NOT use outside knowledge.\n"
        "3) Cite sources using record ids like [page_12] or [table_3] next to claims.\n"
        "4) If a question is about a chart/figure, use the attached page image evidence.\n"
        "5) Be clear and structured.\n"
    )


def build_evidence(hits: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:

    parts = []
    page_hits = [h for h in hits if h["rtype"] == "page"]
    for h in hits:
        txt = (h.get("text") or "").strip()
        parts.append(f"[{h['rid']}]\n{txt}")
    evidence_text = "\n\n---\n\n".join(parts)

    image_items = []
    for h in page_hits[:MAX_IMAGES_PER_ANSWER]:
        img_path = Path(h["meta"]["image_path"])
        if img_path.exists():
            image_items.append(
                {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{b64_png(img_path)}",
                }
            )

    return evidence_text, image_items


def ask(client: OpenAI, question: str, hits: List[Dict[str, Any]]) -> Dict[str, Any]:
    evidence_text, image_items = build_evidence(hits)

    if len(evidence_text) < MIN_EVIDENCE_CHARS:
        return {
            "answer": "I don't know based on the provided document.\n"
                      "Which section/page/table should I focus on (or what exact term should I search for)?",
            "citations": [h["rid"] for h in hits],
        }

    user_content = [
        {
            "type": "input_text",
            "text": (
                f"QUESTION:\n{question}\n\n"
                f"DOCUMENT EVIDENCE:\n{evidence_text}\n\n"
                "Answer using only the evidence. Add citations like [page_12] or [table_3]."
            ),
        }
    ] + image_items

    resp = client.responses.create(
        model=CHAT_MODEL,
        input=[
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_content},
        ],
        temperature=0,
    )

    return {
        "answer": resp.output_text,
        "citations": [h["rid"] for h in hits],
        "used_images": [h["rid"] for h in hits if h["rtype"] == "page"][:MAX_IMAGES_PER_ANSWER],
    }


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in environment.")

    client = OpenAI(api_key=api_key)
    index, records = load_index_and_records()

    print("\nMultimodal PDF Chat ready (text + tables + charts via page images).")
    print("Type a question, or 'exit'.\n")

    while True:
        q = input("You: ").strip()
        if not q or q.lower() in {"exit", "quit"}:
            break

        hits = retrieve(client, index, records, q, TOP_K)
        res = ask(client, q, hits)

        print("\nAssistant:\n" + res["answer"])
        if res.get("citations"):
            print("\nCitations:", ", ".join(res["citations"]))
        print("")


if __name__ == "__main__":
    main()