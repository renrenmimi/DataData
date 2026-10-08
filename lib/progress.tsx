"use client";

// Site-wide learning progress — persisted in localStorage.
// Two kinds of facts: (1) checked-off problems, keyed `${chapter}/${LC number}`
// (for example "array/283"); (2) the best quiz score per chapter. Chapter state
// is derived from those: new (untouched) / doing (touched) / done (perfect quiz).
// Every consumer (sidebar, problem sets, quizzes, the finale's master table)
// shares this one context — do not keep a second copy anywhere.
//
// Several tabs can be open at once, all writing the same key. So every change
// is applied to what is stored at that moment, not to this tab's copy, and a
// `storage` listener adopts what other tabs write. Writing this tab's whole
// in-memory object back would silently erase their work.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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

/** Parse a stored value; anything unreadable counts as no progress. */
function parse(raw: string | null): ProgressData {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    return {
      problems: parsed.problems ?? {},
      quiz: parsed.quiz ?? {},
    };
  } catch {
    return EMPTY;
  }
}

/** What is stored now, or null when storage cannot be read at all (some private modes). */
function read(): ProgressData | null {
  try {
    return parse(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProgressData>(EMPTY);
  const [ready, setReady] = useState(false);
  // The data handlers act on, kept in step with every state change so a
  // handler never reasons from an older render's copy
  const current = useRef<ProgressData>(EMPTY);

  const adopt = useCallback((next: ProgressData) => {
    current.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    adopt(read() ?? EMPTY);
    setReady(true);

    // Another tab wrote progress (key null means it cleared storage): show it
    // here too, so this tab never displays or rewrites stale checkmarks
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) adopt(parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [adopt]);

  // Apply a change to what is stored now. When storage cannot be read, fall
  // back to this tab's copy and stay in memory.
  const update = useCallback(
    (change: (base: ProgressData) => ProgressData) => {
      const next = change(read() ?? current.current);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* Write failed (private browsing, quota, …) — stay in-memory only */
      }
      adopt(next);
    },
    [adopt],
  );

  const isDone = useCallback((pid: string) => !!data.problems[pid], [data]);

  const toggleProblem = useCallback(
    (pid: string) => {
      // Flip what this tab shows: the learner is reacting to the checkbox in
      // front of them, whatever another tab did a moment ago
      const markDone = !current.current.problems[pid];
      update((base) => {
        const problems = { ...base.problems };
        if (markDone) problems[pid] = 1;
        else delete problems[pid];
        return { ...base, problems };
      });
    },
    [update],
  );

  const reportQuiz = useCallback(
    (ch: ChapterId, right: number, total: number) => {
      update((base) => {
        const prev = base.quiz[ch];
        // Keep only the best score
        if (prev && prev.right / prev.total >= right / total) return base;
        return { ...base, quiz: { ...base.quiz, [ch]: { right, total } } };
      });
    },
    [update],
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

  const reset = useCallback(() => update(() => EMPTY), [update]);

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
