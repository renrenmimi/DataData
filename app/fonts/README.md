# Fonts

The site's four typefaces are self-hosted from this directory, so `next build`
never downloads fonts. Fetching them from Google Fonts at build time made
builds fail at random: `next/font/google` crashes (`loader.js`, "Cannot read
properties of null (reading '1')") when a font URL in Google's CSS has no file
extension.

| File | Family | Coverage | Used for |
|---|---|---|---|
| `syne-latin.woff2` | Syne, weights 600–800 | Google Fonts latin subset | Display headings |
| `space-grotesk-latin.woff2` | Space Grotesk, weights 400–700 | Google Fonts latin subset | Interface text |
| `jetbrains-mono-latin.woff2` | JetBrains Mono, weights 400–700 | Google Fonts latin subset | Code and numbers |
| `noto-sans-sc/*.woff2`, `noto-sans-sc.css` | Noto Sans SC, weights 400–900 | Google Fonts' 101 unicode-range slices | Chinese pages only |

The files are the variable fonts as Google Fonts serves them; the three Latin
families are loaded with `next/font/local` in `app/layout.tsx`, and Noto Sans SC
through the plain `@font-face` rules in `noto-sans-sc.css`.

All four families are licensed under the SIL Open Font License 1.1, which
permits redistributing them with this site. Each file carries its copyright
notice and license in its metadata; the license is published at
https://openfontlicense.org.
