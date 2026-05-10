"""Replace footer + WhatsApp FAB on all root *.html with markup from index.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def extract_canonical(index_text: str) -> tuple[str, str]:
    foot_m = re.search(
        r"<footer\s+class=\"site-footer\">.*?</footer>",
        index_text,
        re.DOTALL,
    )
    fab_m = re.search(
        r"<a\s+href=\"https://wa\.me/923332361713\"\s+class=\"footer-fab\s+footer-fab--whatsapp\"[^>]*>.*?</svg></a>",
        index_text,
        re.DOTALL,
    )
    if not foot_m or not fab_m:
        raise RuntimeError("Could not parse footer or FAB from index.html")
    return foot_m.group(0), fab_m.group(0)


def main() -> None:
    index_text = (ROOT / "index.html").read_text(encoding="utf-8")
    footer_block, fab_line = extract_canonical(index_text)

    footer_re = re.compile(
        r"<footer\s+class=\"site-footer\">.*?</footer>",
        re.DOTALL,
    )
    fab_re = re.compile(
        r"\s*<a\s+href=\"https://wa\.me/923332361713\"\s+class=\"footer-fab\s+footer-fab--whatsapp\"[^>]*>.*?</svg></a>",
        re.DOTALL,
    )

    updated: list[str] = []
    for p in sorted(ROOT.glob("*.html")):
        text = p.read_text(encoding="utf-8")
        if '<footer class="site-footer">' not in text:
            continue
        new_text = footer_re.sub(footer_block, text, count=1)
        new_text = fab_re.sub("", new_text)
        if fab_line.strip() not in new_text:
            new_text = new_text.replace("</footer>", "</footer>\n\n" + fab_line, 1)
        if new_text != text:
            p.write_text(new_text, encoding="utf-8")
            updated.append(p.name)

    print("Updated:", ", ".join(updated) if updated else "(none)")


if __name__ == "__main__":
    main()
