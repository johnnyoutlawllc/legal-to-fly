/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const cache = new Map();

function load(source) {
  const file = path.join(root, "src", `${source}.ts`);
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  }).outputText;
  const localRequire = (name) =>
    name.startsWith("@/") ? load(name.slice(2)) : require(name);
  new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { buildExamSession } = load("lib/session");
const { areaFromElement } = load("lib/types");
const {
  EXAM_FIGURE_QUESTIONS,
  EXAM_CALCULATION_QUESTIONS,
  EXAM_SCENARIO_QUESTIONS,
} = load("content/exam-figure-questions");

const expected = { I: 12, II: 12, III: 8, IV: 5, V: 23 };
const categories = [
  [EXAM_FIGURE_QUESTIONS, 5],
  [EXAM_CALCULATION_QUESTIONS, 3],
  [EXAM_SCENARIO_QUESTIONS, 2],
];
const bank = Object.keys(expected).flatMap((area) =>
  Array.from({ length: 50 }, (_, index) => ({
    id: `bank-${area}-${index}`,
    acs_element_code: `UA.${area}.A.K1`,
  })),
);
const signatures = new Set();

for (let run = 0; run < 200; run++) {
  const exam = buildExamSession(bank);
  assert.equal(exam.length, 60);
  assert.equal(new Set(exam.map((question) => question.id)).size, 60);
  for (const [area, count] of Object.entries(expected)) {
    assert.equal(exam.filter((question) => areaFromElement(question.acs_element_code) === area).length, count);
  }
  for (const [questions, count] of categories) {
    const ids = new Set(questions.map((question) => question.id));
    assert.equal(exam.filter((question) => ids.has(question.id)).length, count);
  }
  signatures.add(exam.filter((question) => question.id.startsWith("10000000-")).map((question) => question.id).sort().join(","));
}

assert.ok(signatures.size > 100, `Expected varied applied questions, saw ${signatures.size} sets`);
console.log(`200 mock exams checked; ${signatures.size} distinct applied-question sets`);
