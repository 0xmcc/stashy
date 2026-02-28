"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  getStoredView,
  saveStoredView,
  type ViewMode,
} from "../lib/viewPersistence";
export type { ViewMode } from "../lib/viewPersistence";

interface ViewContextType {
  view: ViewMode;
  setView: (view: ViewMode) => void;
}

const ViewContext = createContext<ViewContextType>({
  view: "digest",
  setView: () => {},
});

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>(() =>
    getStoredView(typeof window !== "undefined" ? window.localStorage : null)
  );

  useEffect(() => {
    saveStoredView(typeof window !== "undefined" ? window.localStorage : null, view);
  }, [view]);

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}
