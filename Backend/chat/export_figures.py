import logging
import time
from pathlib import Path

from docling_core.types.doc import ImageRefMode, PictureItem, TableItem
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption

from config import INPUT_PDF, OUTPUT_DIR, IMAGE_SCALE

log = logging.getLogger(__name__)


def main():
    logging.basicConfig(level=logging.INFO)

    out_pages = OUTPUT_DIR / "pages"
    out_elements = OUTPUT_DIR / "elements"
    out_pages.mkdir(parents=True, exist_ok=True)
    out_elements.mkdir(parents=True, exist_ok=True)

    pipe = PdfPipelineOptions()
    pipe.images_scale = IMAGE_SCALE
    pipe.generate_page_images = True
    pipe.generate_picture_images = True

    converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipe)}
    )

    t0 = time.time()
    res = converter.convert(INPUT_PDF)
    dt = time.time() - t0
    stem = res.input.file.stem

    # Save page images
    for _, page in res.document.pages.items():
        page_no = page.page_no
        fn = out_pages / f"{stem}-page-{page_no}.png"
        page.image.pil_image.save(fn, format="PNG")

    # Save figure/table element images
    table_counter = 0
    picture_counter = 0
    for element, _lvl in res.document.iterate_items():
        if isinstance(element, TableItem):
            table_counter += 1
            fn = out_elements / f"{stem}-tableimg-{table_counter}.png"
            element.get_image(res.document).save(fn, "PNG")
        elif isinstance(element, PictureItem):
            picture_counter += 1
            fn = out_elements / f"{stem}-picture-{picture_counter}.png"
            element.get_image(res.document).save(fn, "PNG")

    md_refs = OUTPUT_DIR / f"{stem}-with-image-refs.md"
    html_refs = OUTPUT_DIR / f"{stem}-with-image-refs.html"

    res.document.save_as_markdown(md_refs, image_mode=ImageRefMode.REFERENCED)
    res.document.save_as_html(html_refs, image_mode=ImageRefMode.REFERENCED)

    log.info(f"Exported pages={len(res.document.pages)}, tables={table_counter}, pictures={picture_counter} in {dt:.2f}s")
    log.info(f"Output: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()