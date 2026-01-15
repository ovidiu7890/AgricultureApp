import argparse
import shutil
import subprocess
from pathlib import Path

def convert_any_to_fixed_pdf(input_path: str, output_name: str = "input_source.pdf") -> Path:
    inp = Path(input_path).expanduser().resolve()
    if not inp.exists():
        raise FileNotFoundError(f"Input not found: {inp}")

    out_pdf = inp.parent / output_name
    ext = inp.suffix.lower()

    if ext == ".pdf":
        shutil.copyfile(inp, out_pdf)
        return out_pdf

    if ext in {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"}:
        from PIL import Image
        img = Image.open(inp).convert("RGB")
        img.save(out_pdf)
        return out_pdf

    out_dir = out_pdf.parent
    cmd = [
        "soffice",
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--convert-to", "pdf",
        "--outdir", str(out_dir),
        str(inp),
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            "LibreOffice conversion failed.\n"
            f"Command: {' '.join(cmd)}\n"
            f"STDERR:\n{result.stderr}"
        )

    produced = out_dir / f"{inp.stem}.pdf"
    if not produced.exists():
        raise RuntimeError(f"Expected output not found: {produced}")

    if out_pdf.exists():
        out_pdf.unlink()
    produced.replace(out_pdf)
    return out_pdf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", help="Input file path")
    ap.add_argument("--name", default="input_source.pdf", help="Output filename (in same folder as input)")
    args = ap.parse_args()

    out = convert_any_to_fixed_pdf(args.input, args.name)
    print(f"Created: {out}")

if __name__ == "__main__":
    main()