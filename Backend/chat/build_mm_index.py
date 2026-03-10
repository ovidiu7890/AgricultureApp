import os
import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List, Dict, Any, Tuple


import numpy as np
import pandas as pd
import faiss

from openai import OpenAI
from dotenv import load_dotenv

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableStructureOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.utils.export import generate_multimodal_pages

from config import (
    INPUT_PDF,
    OUTPUT_DIR,
    OCR_LANGS,
    IMAGE_SCALE,
    EMBED_MODEL,
    MAX_TABLE_PREVIEW_ROWS,
    MAX_EVIDENCE_CHARS_PER_RECORD,
)

log = logging.getLogger(__name__)

load_dotenv()

@dataclass
class Record:
    rid: str
    rtype: str
    text: str
    meta: Dict[str, Any]


def normalize(x: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(x, axis=1, keepdims=True)
    n = np.clip(n, 1e-12, None)
    return x / n


def embed_texts(client, texts):
    import time
    import numpy as np

    clean_texts = []
    kept_idx = []
    for i, t in enumerate(texts):
        if t is None:
            continue
        if not isinstance(t, str):
            t = str(t)
        t = t.strip()
        if not t:
            continue
        clean_texts.append(t)
        kept_idx.append(i)

    if not clean_texts:
        raise ValueError("No valid texts to embed after sanitization (all were empty/None).")

    BATCH = 64
    all_vecs = []

    for start in range(0, len(clean_texts), BATCH):
        batch = clean_texts[start:start + BATCH]

        for attempt in range(5):
            try:
                resp = client.embeddings.create(
                    model=EMBED_MODEL,
                    input=batch,
                    encoding_format="float",
                )
                vecs = np.array([d.embedding for d in resp.data], dtype=np.float32)
                all_vecs.append(vecs)
                break
            except Exception as e:
                if attempt == 4:
                    raise
                time.sleep(1.5 * (attempt + 1))

    vecs_clean = np.vstack(all_vecs)

    dim = vecs_clean.shape[1]
    vecs_full = np.zeros((len(texts), dim), dtype=np.float32)

    for j, original_i in enumerate(kept_idx):
        vecs_full[original_i] = vecs_clean[j]

    return vecs_full

def docling_convert():
    pipe = PdfPipelineOptions()
    pipe.do_ocr = True
    pipe.ocr_options.lang = OCR_LANGS

    pipe.do_table_structure = True
    pipe.table_structure_options = TableStructureOptions(do_cell_matching=True)

    pipe.images_scale = IMAGE_SCALE
    pipe.generate_page_images = True

    converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipe)}
    )
    return converter.convert(INPUT_PDF)


def build_records(conv_res) -> List[Record]:
    OUT_PAGES = OUTPUT_DIR / "mm_pages"
    OUT_TABLES = OUTPUT_DIR / "mm_tables"
    OUT_PAGES.mkdir(parents=True, exist_ok=True)
    OUT_TABLES.mkdir(parents=True, exist_ok=True)

    records: List[Record] = []

    for content_text, _content_md, _content_dt, _cells, _segs, page in generate_multimodal_pages(conv_res):
        page_no = page.page_no
        img_path = OUT_PAGES / f"page_{page_no}.png"
        page.image.save(img_path, format="PNG")

        page_text = (content_text or "").strip()
        if len(page_text) > MAX_EVIDENCE_CHARS_PER_RECORD:
            page_text = page_text[:MAX_EVIDENCE_CHARS_PER_RECORD] + "\n…(truncated)"

        records.append(
            Record(
                rid=f"page_{page_no}",
                rtype="page",
                text=page_text,
                meta={"page_no": page_no, "image_path": str(img_path)},
            )
        )

    for ix, table in enumerate(conv_res.document.tables, start=1):
        df: pd.DataFrame = table.export_to_dataframe(doc=conv_res.document)
        csv_path = OUT_TABLES / f"table_{ix}.csv"
        df.to_csv(csv_path, index=False)

        preview_df = df.head(MAX_TABLE_PREVIEW_ROWS)
        md = preview_df.to_markdown(index=False)

        table_text = f"TABLE {ix} (preview; {df.shape[0]} rows x {df.shape[1]} cols):\n{md}"
        if len(table_text) > MAX_EVIDENCE_CHARS_PER_RECORD:
            table_text = table_text[:MAX_EVIDENCE_CHARS_PER_RECORD] + "\n…(truncated)"

        records.append(
            Record(
                rid=f"table_{ix}",
                rtype="table",
                text=table_text,
                meta={
                    "table_ix": ix,
                    "csv_path": str(csv_path),
                    "rows": int(df.shape[0]),
                    "cols": int(df.shape[1]),
                },
            )
        )

    return records


def build_faiss_index(vectors: np.ndarray) -> faiss.Index:
    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(vectors)
    return index


def main():
    logging.basicConfig(level=logging.INFO)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in environment.")

    client = OpenAI(api_key=api_key)

    log.info("Docling convert (OCR + tables + page images)...")
    conv_res = docling_convert()

    log.info("Building records (pages + tables)...")
    records = build_records(conv_res)
    log.info(f"Records: {len(records)}")

    texts = [r.text for r in records]
    log.info(f"Embedding records with OpenAI: {EMBED_MODEL}")
    vecs = embed_texts(client, texts)
    vecs = normalize(vecs)

    mm_dir = OUTPUT_DIR / "mm_index"
    mm_dir.mkdir(parents=True, exist_ok=True)

    log.info("Building FAISS index...")
    index = build_faiss_index(vecs)

    faiss.write_index(index, str(mm_dir / "faiss.index"))
    np.save(mm_dir / "embeddings.npy", vecs)
    (mm_dir / "records.json").write_text(
        json.dumps([asdict(r) for r in records], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    log.info(f"Saved index + records to: {mm_dir.resolve()}")


if __name__ == "__main__":
    main()