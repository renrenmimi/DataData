"use client";

// LeetCode 题单组件。
// 每道题:勾选框(写入全站进度)+ 题号 + 标题 + 难度徽章 + 标签;
// 展开后是「提示」(先自己想)和「关键思路」(一段话讲透做法)。
// pid = `${章节 id}/${题号}`,终章总表也用同一套 id,进度全站互通。

import { useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterId } from "@/lib/curriculum";

export interface Problem {
  lc: number;
  title: string;
  d: "easy" | "medium" | "hard";
  tags: string[];
  /** 一句话提示 —— 不剧透完整解法 */
  hint: ReactNode;
  /** 关键思路 —— 一段话讲透 */
  key: ReactNode;
}

const D_LABEL = { easy: "EASY", medium: "MEDIUM", hard: "HARD" } as const;

export function ProblemSet({
  ch,
  items,
}: {
  ch: ChapterId;
  items: Problem[];
}) {
  const { isDone, toggleProblem, ready } = useProgress();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="plist">
      {items.map((p) => {
        const pid = `${ch}/${p.lc}`;
        const done = ready && isDone(pid);
        const expanded = open === p.lc;
        return (
          <div
            key={p.lc}
            className={`prob${done ? " done" : ""}${expanded ? " open" : ""}`}
            data-d={p.d}
          >
            <div
              className="prob-head"
              onClick={() => setOpen(expanded ? null : p.lc)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(expanded ? null : p.lc);
                }
              }}
              aria-expanded={expanded}
            >
              <button
                type="button"
                className="prob-check"
                aria-label={done ? "标记为未完成" : "标记为已完成"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProblem(pid);
                }}
              >
                ✓
              </button>
              <span className="prob-id">LC {p.lc}</span>
              <span className="prob-title">{p.title}</span>
              <span className="prob-tags">
                {p.tags.map((t) => (
                  <span key={t} className="prob-tag">
                    {t}
                  </span>
                ))}
              </span>
              <span className="lc-badge" data-d={p.d}>
                {D_LABEL[p.d]}
              </span>
              <span className="prob-caret" aria-hidden>
                ▼
              </span>
            </div>
            {expanded && (
              <div className="prob-body">
                <div className="prob-hint-label">提示 · 先自己想 30 秒</div>
                <p>{p.hint}</p>
                <div className="prob-hint-label">关键思路</div>
                <p>{p.key}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
