import React from "react";
import LessonFigure from "./LessonFigures";
import LessonCheck from "./LessonCheck";
import LessonGame from "./LessonGame";

/** Renders the constrained markdown used by ground-school lessons: ##/###
 *  headings, paragraphs, -/1. lists (with indented continuations), pipe
 *  tables, fenced code blocks, and `code` / **bold** / *italic* inlines.
 *  Two interactive block types on top: `::fig <name> | caption` renders a
 *  diagram from LessonFigures, and `::check ... ::` renders a tap-to-answer
 *  knowledge check (correct choice marked with a trailing *).
 *  Not a general markdown engine; lesson bodies are authored to fit it. */

function inline(text: string, key = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let k = key;
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)/;
  while (rest.length) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(
        <code
          key={k++}
          className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--accent)]"
        >
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("**")) {
      out.push(
        <strong key={k++} className="font-semibold text-[var(--text)]">
          {inline(tok.slice(2, -2), k * 100)}
        </strong>
      );
    } else {
      out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

type Block =
  | { t: "h2" | "h3" | "p"; text: string }
  | { t: "code"; lines: string[] }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "table"; rows: string[][] }
  | { t: "fig"; name: string; caption?: string }
  | { t: "game"; name: string; caption?: string }
  | { t: "check"; q: string; choices: string[]; correct: number; why: string };

function parse(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("::fig ") || line.startsWith("::game ")) {
      const t = line.startsWith("::fig ") ? ("fig" as const) : ("game" as const);
      const [name, caption] = line
        .slice(t === "fig" ? 6 : 7)
        .split("|")
        .map((s) => s.trim());
      blocks.push({ t, name, caption });
      i++;
      continue;
    }
    if (line.startsWith("::check")) {
      i++;
      let q = "";
      let why = "";
      let correct = 0;
      const choices: string[] = [];
      while (i < lines.length && lines[i].trim() !== "::") {
        const l = lines[i].trim();
        if (l.startsWith("Q:")) q = l.slice(2).trim();
        else if (l.startsWith("Why:")) why = l.slice(4).trim();
        else if (l.startsWith("- ")) {
          let c = l.slice(2).trim();
          if (c.endsWith("*")) {
            correct = choices.length;
            c = c.slice(0, -1).trim();
          }
          choices.push(c);
        } else if (why && l) why += " " + l;
        else if (q && l) q += " " + l;
        i++;
      }
      i++; // closing ::
      if (q && choices.length) blocks.push({ t: "check", q, choices, correct, why });
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push({ t: "code", lines: code });
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ t: "h3", text: line.slice(4) });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ t: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.trimStart().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ t: "table", rows });
      continue;
    }
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d/.test(li[2]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m) {
          items.push(m[3]);
          i++;
          // continuation lines: indented, not blank, not a new item
          while (
            i < lines.length &&
            lines[i].trim() &&
            /^\s+/.test(lines[i]) &&
            !lines[i].match(/^(\s*)([-*]|\d+\.)\s+/)
          ) {
            items[items.length - 1] += " " + lines[i].trim();
            i++;
          }
        } else break;
      }
      blocks.push({ t: ordered ? "ol" : "ul", items });
      continue;
    }
    // paragraph: gather until blank line or new block marker
    const para: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("::") &&
      !lines[i].startsWith("```") &&
      !lines[i].trimStart().startsWith("|") &&
      !lines[i].match(/^(\s*)([-*]|\d+\.)\s+/)
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ t: "p", text: para.join(" ") });
  }
  return blocks;
}

export default function LessonBody({ md }: { md: string }) {
  const blocks = parse(md);
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "fig":
            return <LessonFigure key={i} name={b.name} caption={b.caption} />;
          case "game":
            return <LessonGame key={i} name={b.name} intro={b.caption} />;
          case "check":
            return (
              <LessonCheck
                key={i}
                q={b.q}
                choices={b.choices}
                correct={b.correct}
                why={b.why}
              />
            );
          case "h2":
            return (
              <h2 key={i} className="pt-4 text-xl font-semibold tracking-tight">
                {inline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-lg font-semibold tracking-tight">
                {inline(b.text)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="leading-7 text-[var(--muted)]">
                {inline(b.text)}
              </p>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-sm leading-6"
              >
                {b.lines.join("\n")}
              </pre>
            );
          case "ul":
          case "ol": {
            const Tag = b.t;
            return (
              <Tag
                key={i}
                className={`space-y-2 pl-5 leading-7 text-[var(--muted)] ${
                  b.t === "ul" ? "list-disc" : "list-decimal"
                }`}
              >
                {b.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div key={i} className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {b.rows[0]?.map((c, j) => (
                        <th
                          key={j}
                          className="border-b border-[var(--border)] px-3 py-2 text-left font-semibold"
                        >
                          {inline(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.slice(1).map((row, j) => (
                      <tr key={j}>
                        {row.map((c, m) => (
                          <td
                            key={m}
                            className="border-b border-[var(--border)] px-3 py-2 align-top leading-6 text-[var(--muted)]"
                          >
                            {inline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
