"use client";

import { useEffect, useState } from "react";

/** Read-aloud on the browser's own speech engine (Web Speech API). Free, no
 *  network, and the voices are whatever the device has installed. */

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** English voices, best guesses first. Voices load asynchronously in Chrome,
 *  so this listens for `voiceschanged`. */
export function useVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => setVoices(rankVoices(window.speechSynthesis.getVoices()));
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return voices;
}

function rankVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|premium|enhanced/i.test(v.name) ? 4 : 0) +
    (/google|samantha|aria|jenny|guy/i.test(v.name) ? 2 : 0) +
    (v.lang === "en-US" ? 1 : 0);
  return all.filter((v) => v.lang.toLowerCase().startsWith("en")).sort((a, b) => score(b) - score(a));
}

/** Aviation shorthand a speech engine would mangle. Order matters: longer
 *  tokens before the ones they contain. */
const SAY: [RegExp, string][] = [
  [/\bsUAS\b/g, "small U A S"],
  [/\bUAS\b/g, "U A S"],
  [/\bUA\b/g, "U A"],
  [/\bRPIC\b/g, "remote P I C"],
  [/\bPIC\b/g, "P I C"],
  [/\bCFR\b/g, "C F R"],
  [/\bAGL\b/g, "A G L"],
  [/\bMSL\b/g, "M S L"],
  [/\bCTAF\b/g, "C TAF"],
  [/\bMOA\b/g, "M O A"],
  [/\bTFR\b/g, "T F R"],
  [/\bACS\b/g, "A C S"],
  [/(\d)\s?SM\b/g, "$1 statute miles"],
  [/(\d)\s?NM\b/g, "$1 nautical miles"],
  [/°/g, " degrees"],
  [/§/g, "section "],
];

export function forSpeech(text: string): string {
  return SAY.reduce((t, [re, to]) => t.replace(re, to), text);
}

/** Speak a list of passages in order. Long text is split into sentences
 *  because Chrome silently stops a single utterance after about 15 seconds.
 *  Calls `onDone` once, when the last sentence ends or speech fails. */
export function speak(
  passages: string[],
  { voice, rate }: { voice?: SpeechSynthesisVoice; rate: number },
  onDone: () => void,
): void {
  if (!speechSupported()) return onDone();
  const synth = window.speechSynthesis;
  synth.cancel();
  const sentences = passages
    .flatMap((p) => forSpeech(p).split(/(?<=[.?!])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return onDone();
  let finished = false;
  // Some engines never fire onend (no voices installed, tab backgrounded).
  // Give up after roughly twice the expected reading time so callers waiting
  // on speech are never stuck.
  const words = sentences.join(" ").split(/\s+/).length;
  const fallback = setTimeout(() => done(), ((words / 2.5) * 2) / rate * 1000 + 4000);
  const done = () => {
    if (!finished) {
      finished = true;
      clearTimeout(fallback);
      onDone();
    }
  };
  sentences.forEach((s, i) => {
    const u = new SpeechSynthesisUtterance(s);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = rate;
    if (i === sentences.length - 1) u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}

export function pauseSpeaking(paused: boolean): void {
  if (!speechSupported()) return;
  if (paused) window.speechSynthesis.pause();
  else window.speechSynthesis.resume();
}
