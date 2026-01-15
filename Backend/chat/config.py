from pathlib import Path

# Input
INPUT_PDF = Path("mnt/data/input_source.pdf")

# Output root
OUTPUT_DIR = Path("scratch")

# OCR language(s)
OCR_LANGS = ["en"]

# Render scale for page images (1.0 ~ 72 DPI, 2.0 ~ 144 DPI, 3.0 ~ 216 DPI)
IMAGE_SCALE = 2.0

# OpenAI models
EMBED_MODEL = "text-embedding-3-small"
# Pick a model from your account that supports image inputs
CHAT_MODEL = "gpt-4.1-mini"

# Retrieval
TOP_K = 6
MIN_EVIDENCE_CHARS = 900

# Index build
MAX_TABLE_PREVIEW_ROWS = 60
MAX_EVIDENCE_CHARS_PER_RECORD = 1800
MAX_IMAGES_PER_ANSWER = 2