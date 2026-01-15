import logging
import time

import pandas as pd
from docling.document_converter import DocumentConverter

from config import INPUT_PDF, OUTPUT_DIR

log = logging.getLogger(__name__)


def main():
    logging.basicConfig(level=logging.INFO)

    out_tables = OUTPUT_DIR / "tables"
    out_tables.mkdir(parents=True, exist_ok=True)

    converter = DocumentConverter()

    t0 = time.time()
    res = converter.convert(INPUT_PDF)
    dt = time.time() - t0
    stem = res.input.file.stem

    for ix, table in enumerate(res.document.tables, start=1):
        df: pd.DataFrame = table.export_to_dataframe(doc=res.document)

        csv_path = out_tables / f"{stem}-table-{ix}.csv"
        html_path = out_tables / f"{stem}-table-{ix}.html"

        df.to_csv(csv_path, index=False)
        html_path.write_text(table.export_to_html(doc=res.document), encoding="utf-8")

    log.info(f"Exported {len(res.document.tables)} tables in {dt:.2f}s")
    log.info(f"Output: {out_tables.resolve()}")


if __name__ == "__main__":
    main()