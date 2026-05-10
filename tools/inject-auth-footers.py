"""Add index-matched footer + FAB to auth pages that lacked them."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    login_text = (ROOT / "login.html").read_text(encoding="utf-8")
    m = re.search(
        r'(<footer\s+class="site-footer">.*?</footer>\s*<a[^>]+footer-fab[^>]+>.*?</svg></a>)',
        login_text,
        re.DOTALL,
    )
    if not m:
        raise RuntimeError("Could not extract footer from login.html")
    block = m.group(1)

    for name in ("forgot-password.html", "reset-password.html"):
        p = ROOT / name
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8")
        if "site-footer" in t:
            print(name, "already has footer")
            continue
        t = t.replace(
            '<link rel="stylesheet" href="site-shell.css">\n</head>',
            '<link rel="stylesheet" href="site-shell.css">\n'
            '  <link rel="stylesheet" href="footer-global.css">\n</head>',
            1,
        )
        needle = '  </div>\n  </div>\n  <script src="js/config.js">'
        if needle not in t:
            print(name, "unexpected layout — manual fix needed")
            continue
        t = t.replace(needle, "  </div>\n  </div>\n\n" + block + '\n\n  <script src="js/config.js">', 1)
        p.write_text(t, encoding="utf-8")
        print("patched", name)


if __name__ == "__main__":
    main()
