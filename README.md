# DataData — See Inside Data Structures

**▶ [Open the course](https://data-data.vercel.app)** — runs in your browser, nothing to install.

An interactive data structures course for people starting from zero. Every structure is
shown as a memory diagram first, then animated step by step, then written out in three
languages side by side — because the hard part is rarely the syntax, it is not being able
to see what the machine is doing.

Every page reads in **English or 中文** — one toggle in the toolbar switches the whole
course, code comments included.

Sister sites: [AlgoAlgo](https://algo-algo.vercel.app) (algorithms) and
[APIer](https://apier-eta.vercel.app) (HTTP, REST and GraphQL).

![The course home: 14 chapters, a language toggle, and the shape-shifting hero](docs/home.jpg)

*The home page — 14 chapters, and one toggle for English or 中文*

![Inside a chapter: a frame-by-frame walkthrough above the solution in three languages](docs/array.jpg)

*Inside a chapter — a frame-by-frame walkthrough (with predict mode), then the same solution in Java, Python and JavaScript*

## Chapters

| # | Chapter | What it covers |
|---|---|---|
| 00 | Prologue | Why structure matters · Big-O · the complexity cheat sheet |
| 01 | Array | Contiguous memory, the addressing formula, resizing, two pointers, sliding window |
| 02 | String | Immutability, the constant pool, encoding, concatenation costs, KMP |
| 03 | Linked list | References instead of adjacency, the dummy sentinel, fast/slow pointers |
| 04 | Stack | LIFO, the call stack, monotonic stacks |
| 05 | Queue | FIFO, circular buffers, deques, monotonic queues, BFS |
| 06 | Hash table | Hash functions, collisions, load factor, chaining vs. open addressing |
| 07 | Binary tree | Recursion, four traversals, top-down vs. bottom-up |
| 08 | BST | Ordering invariants, degeneration, AVL, red-black trees, B+ trees |
| 09 | Heap | Sift up/down, priority queues, top-K, two-heap median |
| 10 | Trie | Prefix trees, array vs. map children, autocomplete |
| 11 | Union-Find | Union by rank, path compression, the α(n) bound |
| 12 | Graph | Adjacency list vs. matrix, BFS/DFS, topological sort, Dijkstra |
| 13 | Advanced | Composite structures — LRU, LFU, segment tree, Fenwick tree, skip list, Bloom filter |
| ✦ | Atlas | Signal-to-structure map: read a problem, pick the structure |

Each chapter follows the same rhythm: an intuition first, then an interactive
visualization, then code in Java / Python / JavaScript, then the common mistakes, then
a quiz. Progress is stored locally in the browser.

Any frame-by-frame animation can also be run in **predict mode**: instead of playing the
next frame, it offers three candidate snapshots and asks you to pick the right one, then
says which axis you got wrong — the cells or the pointers. Watching becomes recall.

## Running locally

Requires Node 22 (an `.nvmrc` is included):

```bash
nvm use
npm install
npm run dev      # http://localhost:3000
```

Build with type checking: `npm run build`.

## Structure

Next.js 15 (App Router) + TypeScript + React 19, plain CSS. There are no API routes, so the whole site prerenders to static
pages.

Each chapter is one folder under `app/` holding its page, its visualizations (`viz.tsx`) and
its own stylesheet, paired with a data file under `lib/` for the problem sets.

Shared pieces: the frame-by-frame player in `lib/stepper.tsx`, the quiz component in
`lib/quiz.tsx`, progress tracking in `lib/progress.tsx`, and design tokens in
`app/globals.css`.

---

© 2026 Weiren Feng. All rights reserved. Published for reading and portfolio purposes; not
licensed for reuse, modification, or redistribution.
