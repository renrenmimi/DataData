// The home-page morph only cycles while it can be seen and has not been
// paused, and readers who prefer reduced motion start paused.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { HeroMorph } from "@/app/home-viz";

let report: (visible: boolean) => void = () => {};

class FakeIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    report = (visible) =>
      cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as never);
  }
  observe() {}
  disconnect() {}
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
  }));
}

const caption = () => document.querySelector(".hm-caption-zh")!.textContent;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  stubReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("HeroMorph", () => {
  it("changes shape every 3 seconds while it is on screen", () => {
    render(<HeroMorph />);
    act(() => report(true));
    expect(caption()).toBe("Array");
    act(() => vi.advanceTimersByTime(3000));
    expect(caption()).toBe("Linked list");
  });

  it("stops while it is off screen", () => {
    render(<HeroMorph />);
    act(() => report(false));
    act(() => vi.advanceTimersByTime(9000));
    expect(caption()).toBe("Array");
    act(() => report(true));
    act(() => vi.advanceTimersByTime(3000));
    expect(caption()).toBe("Linked list");
  });

  it("can be paused and resumed by the reader", () => {
    render(<HeroMorph />);
    act(() => report(true));
    fireEvent.click(screen.getByRole("button", { name: "Pause the shape animation" }));
    act(() => vi.advanceTimersByTime(9000));
    expect(caption()).toBe("Array");
    fireEvent.click(screen.getByRole("button", { name: "Play the shape animation" }));
    act(() => vi.advanceTimersByTime(3000));
    expect(caption()).toBe("Linked list");
  });

  it("starts paused for readers who prefer reduced motion", () => {
    stubReducedMotion(true);
    render(<HeroMorph />);
    act(() => report(true));
    expect(screen.getByRole("button", { name: "Play the shape animation" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(9000));
    expect(caption()).toBe("Array");
  });
});
