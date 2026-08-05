"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { InstructorId } from "./instructors";

const KEY = "ltf_instructor_v1";

const VALID: InstructorId[] = ["commander", "outlaw", "ace", "uncle", "cat"];

type Ctx = {
  instructor: InstructorId | null;
  setInstructor: (id: InstructorId | null) => void;
  ready: boolean;
};

const InstructorCtx = createContext<Ctx>({
  instructor: null,
  setInstructor: () => {},
  ready: false,
});

export function InstructorProvider({ children }: { children: React.ReactNode }) {
  const [instructor, set] = useState<InstructorId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s && (VALID as string[]).includes(s)) set(s as InstructorId);
      else if (s === "solo" || s === "") set(null);
    } catch {}
    setReady(true);
  }, []);

  const setInstructor = (id: InstructorId | null) => {
    set(id);
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.setItem(KEY, "solo");
    } catch {}
  };

  return (
    <InstructorCtx.Provider value={{ instructor, setInstructor, ready }}>
      {children}
    </InstructorCtx.Provider>
  );
}

export const useInstructor = () => useContext(InstructorCtx);
