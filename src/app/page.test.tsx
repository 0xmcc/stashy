// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("../contexts/ViewContext", () => ({
  useView: () => ({ view: "twitter" }),
}));

vi.mock("../contexts/XAuthContext", () => ({
  XAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useXAuth: () => ({ checkStatus: vi.fn() }),
}));

vi.mock("../components/LeftSidebar", () => ({
  default: () => <div>LeftSidebar</div>,
}));
vi.mock("../components/TweetFeed", () => ({
  default: () => <div>TweetFeed</div>,
}));
vi.mock("../components/TweetCard", () => ({
  default: () => <div>TweetCard</div>,
}));
vi.mock("../components/FacebookCard", () => ({
  default: () => <div>FacebookCard</div>,
}));
vi.mock("../components/FacebookLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../components/SubstackLayout", () => ({
  default: () => <div>SubstackLayout</div>,
}));
vi.mock("../components/UpgradeBanner", () => ({
  default: () => <div>UpgradeBanner</div>,
}));
vi.mock("../components/PricingModal", () => ({
  default: () => null,
}));
vi.mock("../components/OnboardingModal", () => ({
  default: () => null,
}));
vi.mock("../components/ArticleReaderView", () => ({
  default: () => null,
}));
vi.mock("../components/SemanticSearch", () => ({
  default: () => <div data-testid="semantic-search">SemanticSearch</div>,
}));
vi.mock("../components/SuccessToast", () => ({
  SuccessToast: () => null,
}));
vi.mock("../components/DataSourceToggle", () => ({
  DataSourceToggle: () => <div>DataSourceToggle</div>,
}));

import Home from "./page";

describe("Home semantic search visibility", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    if (typeof localStorage?.clear === "function") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  it("shows semantic search by default and does not render a toggle button", async () => {
    await act(async () => {
      root.render(<Home />);
    });

    const semanticSearchNode = container.querySelector('[data-testid="semantic-search"]');
    const toggleButton = Array.from(container.querySelectorAll("button")).find((button) => {
      const text = button.textContent?.trim();
      return text === "Semantic Search" || text === "Close Semantic";
    });

    expect(semanticSearchNode).not.toBeNull();
    expect(toggleButton).toBeUndefined();
  });
});
