# Changelog

## 2026-10-08 to 2026-10-09 — audit fixes

An audit of the site covered bugs, UI and UX, accessibility, performance and
the teaching content in both languages. Each fix below is its own pull request,
and all are merged into `main`.

### Bugs

- Turning on predict mode stops autoplay, and focus and screen-reader
  announcements follow the question flow ([#11]).
- Keyboard users can mark problems as done; the checkbox has a larger target
  and long titles show two lines ([#12]).
- Tabs no longer overwrite each other's progress ([#13]).
- After React gives up hydrating the root, theme, language and sidebar
  settings come back from storage ([#36]).

### Teaching content

- Heap: the JavaScript solutions call methods `MinHeap` really has, and the
  notes cover Python 3.14's max-heap functions ([#14]).
- Union-find: LC 685, 839 and 947 are argued correctly, and the lab narrates
  equal-rank unions accurately ([#15]).
- Atlas: final quiz question 6, the complexity table and the decision tree
  ([#16]).
- Prologue: the Big-O lab's 2ⁿ values, one reference metaphor, the memory
  street and the cheat sheet ([#18]).
- Every chapter's corrections, cross-references and register: array ([#19]),
  string ([#20]), linked list ([#21]), stack ([#22]), queue ([#23]),
  hash table ([#24]), binary tree ([#25]), BST ([#26]), trie ([#27]),
  graph ([#28]) and advanced structures ([#29]).
- Chinese copy no longer shows the stray spaces JSX made from line breaks;
  a unit test guards the rule ([#39]).

### Interaction and accessibility

- The quiz accepts full-width punctuation and IME input, keeps focus and shows
  the best score ([#17]).
- The sidebar drawer, toolbar and command palette are keyboard-safe; the
  sidebar no longer prefetches every chapter ([#30]).
- The union-find, graph and segment-tree labs work with the keyboard ([#15],
  [#28], [#29]).
- Text and controls meet WCAG AA contrast in both themes ([#32]).
- Code renders as typed (no ligatures), uses one monospace font, keeps its
  file name on phones and has real tab semantics ([#33]).

### Layout

- Each page has its own title, and unknown paths get a real 404 page ([#31]).
- Phone layouts stay inside the screen, the overflow test can fail, and
  printing shows every section ([#34]).
- Text fields are 16px on phones, so iOS does not zoom in ([#40]).

### Performance

- Idle pages no longer keep the main thread busy; the home-page morph can be
  paused and respects reduced motion ([#35]).
- Fonts are self-hosted, so builds no longer fail when Google Fonts returns an
  unexpected URL, and English pages no longer load the Chinese font ([#37]).
- The atlas loads the chapters' problems without their quizzes ([#38]).

### Not changed

- English is the default language and readers switch to Chinese by hand; a
  reader who chose Chinese briefly sees English on first paint.

[#11]: https://github.com/renrenmimi/DataData/pull/11
[#12]: https://github.com/renrenmimi/DataData/pull/12
[#13]: https://github.com/renrenmimi/DataData/pull/13
[#14]: https://github.com/renrenmimi/DataData/pull/14
[#15]: https://github.com/renrenmimi/DataData/pull/15
[#16]: https://github.com/renrenmimi/DataData/pull/16
[#17]: https://github.com/renrenmimi/DataData/pull/17
[#18]: https://github.com/renrenmimi/DataData/pull/18
[#19]: https://github.com/renrenmimi/DataData/pull/19
[#20]: https://github.com/renrenmimi/DataData/pull/20
[#21]: https://github.com/renrenmimi/DataData/pull/21
[#22]: https://github.com/renrenmimi/DataData/pull/22
[#23]: https://github.com/renrenmimi/DataData/pull/23
[#24]: https://github.com/renrenmimi/DataData/pull/24
[#25]: https://github.com/renrenmimi/DataData/pull/25
[#26]: https://github.com/renrenmimi/DataData/pull/26
[#27]: https://github.com/renrenmimi/DataData/pull/27
[#28]: https://github.com/renrenmimi/DataData/pull/28
[#29]: https://github.com/renrenmimi/DataData/pull/29
[#30]: https://github.com/renrenmimi/DataData/pull/30
[#31]: https://github.com/renrenmimi/DataData/pull/31
[#32]: https://github.com/renrenmimi/DataData/pull/32
[#33]: https://github.com/renrenmimi/DataData/pull/33
[#34]: https://github.com/renrenmimi/DataData/pull/34
[#35]: https://github.com/renrenmimi/DataData/pull/35
[#36]: https://github.com/renrenmimi/DataData/pull/36
[#37]: https://github.com/renrenmimi/DataData/pull/37
[#38]: https://github.com/renrenmimi/DataData/pull/38
[#39]: https://github.com/renrenmimi/DataData/pull/39
[#40]: https://github.com/renrenmimi/DataData/pull/40
