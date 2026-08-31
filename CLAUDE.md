# CLAUDE.md — DataData · Data structures you can see

Read this file end to end before touching anything.

## Language convention (read first)

- **Everything written for developers is in English**: commit messages, PR titles
  and bodies, code comments, this file, and any docs added later.
- **Everything a learner reads stays bilingual.** The site defaults to English
  with a 中文 toggle, so user-facing copy is authored as `{ en, zh }` pairs
  (type `Loc<T>` from `lib/i18n.tsx`) — never English-only, never Chinese-only.
- Chinese inside a `zh:` value is content, not a comment. Never "clean it up".

## What this is

**DataData** is an interactive data-structures course for complete beginners.
The promise: **finish this course and you need no other source to learn data
structures.**

Every chapter follows the same rhythm: intuition by analogy → memory diagram →
operations broken down (interactive visualization) → implement it from scratch →
Java / Python / JavaScript side by side → high-frequency LeetCode walkthroughs
(frame-by-frame animation) → problem set → closing quiz.

The floor for the audience is **someone who has only ever written hello world.**
So:

- every conclusion needs its "why" — never state a result and move on;
- analogy first, terminology second; on first use give a term in both languages
  (e.g. 「哈希表(hash table)」in the zh copy, "hash table" in the en copy);
- assume the reader does not know what a reference or a pointer is — the
  prologue §03 teaches it, and later chapters may link back to it.

## Course structure (15 pages, easy to hard)

`lib/curriculum.ts` is the single registry (route / number / theme hue /
difficulty / tags).

Prologue (`/`) Big-O + memory + references → 01 array (incl. matrices, binary
search) → 02 string (incl. the idea behind KMP) → 03 linked list → 04 stack
(incl. monotonic stack) → 05 queue (incl. circular queue, monotonic deque) →
06 hash table (incl. Set) → 07 binary tree (incl. an introduction to recursion) →
08 BST (incl. AVL / red-black / TreeMap / B+ tree concepts) → 09 heap →
10 trie → 11 union-find → 12 graph (incl. topological sort, Dijkstra) →
13 composites and beyond (LRU / LFU / segment tree / Fenwick tree / skip list /
Bloom filter) → ✦ finale: the decision atlas (decision tree + full problem index).

## Stack and commands

- Next.js 15 (App Router) + React 19 + TypeScript, **plain CSS, no Tailwind**.
- **The machine's default Node 16 cannot run this.** Prefix every command with:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- Build check: `npm run build`. When several agents write chapters in parallel,
  **do not each run a build** (they fight over `.next`) — use
  `npx tsc --noEmit --incremental false` instead.
- Preview: `.claude/launch.json` is already configured (autoPort).
- `scripts/check-comment-only.py` proves a working-tree diff touches only
  comment lines. Use it whenever you edit comments in bulk, so a translation
  pass can never silently rewrite a `zh:` value.

## File layout and ownership

```
app/globals.css        site-wide design system — chapter authors MUST NOT edit
app/layout.tsx         shell (sidebar / toolbar / cmdk / aurora) — do not edit
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/problems.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/curriculum.ts lib/i18n.tsx
                       shared libraries — do not edit
app/<ch>/page.tsx      chapter page ("use client"; data + composition)
app/<ch>/viz.tsx       visualizations specific to this chapter
app/<ch>/chapter.css   styles specific to this chapter (imported by page.tsx)
lib/<ch>-data.tsx      this chapter's PROBLEMS + QUIZ data
```

Each chapter's palette comes free from `<main className="page" data-ch="<id>">`
(hues are registered in the `[data-ch=…]` block of globals.css — all present,
leave them alone).

**Every `page.tsx` must `import "./chapter.css"`.** Forgetting it is a silent
failure: the whole chapter renders unstyled and SVG visualizations collapse to
zero width.

## Component contracts (shared library API)

All user-facing props take `Loc<T>` — either a plain value or `{ en, zh }`.
Resolve one with `const L = useL(); L(value)`, or switch inline with
`<T en="…" zh="…" />`.

### lib/i18n.tsx

- `type Loc<T> = T | { en: T; zh: T }`
- `useL()` → `L(value)` picks the current language.
- `<T en={…} zh={…} />` works anywhere in JSX, including module-level constants.
- `useLang()` → `{ lang, setLang }` when you need the raw `"en" | "zh"`.

### lib/kit.tsx

- `<Hero ch="stack" title={{en: <>Stack</>, zh: <>栈</>}} essence={…} chips={[{id, n, label}]} />`
- `<Section id="ops" index="03" title={…} desc={…} badge={…}>{children}</Section>`
  (fades in on scroll)
- `<Callout tone="idea|warn|deep|story|win" title={…}>{children}</Callout>`
- `<BigO o="1|logn|n|nlogn|n2|2n" label?={…} />`
- `<KeyPoints points={[…]} />`, `<ChapterFooter ch="stack" />`,
  `<Reveal delay={120}>…</Reveal>`

### lib/code.tsx

- `<CodeBlock lang="java|python|js" code={string} title? hl?={[lineNos]} note?={…} />`
- `<CodeTabs title="filename without extension" java={{code, note?, hl?}} python={…} js={…} />`
  — switching a tab also switches the site-wide preferred language (the toolbar
  can too). **All three languages are required.**
- `code` is `Loc<string>`. Comments inside the snippet are teaching content, so
  write the snippet as `{ en, zh }`: **the two versions must be line-for-line
  equivalent, differing only in the comments** (otherwise `hl` line numbers
  drift between languages).

### lib/stepper.tsx (frame-by-frame playback)

- `ArrayFrame = { cells: {v: ReactNode, state?: "lit"|"ok"|"bad"|"ghost"}[],
  ptrs?: {i: number, label: Loc<string>}[], msg: Loc<ReactNode> }`
- `<ArrayStepper title={…} frames={ArrayFrame[]} cellW?={56} />`
- Free-form animations (trees, graphs) get their own component in the chapter,
  reusing `useStepper(total)` + `<StepControls stepper={s} step={s.step} total={n} />`
  and the `.viz / .viz-stage / .viz-msg / .viz-ctl` styles.
- **Predict-the-next-frame mode** ships with `ArrayStepper`; chapters configure
  nothing. When the learner turns it on, pressing Next first offers three
  candidate snapshots — the real next frame plus two distractors derived
  automatically from the frame sequence (the off-by-one overshoot / pointers
  moved but cells unchanged / cells changed but pointers unchanged / a pointer
  one cell too far). Feedback names the axis that was wrong and a score sits in
  the control bar. Styles: section 14 of globals.css (`.pf-*`).
- `StepControls` accepts optional `onNext` (intercept the advance),
  `nextDisabled`, `playDisabled` and `extra` (extra controls) — a hand-built
  animation can reuse those hooks to offer prediction too.

### lib/quiz.tsx

- `<Quiz ch="stack" items={QuizItem[]} />`. Item types:
  - `{type: "choice", q, opts: [...], correct: i, wrong: [undefined, …per-option correction], why}`
  - `{type: "multi", q, opts, correct: [i], missHint, extraHint, why}`
  - `{type: "fill", q, placeholder?, answers: [strings, lenient match — include both
    the English and Chinese spellings], hint, why}`
  - **No generic feedback.** "Incorrect" is not acceptable; every wrong option
    must explain what specifically is wrong with it.

### lib/problems.tsx

- `<ProblemSet ch="stack" items={Problem[]} />`
- `Problem = { lc: number, title: Loc<string>, d: "easy"|"medium"|"hard",
  tags: Loc<string>[], hint: one line pointing at the idea without spoiling it,
  key: one paragraph that fully explains the optimal solution }`

## Common CSS classes (provided by globals.css)

Layout: `.page .hero .sec .grid-2/.grid-3/.grid-4 .card(.hoverable) .card-kicker .card-title`
Text: `.prose .dim .mono`; tables: `.table-wrap > table.t-table`
Badges: `.chip[data-tone] .lc-badge[data-d] .big-o[data-o]`
Buttons: `.btn .btn-primary .btn-sm .btn-ghost .seg > .seg-btn`
Visualization: `.viz .viz-title .viz-stage .viz-scroll .viz-msg .viz-ctl`
Elements: `.cell(.lit/.ok/.bad/.ghost) .cell-idx .nodec(.lit) .ptr .flow-edge`
(animated dashed SVG edge)
Sliders: `.bigo-slider` lives in home.css — chapters must not use it; write your
own in `chapter.css`.

Wrap any row of cells that can exceed the viewport in `.viz-scroll` so it scrolls
horizontally instead of overflowing. Do not add `overflow: hidden` to a
visualization container: labels such as `.cell-idx` and a stack's `top` marker
sit outside the element box and would be clipped away.

## Content standard (every chapter needs all of it)

1. **§01 why it exists**: the pain of the previous chapter's structure as a
   story, an intuitive analogy, three rule/property cards.
2. **§02 what it looks like in memory**: a diagram (SVG or a div grid) that makes
   its relationship to arrays and pointers concrete.
3. **§03 core operations**: for each one, how it works *and* why that is its
   complexity; a complexity table; an interactive lab.
4. **§04 implement it from scratch**: `CodeTabs` in all three languages, commented
   line by line, actually runnable.
5. **§05 the three languages side by side**: a table of built-in types and
   standard-library APIs, plus the traps specific to each language (in `note`).
6. **§06 patterns and walkthroughs**: this chapter's high-frequency LeetCode
   patterns, then 2–3 full walkthroughs, each one: problem → brute force → why it
   can be improved → frame-by-frame animation (`ArrayStepper` or hand-built) →
   solutions in all three languages (with highlighted lines) → complexity →
   the interview follow-up.
7. **§07 problem set**: 8–12 problems, easy to hard, tagged by pattern.
8. **§08 closing quiz**: 6–8 items, mixed types, targeted correction for every
   wrong option.
9. `KeyPoints` (4–6 items, with the key phrase in bold) + `<ChapterFooter />`.
10. Sprinkled throughout: `Callout tone="deep"` for how the structure is used in
    real systems, `tone="warn"` for common misconceptions, `tone="story"` for
    history and trivia.

## Chapter CSS rules

All CSS is global. Custom classes in `app/<ch>/chapter.css` **must carry a
chapter prefix** (`.stk-*` for the stack, `.hp-*` for the heap, and so on) or be
nested under `[data-ch="<id>"]`, so one chapter cannot leak into another.

Use the design tokens for every colour — `var(--acc) var(--acc-soft)
var(--acc-border) var(--acc-ink) var(--acc-glow) var(--ok) var(--warn)
var(--risk) var(--text-2) var(--border)` — so light and dark themes adapt on
their own. Never hard-code a colour.

## Copy style (important, applies site-wide)

**Register: the clear statement of a textbook or a good piece of technical
documentation. Accessible ≠ chatty.** Being understandable to a beginner is the
goal, but the voice stays professional, plain and concise. This applies to both
the English and the Chinese copy.

- **Not allowed**: internet slang and memes, gaming / anime / fandom vocabulary,
  cutesy particles (in Chinese: 「啦」「呀」「嘛」「~」), comedic
  self-questioning ("you know what? "、「你猜怎么着」「好问题」「其实吧」),
  jokes at the reader's expense (「你会哭」).
- **Equally not allowed**, the LLM register: "it's worth noting that", "in
  summary", "let's dive deep into", "empower" — and in Chinese
  「值得注意的是」「综上所述」「让我们深入探讨」「赋能」.
- **Keep and encourage**: plain explanation aimed at beginners and well-chosen
  everyday analogies (a stack of plates for a stack, numbered lockers for an
  array, ordering at a restaurant for an API). The analogy itself is an asset —
  the failure mode is only ever a flippant tone. Deliver them matter-of-factly.
- Use exclamation marks sparingly. Emphasis comes from bold text and word
  choice, not punctuation.
- No decorative emoji in card titles or section titles. Symbols are functional
  only: ✓ ✕ → ★.
- The same rules apply to comments inside teaching code. No first-person
  anthropomorphising ("I'm warmer than the top of the stack").
- Sentences may be short, but they must be complete and accurate.

## JSX notes

- In Chinese copy use the Chinese quotation marks 「」 and "" directly; do not
  escape ASCII quotes.
- `<` and `>` must be written `&lt;` and `&gt;` (e.g. `sum &lt; target`).
- `CodeTabs` snippets are template literals — escape any backtick inside them.
- Comments inside a snippet follow the language of the half they sit in: the
  `en` snippet gets English comments, the `zh` snippet gets Chinese ones.

## GitHub and misc

- Repo: https://github.com/renrenmimi/DataData (public, `main`).
  Recent work goes through a feature branch → PR → merge. Commit and push only
  when the user asks for it.
- Reference projects (where the shell came from): `../SYSDesigner`,
  `../AgentLab` — read-only, do not modify.
