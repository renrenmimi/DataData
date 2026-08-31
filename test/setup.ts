// Adds the jest-dom matchers (toBeDisabled, toHaveAttribute, …) and their
// TypeScript augmentation to every unit test.
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only registers its own afterEach cleanup when Vitest globals
// are enabled. They are not, so unmount explicitly — otherwise each render
// leaves its tree in document.body and screen queries match several steppers.
afterEach(cleanup);
