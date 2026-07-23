from pathlib import Path
import re

for name in ["Main.htm", "Savings.htm"]:
    t = Path(name).read_text(encoding="utf-8")
    print("====", name)
    # script srcs
    srcs = re.findall(r'<script[^>]+src="([^"]+)"', t)
    print("external scripts", len(srcs))
    for s in srcs[:25]:
        print(" ", s[:100])
    # id=root / mount points
    for needle in ["id=\"root\"", "id=\"app\"", "scaffold__main", "data-reactroot", "createRoot", "ReactDOM"]:
        print(needle, t.count(needle))
