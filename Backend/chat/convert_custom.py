import json
import logging
import time

from docling.datamodel.accelerator_options import AcceleratorDevice, AcceleratorOptions
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableStructureOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

from config import INPUT_PDF, OUTPUT_DIR, OCR_LANGS

log = logging.getLogger(__name__)


def main():
    logging.basicConfig(level=logging.INFO)

    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    pipeline_options.table_structure_options = TableStructureOptions(do_cell_matching=True)

    pipeline_options.ocr_options.lang = OCR_LANGS
    pipeline_options.accelerator_options = AcceleratorOptions(
        num_threads=4, device=AcceleratorDevice.AUTO
    )

    converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
    )

    t0 = time.time()
    res = converter.convert(INPUT_PDF)
    dt = time.time() - t0
    log.info(f"Converted in {dt:.2f}s")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    stem = res.input.file.stem

    (OUTPUT_DIR / f"{stem}.json").write_text(
        json.dumps(res.document.export_to_dict(), ensure_ascii=False),
        encoding="utf-8",
    )
    (OUTPUT_DIR / f"{stem}.txt").write_text(
        res.document.export_to_markdown(strict_text=True),
        encoding="utf-8",
    )
    (OUTPUT_DIR / f"{stem}.md").write_text(
        res.document.export_to_markdown(),
        encoding="utf-8",
    )
    (OUTPUT_DIR / f"{stem}.doctags").write_text(
        res.document.export_to_doctags(),
        encoding="utf-8",
    )

    log.info(f"Wrote exports to {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()