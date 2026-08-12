# CLAUDE.md — DataData · 看得见的数据结构

新会话先读完这份文件再动手。

## 这是什么

**DataData(看得见的数据结构)**:面向零基础学习者的交互式数据结构课程网站。
承诺:**学完这一套课,不需要再从任何别的渠道学数据结构。**
每章同一个节奏:直觉类比 → 内存图解 → 操作拆解(交互可视化)→ 手写实现 →
Java/Python/JS 三语言对照 → LeetCode 高频精讲(逐帧动画)→ 题单 → 通关测验。

目标受众下限:**刚会写 hello world 的完全新手**。因此:
- 每个结论必须给「为什么」,不许只给结论;
- 比喻先行,再上术语;术语第一次出现时用中文+英文双写;
- 假设读者不知道「引用/指针」是什么 —— 序章 §03 专门教过,后续章节可引用它。

## 课程结构(15 页,由易到难)

`lib/curriculum.ts` 是唯一的章节注册表(路由/编号/主题色相/难度/标签)。
序章(/)Big-O+内存+引用 → 01 数组(含矩阵、二分)→ 02 字符串(含 KMP 思想)→
03 链表 → 04 栈(含单调栈)→ 05 队列(含循环队列、单调队列)→ 06 哈希表(含 Set)→
07 二叉树(含递归入门)→ 08 BST(含 AVL/红黑/TreeMap/B+树概念)→ 09 堆 →
10 Trie → 11 并查集 → 12 图(含拓扑排序、Dijkstra)→ 13 进阶组合(LRU/LFU/
线段树/树状数组/跳表/布隆过滤器)→ ✦ 终章选型地图(决策树+全书题单总表)。

## 技术栈与命令

- Next.js 15(App Router)+ React 19 + TypeScript,**纯 CSS 无 Tailwind**。
- **本机默认 Node 16 跑不动**,一切命令加:
  `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"`
- 构建验证:`npm run build`;并行写章节时**不要各自跑 build**(.next 冲突),
  用 `npx tsc --noEmit --incremental false` 做类型检查。
- 预览:`.claude/launch.json` 已配置(autoPort)。

## 文件布局与所有权

```
app/globals.css        全站设计系统 —— 章节作者【禁止改】
app/layout.tsx         外壳(sidebar/toolbar/cmdk/aurora)—— 禁止改
lib/kit.tsx lib/code.tsx lib/quiz.tsx lib/problems.tsx lib/stepper.tsx
lib/highlight.tsx lib/progress.tsx lib/curriculum.ts    共享库 —— 禁止改
app/<ch>/page.tsx      章节主页面("use client",数据+组合)
app/<ch>/viz.tsx       本章专属可视化组件
app/<ch>/chapter.css   本章专属样式(page.tsx 里 import "./chapter.css")
lib/<ch>-data.tsx      本章题单 PROBLEMS + 测验 QUIZ 数据
```

每章配色由 `<main className="page" data-ch="<章节id>">` 自动生效
(色相注册在 globals.css 的 `[data-ch=…]` 段,已全部就位,勿动)。

## 组件契约(共享库 API,按此使用)

### lib/kit.tsx
- `<Hero ch="stack" title={<>栈 <span className="grad">Stack</span></>} essence={<>…</>} chips={[{id:"intuition",n:"01",label:"直觉"},…]} />`
- `<Section id="ops" index="03" title="…" desc="…" badge={<span className="chip">…</span>}>{children}</Section>`(自带滚动淡入)
- `<Callout tone="idea|warn|deep|story|win" title="…">{<p>…</p>}</Callout>`
- `<BigO o="1|logn|n|nlogn|n2|2n" label="可选覆盖文字" />`
- `<KeyPoints points={[<>…</>, …]} />`、`<ChapterFooter ch="stack" />`、`<Reveal delay={120}>…</Reveal>`

### lib/code.tsx
- `<CodeBlock lang="java|python|js" code={string} title? hl?={[行号]} note?={ReactNode} />`
- `<CodeTabs title="文件名不带后缀" java={{code, note?, hl?}} python={…} js={…} />`
  —— 切 tab 会联动全站偏好语言(顶栏也能切),**三个语言都必须写**。

### lib/stepper.tsx(逐帧慢放)
- `ArrayFrame = { cells: {v: ReactNode, state?: "lit"|"ok"|"bad"|"ghost"}[], ptrs?: {i:number,label:string}[], msg: ReactNode }`
- `<ArrayStepper title="…" frames={ArrayFrame[]} cellW?={56} />`
- 自由形态动画(树/图)自建组件,复用 `useStepper(total)` + `<StepControls stepper={s} step={s.step} total={n} />` + `.viz/.viz-stage/.viz-msg/.viz-ctl` 样式。

### lib/quiz.tsx
- `<Quiz ch="stack" items={QuizItem[]} />`;题型:
  - `{type:"choice", q, opts:[…], correct:i, wrong:[undefined,…每个错误项的针对性纠错], why}`
  - `{type:"multi", q, opts, correct:[i], missHint, extraHint, why}`
  - `{type:"fill", q, placeholder?, answers:[字符串宽容匹配], hint, why}`
  - **禁止通用文案**(「答案不正确」不合格),每个错误选项要解释错在哪。

### lib/problems.tsx
- `<ProblemSet ch="stack" items={Problem[]} />`
- `Problem = { lc:number, title, d:"easy"|"medium"|"hard", tags:[…], hint:一句话方向提示不剧透, key:一段话讲透最优解 }`

## 常用 CSS 类(globals.css 已提供)

布局:`.page .hero .sec .grid-2/.grid-3/.grid-4 .card(.hoverable) .card-kicker .card-title`
文本:`.prose .dim .mono`;表格:`.table-wrap > table.t-table`
徽章:`.chip[data-tone] .lc-badge[data-d] .big-o[data-o]`;按钮:`.btn .btn-primary .btn-sm .btn-ghost .seg>.seg-btn`
可视化:`.viz .viz-title .viz-stage .viz-msg .viz-ctl`;
元素:`.cell(.lit/.ok/.bad/.ghost) .cell-idx .nodec(.lit) .ptr .flow-edge`(SVG 流动虚线边)
滑杆排版:`.bigo-slider`(在 home.css —— 章节别用,自己在 chapter.css 里写)。

## 内容标准(每章必须全部具备)

1. **§01 为什么需要它**:上一章结构的痛点故事引入 + 直觉类比 + 三张规则/特性卡。
2. **§02 内存里的样子**:图解(SVG 或 div 网格),讲清与数组/指针的关系。
3. **§03 核心操作**:每个操作「怎么做+为什么是这个复杂度」,复杂度表,配交互实验室。
4. **§04 手写实现**:从零实现该结构(CodeTabs 三语言,逐行注释,能直接跑)。
5. **§05 三语言对照**:内置类型/标准库 API 对照表 + 每语言的坑(note 里写)。
6. **§06 套路与精讲**:本章 LeetCode 高频套路讲解;2-3 道精讲,每道 =
   题意→暴力→为什么能优化→逐帧动画(ArrayStepper 或自建)→三语言题解(带高亮行)
   →复杂度→面试追问。
7. **§07 高频题单**:8-12 题,由易到难,tags 标套路。
8. **§08 通关测验**:6-8 题,混合题型,每个错误选项针对性纠错。
9. **KeyPoints**(4-6 条,有加粗重点)+ `<ChapterFooter />`。
10. 穿插:`Callout tone="deep"` 工程现场(该结构在真实系统里的应用)、
    `tone="warn"` 常见误区、`tone="story"` 历史/趣闻。

语气:中文为主,术语中英双写;像给聪明的朋友讲课,不端着;
每个数字/结论都要能回答「为什么」。

## 章节 CSS 规则

所有 CSS 都是全局的!`app/<ch>/chapter.css` 里的自定义类**必须带章节前缀**
(如栈章用 `.stk-*`、堆章用 `.hp-*`),或整体套在 `[data-ch="<id>"]` 选择器下,
避免污染其他章节。颜色一律用 `var(--acc) var(--acc-soft) var(--acc-border)
var(--acc-ink) var(--acc-glow) var(--ok) var(--warn) var(--risk) var(--text-2)
var(--border)` 等 token,深浅主题自动适配,禁止写死颜色。

## 文案风格（重要，全站贯穿）

**基调：教科书 / 技术文档式的清晰陈述。通俗 ≠ 口语化。**
面向零基础讲得明白是目标，但语气必须专业、正式、简洁。

- **禁止**：网络用语与流行梗（「翻车」「离谱」「一把梭」「说白了」「香」「完全体」
  「正确姿势」「甩锅」「手一抖」「玩完了」「没毛病」「血赚」「天花板」）、
  游戏／动漫／饭圈用语（「大招」「名场面」「官配」「装备栏」「段位」）、
  卖萌语气词（「啦」「呀」「嘛」「~」）、插科打诨式自问自答（「你猜怎么着」
  「好问题」「其实吧」）、拿读者开玩笑（「你会哭」「用户怕是要报警」）；
- **同样禁止** AI 腔：「值得注意的是」「综上所述」「让我们深入探讨」「赋能」；
- **保留并鼓励**：面向零基础的通俗解释、恰当的生活类比（一摞盘子讲栈、
  编号储物柜讲数组、餐厅点菜讲 API）—— 类比本身是好东西，问题只出在表达轻佻。
  比喻要讲得平实；
- 感叹号克制使用。正文强调靠加粗和措辞，不靠标点；
- 卡片标题、章节标题不加装饰性 emoji；符号只用 ✓ ✕ → ★ 这类功能性记号；
- 代码注释同样适用以上规则，不要用第一人称拟人（「我比栈顶暖」）；
- 术语第一次出现时中文 + 英文双写（如「哈希表（hash table）」），之后可只用惯用形；
- 句子可以短，但必须完整、准确。

## JSX 文案注意

- 正文里的引号直接用中文「」和"",不要转义英文引号;
- 小于/大于号必须写 `&lt; &gt;`(如 sum &lt; target);
- 代码字符串里的中文注释没问题;CodeTabs 的 code 用模板字符串,内部反引号要转义。

## GitHub / 其他

- 无 git 仓库(用户没要求);提交需用户明确要求。
- 参考项目(外壳形式来源):../SYSDesigner ../AgentLab —— 只读参考,勿改。
