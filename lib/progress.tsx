"use client";

// 全站学习进度 —— localStorage 持久化。
// 两类事实:① 勾掉的练习题("array/283" 这种 `${章节}/${LC题号}` 键);
// ② 每章 Quiz 的最好成绩。章节状态由此推导:new(没动过)/ doing(动过)/ done(测验全对)。
// 所有组件(侧栏、题单、Quiz、终章总表)共用这一个 context,别自己另存一份。

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ChapterId } from "@/lib/curriculum";

const KEY = "dd-progress-v1";

export interface ProgressData {
  problems: Record<string, 1>;
  quiz: Partial<Record<ChapterId, { right: number; total: number }>>;
}

const EMPTY: ProgressData = { problems: {}, quiz: {} };

interface Ctx {
  ready: boolean;
  data: ProgressData;
  isDone: (pid: string) => boolean;
  toggleProblem: (pid: string) => void;
  reportQuiz: (ch: ChapterId, right: number, total: number) => void;
  chapterState: (ch: ChapterId) => "new" | "doing" | "done";
  problemCount: (ch: ChapterId) => number;
  totalProblems: number;
  reset: () => void;
}

const ProgressContext = createContext<Ctx>({
  ready: false,
  data: EMPTY,
  isDone: () => false,
  toggleProblem: () => {},
  reportQuiz: () => {},
  chapterState: () => "new",
  problemCount: () => 0,
  totalProblems: 0,
  reset: () => {},
});

function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      problems: parsed.problems ?? {},
      quiz: parsed.quiz ?? {},
    };
  } catch {
    return EMPTY;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressData) => {
    setData(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* 私密模式等写入失败:仅内存态 */
    }
  }, []);

  const isDone = useCallback((pid: string) => !!data.problems[pid], [data]);

  const toggleProblem = useCallback(
    (pid: string) => {
      const problems = { ...data.problems };
      if (problems[pid]) delete problems[pid];
      else problems[pid] = 1;
      persist({ ...data, problems });
    },
    [data, persist],
  );

  const reportQuiz = useCallback(
    (ch: ChapterId, right: number, total: number) => {
      const prev = data.quiz[ch];
      // 只保留最好成绩
      if (prev && prev.right / prev.total >= right / total) return;
      persist({ ...data, quiz: { ...data.quiz, [ch]: { right, total } } });
    },
    [data, persist],
  );

  const chapterState = useCallback(
    (ch: ChapterId): "new" | "doing" | "done" => {
      const q = data.quiz[ch];
      if (q && q.total > 0 && q.right === q.total) return "done";
      if (q) return "doing";
      if (Object.keys(data.problems).some((k) => k.startsWith(ch + "/")))
        return "doing";
      return "new";
    },
    [data],
  );

  const problemCount = useCallback(
    (ch: ChapterId) =>
      Object.keys(data.problems).filter((k) => k.startsWith(ch + "/")).length,
    [data],
  );

  const reset = useCallback(() => persist(EMPTY), [persist]);

  return (
    <ProgressContext.Provider
      value={{
        ready,
        data,
        isDone,
        toggleProblem,
        reportQuiz,
        chapterState,
        problemCount,
        totalProblems: Object.keys(data.problems).length,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
