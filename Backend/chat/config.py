from pathlib import Path

INPUT_PDF = Path("mnt/data/input_source.pdf")

OUTPUT_DIR = Path("scratch")

OCR_LANGS = ["en"]

IMAGE_SCALE = 2.0

EMBED_MODEL = "text-embedding-3-small"

CHAT_MODEL = "gpt-4.1-mini"

TOP_K = 6
MIN_EVIDENCE_CHARS = 900

MAX_TABLE_PREVIEW_ROWS = 60
MAX_EVIDENCE_CHARS_PER_RECORD = 1800
MAX_IMAGES_PER_ANSWER = 2