from docling.document_converter import DocumentConverter
import os


source = os.path.join("Backend", "Chat", "data", "National-Agronomy-Manual.pdf")
output_dir = os.path.join("Backend", "Chat", "data", "simple")
output_file = os.path.join(output_dir, "simple.md")

os.makedirs(output_dir, exist_ok=True)

converter = DocumentConverter()
result = converter.convert(source)

markdown_text = result.document.export_to_markdown()

with open(output_file, "w", encoding="utf-8") as f:
    f.write(markdown_text)

print(f"Saved Markdown to {output_file}")
