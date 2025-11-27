
import datetime
import logging
import time
from pathlib import Path

import pandas as pd

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.utils.export import generate_multimodal_pages
from docling.utils.utils import create_hash

_log = logging.getLogger(__name__)

IMAGE_RESOLUTION_SCALE = 2.0


def main():
    logging.basicConfig(level=logging.INFO)

    # Paths relative to the script file
    script_dir = Path(__file__).parent
    data_folder = script_dir / "../data"
    input_doc_path = data_folder / "National-Agronomy-Manual.pdf"
    output_dir = data_folder / "scratch-multimodal"

    output_dir.mkdir(parents=True, exist_ok=True)
    _log.info(f"Output directory: {output_dir.resolve()}")

    pipeline_options = PdfPipelineOptions()
    pipeline_options.images_scale = IMAGE_RESOLUTION_SCALE
    pipeline_options.generate_page_images = True

    doc_converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
    )

    start_time = time.time()
    conv_res = doc_converter.convert(input_doc_path)

    rows = []
    for content_text, content_md, content_dt, page_cells, page_segments, page in generate_multimodal_pages(conv_res):
        dpi = page._default_image_scale * 72
        rows.append({
            "document": conv_res.input.file.name,
            "hash": conv_res.input.document_hash,
            "page_hash": create_hash(conv_res.input.document_hash + ":" + str(page.page_no - 1)),
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
                "page_num": page.page_no + 1,
                "width_in_points": page.size.width,
                "height_in_points": page.size.height,
                "dpi": dpi,
            },
        })

    df_result = pd.json_normalize(rows)

    now = datetime.datetime.now()
    output_filename = output_dir / f"multimodal_{now:%Y-%m-%d_%H%M%S}.parquet"
    df_result.to_parquet(output_filename)

    end_time = time.time() - start_time
    _log.info(f"Document converted and multimodal pages generated in {end_time:.2f} seconds.")
    _log.info(f"Parquet file saved to: {output_filename.resolve()}")


if __name__ == "__main__":
    main()