import json
import logging
from pathlib import Path
import yaml

from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
from docling.datamodel.base_models import InputFormat
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.pipeline.standard_pdf_pipeline import StandardPdfPipeline

_log = logging.getLogger(__name__)

def main():
    input_path = Path("Backend/Chat/data/National-Agronomy-Manual.pdf")
    output_dir = Path("Backend/Chat/data/multiconversion")
    output_dir.mkdir(parents=True, exist_ok=True)

    doc_converter = DocumentConverter(
        allowed_formats=[InputFormat.PDF],
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_cls=StandardPdfPipeline,
                backend=PyPdfiumDocumentBackend,
            )
        },
    )

    conv_results = doc_converter.convert_all([input_path])

    for res in conv_results:
        print(f"Converted {res.input.file.name}")
        md_path = output_dir / f"{res.input.file.stem}.md"
        json_path = output_dir / f"{res.input.file.stem}.json"
        yaml_path = output_dir / f"{res.input.file.stem}.yaml"

        # Save Markdown
        with md_path.open("w", encoding="utf-8") as fp:
            fp.write(res.document.export_to_markdown())

        # Save JSON
        with json_path.open("w", encoding="utf-8") as fp:
            json.dump(res.document.export_to_dict(), fp, indent=2)

        # Save YAML
        with yaml_path.open("w", encoding="utf-8") as fp:
            yaml.safe_dump(res.document.export_to_dict(), fp, sort_keys=False)

        print(f"Saved outputs to: {output_dir.resolve()}")

if __name__ == "__main__":
    main()
