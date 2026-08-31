#!/usr/bin/env python3
"""Guard: prove a diff changed comments only, never code or content.

The invariant checked is stronger than "every changed line looks like a
comment": for each file in the diff, both revisions are stripped of their
comments and the results must be byte-identical. That also permits translating
a trailing comment (`const y = 118; // ...`) while still catching any edit to
real code or to a `zh:` value.

A minimal scanner tracks quote state so that `//` inside a string — a URL, for
instance — is not mistaken for a comment, and so that the contents of backtick
template literals (which hold teaching code shown to learners) are preserved
verbatim.

Usage: python3 scripts/check-comment-only.py [base]
"""
import subprocess
import sys


def strip_comments(src: str) -> str:
    out = []
    i, n = 0, len(src)
    quote = None          # "'", '"' or '`' when inside a string
    in_line_comment = False
    in_block_comment = False
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if in_line_comment:
            if c == "\n":
                in_line_comment = False
                out.append(c)
            i += 1
            continue
        if in_block_comment:
            if c == "*" and nxt == "/":
                in_block_comment = False
                i += 2
                continue
            if c == "\n":
                out.append(c)   # keep line structure
            i += 1
            continue
        if quote:
            out.append(c)
            if c == "\\":
                if i + 1 < n:
                    out.append(nxt)
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        # outside strings and comments
        if c == "/" and nxt == "/":
            in_line_comment = True
            i += 2
            continue
        if c == "/" and nxt == "*":
            in_block_comment = True
            i += 2
            continue
        if c in "'\"`":
            quote = c
        out.append(c)
        i += 1
    # Keep only non-blank code lines: re-wrapping a comment changes how many
    # blank lines it leaves behind, and that must not count as a change.
    return "\n".join(
        line.rstrip() for line in "".join(out).split("\n") if line.strip()
    )


def show(base: str, path: str) -> str:
    try:
        return subprocess.check_output(
            ["git", "show", f"{base}:{path}"], text=True, stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        return ""


def main() -> int:
    base = sys.argv[1] if len(sys.argv) > 1 else "HEAD"
    files = subprocess.check_output(
        ["git", "diff", "--name-only", base, "--", "*.ts", "*.tsx", "*.css"],
        text=True,
    ).split()
    if not files:
        print("✓ No source files changed.")
        return 0

    bad = []
    for path in files:
        before = strip_comments(show(base, path))
        try:
            after = strip_comments(open(path, encoding="utf-8").read())
        except FileNotFoundError:
            bad.append((path, "file is gone"))
            continue
        if before != after:
            b, a = before.split("\n"), after.split("\n")
            detail = "code differs after stripping comments"
            for idx in range(max(len(b), len(a))):
                lb = b[idx] if idx < len(b) else "<eof>"
                la = a[idx] if idx < len(a) else "<eof>"
                if lb != la:
                    detail = f"first divergence near line {idx + 1}:\n      - {lb.strip()[:90]}\n      + {la.strip()[:90]}"
                    break
            bad.append((path, detail))

    if bad:
        print(f"✗ {len(bad)} file(s) changed more than comments:\n")
        for path, detail in bad:
            print(f"  {path}\n      {detail}")
        return 1
    print(f"✓ {len(files)} file(s) changed — comments only, code identical.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
