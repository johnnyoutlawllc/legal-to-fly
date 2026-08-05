"use client";

import { createContext, useContext, useEffect, useState } from "react";

/** Site-wide learning style. "serious" is the default experience; "playful"
 *  turns on mini-games in lessons and looser feedback copy. More styles
 *  (eli5, eli65) are planned — keep the union open-ended. Persisted under
 *  ltf_style_v1 so the choice survives navigation and revisits. */

export type LearningStyle = "serious" | "playful";

const KEY = "ltf_style_v1";

const Ctx = createContext<{
  style: LearningStyle;
  setStyle: (s: LearningStyle) => void;
}>({ style: "serious", setStyle: () => {} });

export function LearningStyleProvider({ children }: { children: React.ReactNode }) {
  const [style, set] = useState<LearningStyle>("serious");

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s === "playful" || s === "serious") set(s);
    } catch {}
  }, []);

  const setStyle = (s: LearningStyle) => {
    set(s);
    try {
      localStorage.setItem(KEY, s);
    } catch {}
  };

  return <Ctx.Provider value={{ style, setStyle }}>{children}</Ctx.Provider>;
}

export const useLearningStyle = () => useContext(Ctx);
