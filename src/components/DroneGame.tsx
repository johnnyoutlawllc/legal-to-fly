"use client";

import { useEffect, useRef, useState } from "react";

/** Canvas mini-games for playful mode. One engine, two variants:
 *  - "zones": scrolling sectional — enter B/C/D/surface-E rings only while
 *    holding a LAANC authorization (green L token), else busted (§107.41).
 *  - "storms": thunderstorm cells cycle cumulus → mature → dissipating;
 *    only the mature stage is deadly, which is exactly the exam point.
 *  Graphics are deliberately crude; the rules are the curriculum. */

export type GameVariant = "zones" | "storms";

const W = 640;
const H = 400;

type Zone = { x: number; y: number; r: number; kind: "B" | "C" | "D" | "E"; cleared: boolean };
type Storm = { x: number; y: number; r: number; t: number };
type Token = { x: number; y: number };
type Floaty = { x: number; y: number; text: string; color: string; age: number };

const ZONE_KINDS: Array<{ kind: Zone["kind"]; color: string; dash: boolean; rMin: number; rMax: number; label: string }> = [
  { kind: "B", color: "#5b9bd5", dash: false, rMin: 70, rMax: 105, label: "Class B" },
  { kind: "C", color: "#d95fb0", dash: false, rMin: 50, rMax: 80, label: "Class C" },
  { kind: "D", color: "#5b9bd5", dash: true, rMin: 34, rMax: 54, label: "Class D" },
  { kind: "E", color: "#d95fb0", dash: true, rMin: 40, rMax: 60, label: "surface Class E" },
];

function bustLine(variant: GameVariant, detail: string) {
  return variant === "zones"
    ? `You flew into ${detail} without authorization — that's a §107.41 violation.`
    : "You flew into a mature cell — updrafts AND downdrafts in there, plus hail.";
}

export default function DroneGame({ variant }: { variant: GameVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [bustMsg, setBustMsg] = useState("");
  const bestKey = `ltf_game_${variant}_best`;

  useEffect(() => {
    try {
      const b = parseFloat(localStorage.getItem(bestKey) ?? "0");
      if (!isNaN(b)) setBest(b);
    } catch {}
  }, [bestKey]);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // world state (refs not needed — this closure lives for the whole run)
    const drone = { x: W / 2, y: H - 70, vx: 0, vy: 0 };
    const zones: Zone[] = [];
    const storms: Storm[] = [];
    const tokens: Token[] = [];
    const floaties: Floaty[] = [];
    const keys = new Set<string>();
    let auth = variant === "zones" ? 1 : 0;
    let dist = 0;
    let bonus = 0;
    let elapsed = 0;
    let spawnIn = 0.6;
    let tokenIn = 2.0;
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let alive = true;

    const toCanvas = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H,
      };
    };
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      pointer = toCanvas(e);
    };
    const onMove = (e: PointerEvent) => {
      if (pointer) pointer = toCanvas(e);
    };
    const onUp = () => {
      pointer = null;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const bust = (detail: string) => {
      alive = false;
      const miles = dist / 140 + bonus;
      setFinalScore(miles);
      setBustMsg(bustLine(variant, detail));
      try {
        const prev = parseFloat(localStorage.getItem(bestKey) ?? "0") || 0;
        if (miles > prev) {
          localStorage.setItem(bestKey, String(miles));
          setBest(miles);
        }
      } catch {}
      setPhase("over");
    };

    const spawn = () => {
      const x = 50 + Math.random() * (W - 100);
      if (variant === "zones") {
        const k = ZONE_KINDS[Math.floor(Math.random() * ZONE_KINDS.length)];
        const r = k.rMin + Math.random() * (k.rMax - k.rMin);
        zones.push({ x, y: -r - 20, r, kind: k.kind, cleared: false });
      } else {
        storms.push({ x, y: -60, r: 24 + Math.random() * 16, t: Math.random() * 1.5 });
      }
    };

    const drawDrone = () => {
      ctx.save();
      ctx.translate(drone.x, drone.y);
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 2;
      for (const [dx, dy] of [[-9, -9], [9, -9], [-9, 9], [9, 9]] as const) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx, dy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#ff6b35";
      ctx.fillRect(-5, -5, 10, 10);
      ctx.restore();
    };

    const drawStorm = (s: Storm) => {
      const stage = s.t < 2.5 ? 0 : s.t < 6.5 ? 1 : 2;
      const grow = stage === 0 ? 1 + (s.t / 2.5) * 0.2 : stage === 1 ? 1.5 : 1.4;
      const r = s.r * grow;
      const alpha = stage === 2 ? Math.max(0, 1 - (s.t - 6.5) / 3) : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = stage === 1 ? "#3d3d3d" : "#333";
      ctx.strokeStyle = stage === 1 ? "#666" : "#4a4a4a";
      for (const [dx, dy, rr] of [[-r * 0.5, r * 0.15, r * 0.55], [0, -r * 0.15, r * 0.7], [r * 0.5, r * 0.2, r * 0.5]] as const) {
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      if (stage === 1) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 8 + s.x);
        ctx.fillStyle = `rgba(248,113,113,${0.25 + 0.35 * pulse})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        if (Math.sin(elapsed * 13 + s.x * 7) > 0.55) {
          ctx.strokeStyle = "#f2d94e";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(s.x + 4, s.y + r * 0.3);
          ctx.lineTo(s.x - 4, s.y + r * 0.75);
          ctx.lineTo(s.x + 3, s.y + r * 0.75);
          ctx.lineTo(s.x - 5, s.y + r * 1.15);
          ctx.stroke();
        }
      }
      if (stage === 2) {
        ctx.strokeStyle = "rgba(111,168,220,0.6)";
        ctx.lineWidth = 1.5;
        for (const dx of [-r * 0.4, 0, r * 0.4]) {
          ctx.beginPath();
          ctx.moveTo(s.x + dx, s.y + r * 0.5);
          ctx.lineTo(s.x + dx - 3, s.y + r * 0.9);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      const speed = Math.min(220, 90 + elapsed * 4);

      // input
      const acc = 1000;
      if (keys.has("arrowleft") || keys.has("a")) drone.vx -= acc * dt;
      if (keys.has("arrowright") || keys.has("d")) drone.vx += acc * dt;
      if (keys.has("arrowup") || keys.has("w")) drone.vy -= acc * dt;
      if (keys.has("arrowdown") || keys.has("s")) drone.vy += acc * dt;
      if (pointer) {
        drone.vx += (pointer.x - drone.x) * 14 * dt;
        drone.vy += (pointer.y - drone.y) * 14 * dt;
      }
      const damp = Math.max(0, 1 - 3.2 * dt);
      drone.vx *= damp;
      drone.vy *= damp;
      const vmax = 280;
      const v = Math.hypot(drone.vx, drone.vy);
      if (v > vmax) {
        drone.vx = (drone.vx / v) * vmax;
        drone.vy = (drone.vy / v) * vmax;
      }
      drone.x = Math.max(14, Math.min(W - 14, drone.x + drone.vx * dt));
      drone.y = Math.max(14, Math.min(H - 14, drone.y + drone.vy * dt));

      // spawns
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawn();
        spawnIn = variant === "zones" ? 1.0 + Math.random() * 0.8 : 0.9 + Math.random() * 0.8;
      }
      tokenIn -= dt;
      if (tokenIn <= 0) {
        tokens.push({ x: 40 + Math.random() * (W - 80), y: -20 });
        tokenIn = variant === "zones" ? 2.6 + Math.random() * 1.6 : 3.2 + Math.random() * 2;
      }

      // scroll
      dist += speed * dt;
      for (const z of zones) z.y += speed * dt;
      for (const s of storms) {
        s.y += speed * dt * 0.85;
        s.t += dt;
      }
      for (const t of tokens) t.y += speed * dt;
      for (const f of floaties) {
        f.y -= 30 * dt;
        f.age += dt;
      }
      while (zones.length && zones[0].y - zones[0].r > H + 40) zones.shift();
      while (storms.length && (storms[0].y - storms[0].r * 1.6 > H + 40 || storms[0].t > 9.5)) storms.shift();
      while (tokens.length && tokens[0].y > H + 30) tokens.shift();
      while (floaties.length && floaties[0].age > 1.2) floaties.shift();

      // collisions
      for (let i = tokens.length - 1; i >= 0; i--) {
        const t = tokens[i];
        if (Math.hypot(t.x - drone.x, t.y - drone.y) < 24) {
          tokens.splice(i, 1);
          if (variant === "zones") {
            auth = Math.min(3, auth + 1);
            floaties.push({ x: t.x, y: t.y, text: "+LAANC", color: "#34d399", age: 0 });
          } else {
            bonus += 0.5;
            floaties.push({ x: t.x, y: t.y, text: "+0.5 mi", color: "#f2d94e", age: 0 });
          }
        }
      }
      if (variant === "zones") {
        for (const z of zones) {
          if (z.cleared) continue;
          if (Math.hypot(z.x - drone.x, z.y - drone.y) < z.r + 6) {
            const label = ZONE_KINDS.find((k) => k.kind === z.kind)?.label ?? "controlled airspace";
            if (auth > 0) {
              auth--;
              z.cleared = true;
              floaties.push({ x: drone.x, y: drone.y - 20, text: "LAANC ✓", color: "#34d399", age: 0 });
            } else {
              bust(label);
              return;
            }
          }
        }
      } else {
        for (const s of storms) {
          const stage = s.t < 2.5 ? 0 : s.t < 6.5 ? 1 : 2;
          if (stage === 1 && Math.hypot(s.x - drone.x, s.y - drone.y) < s.r * 1.35 + 6) {
            bust("");
            return;
          }
        }
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0d0f0d";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      const off = (dist % 64);
      for (let y = off - 64; y < H; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let x = 32; x < W; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      if (variant === "zones") {
        for (const z of zones) {
          const k = ZONE_KINDS.find((kk) => kk.kind === z.kind)!;
          ctx.save();
          ctx.strokeStyle = z.cleared ? "#34d399" : k.color;
          ctx.fillStyle = z.cleared ? "rgba(52,211,153,0.05)" : `${k.color}18`;
          ctx.lineWidth = 3;
          if (k.dash) ctx.setLineDash([9, 7]);
          ctx.beginPath();
          ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = z.cleared ? "#34d399" : k.color;
          ctx.font = "bold 13px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText(z.cleared ? "✓" : z.kind, z.x, z.y + 5);
          ctx.beginPath();
          ctx.arc(z.x, z.y + 14, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        for (const t of tokens) {
          ctx.fillStyle = "#34d399";
          ctx.beginPath();
          ctx.arc(t.x, t.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0a0a0a";
          ctx.font = "bold 12px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText("L", t.x, t.y + 4);
        }
      } else {
        for (const t of tokens) {
          ctx.fillStyle = "#f2d94e";
          ctx.beginPath();
          ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0a0a0a";
          ctx.font = "bold 11px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText("☀", t.x, t.y + 4);
        }
        for (const s of storms) drawStorm(s);
      }

      drawDrone();

      for (const f of floaties) {
        ctx.globalAlpha = Math.max(0, 1 - f.age / 1.2);
        ctx.fillStyle = f.color;
        ctx.font = "bold 13px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(f.text, f.x, f.y);
        ctx.globalAlpha = 1;
      }

      // HUD
      const miles = dist / 140 + bonus;
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "bold 15px ui-monospace, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${miles.toFixed(1)} mi`, 12, 24);
      if (variant === "zones") {
        for (let i = 0; i < auth; i++) {
          ctx.fillStyle = "#34d399";
          ctx.beginPath();
          ctx.arc(24 + i * 26, 44, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0a0a0a";
          ctx.font = "bold 10px ui-monospace, monospace";
          ctx.textAlign = "center";
          ctx.fillText("L", 24 + i * 26, 47.5);
        }
      }

      if (alive) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase, variant, bestKey]);

  const title = variant === "zones" ? "Zone Dodger" : "Storm Chaser";
  const rules =
    variant === "zones"
      ? "Grab green L tokens (LAANC authorizations), then you may punch through a ring — each pass burns one. Hit any ring empty-handed and the FAA ends your day. You launch with one."
      : "Cells grow from harmless cumulus into red, sparking MATURE monsters — those are the only ones that kill you — then fizzle out. Grab ☀ for bonus miles.";

  return (
    <div className="relative select-none overflow-hidden rounded-lg border border-[var(--border)] bg-black">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="block w-full"
        style={{ touchAction: "none" }}
      />
      {phase !== "playing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
          {phase === "over" ? (
            <>
              <p className="text-2xl font-bold text-[var(--wrong)]">BUSTED</p>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">{bustMsg}</p>
              <p className="text-lg font-semibold">
                {finalScore.toFixed(1)} mi{" "}
                <span className="text-sm font-normal text-[var(--muted)]">· best {best.toFixed(1)} mi</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight">{title}</p>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">{rules}</p>
              <p className="text-xs text-[var(--muted)]">Arrow keys / WASD, or drag on the map.{best > 0 ? ` Best: ${best.toFixed(1)} mi.` : ""}</p>
            </>
          )}
          <button
            onClick={() => setPhase("playing")}
            className="mt-1 inline-flex h-11 items-center rounded-lg bg-[var(--accent)] px-6 font-medium text-black transition-opacity hover:opacity-90"
          >
            {phase === "over" ? "Fly again" : "Launch"}
          </button>
        </div>
      )}
    </div>
  );
}
