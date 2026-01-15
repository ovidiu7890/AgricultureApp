import datetime
import logging
import time

import pandas as pd

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.utils.export import generate_multimodal_pages
from docling.utils.utils import create_hash

from config import INPUT_PDF, OUTPUT_DIR, IMAGE_SCALE

log = logging.getLogger(__name__)


def main():
    logging.basicConfig(level=logging.INFO)

    pipe = PdfPipelineOptions()
    pipe.images_scale = IMAGE_SCALE
    pipe.generate_page_images = True

    converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipe)}
    )

    t0 = time.time()
    res = converter.convert(INPUT_PDF)

    rows = []
    for content_text, content_md, content_dt, page_cells, page_segments, page in generate_multimodal_pages(res):
        dpi = page._default_image_scale * 72
        rows.append(
            {
                "document": res.input.file.name,
                "hash": res.input.document_hash,
                "page_hash": create_hash(res.input.document_hash + ":" + str(page.page_no - 1)),
                "image": {
                    "width": page.image.width,
                    "height": page.image.height,
                    "bytes": page.image.tobytes(),
                },
                "cells": page_cells,
                "contents": content_text,
                "contents_md": content_md,
                "contents_dt": content_dt,
                "segments": page_segments,
                "extra": {
                    "page_num": page.page_no,
                    "width_in_points": page.size.width,
                    "height_in_points": page.size.height,
                    "dpi": dpi,
                },
            }
        )

    df = pd.json_normalize(rows)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.datetime.now()
    out_path = OUTPUT_DIR / f"multimodal_{now:%Y-%m-%d_%H%M%S}.parquet"
    df.to_parquet(out_path)

    dt = time.time() - t0
    log.info(f"Wrote {out_path} in {dt:.2f}s")


if __name__ == "__main__":
    main()