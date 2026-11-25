// Everything about grades lives here.
// Each subject: midterm 1 (0–20) + midterm 2 (0–20) + final (0–60) = 100.
// Ստուգարք subjects are only passed / not passed.

export const MAX = { m1: 20, m2: 20, final: 60 };
export const PASS_SCORE = 50;

// TEMPORARY scale, guessed from the transcript photo.
// Replace with the official table later; nothing else needs to change.
export const GRADE_SCALE = [
  { min: 91, letter: "A", points: 4.0 },
  { min: 86, letter: "B.", points: 3.7 },
  { min: 81, letter: "B", points: 3.3 },
  { min: 76, letter: "B", points: 3.0 },
  { min: 71, letter: "B", points: 2.7 },
  { min: 61, letter: "C", points: 2.3 },
  { min: 56, letter: "D", points: 2.0 },
  { min: 50, letter: "E", points: 1.7 },
  { min: 0, letter: "F", points: 0 },
];

const isNumber = (v) => typeof v === "number" && !Number.isNaN(v);

/** Total score of an exam row, or null if any part is missing. */
export function totalScore(row) {
  if (!row || !isNumber(row.m1) || !isNumber(row.m2) || !isNumber(row.final)) return null;
  return row.m1 + row.m2 + row.final;
}

/** { letter, points } for a total score. */
export function gradeFor(total) {
  return GRADE_SCALE.find((g) => total >= g.min);
}

/**
 * Result of one student in one subject.
 * Returns { type, total, letter, points, passed, complete }.
 */
export function subjectResult(subject, row) {
  if (subject.type === "credit") {
    const complete = typeof row?.passed === "boolean";
    return { type: "credit", complete, passed: row?.passed === true, label: complete ? (row.passed ? "S" : "U") : "—" };
  }
  const total = totalScore(row);
  if (total === null) return { type: "exam", complete: false, passed: false, label: "—" };
  const { letter, points } = gradeFor(total);
  return {
    type: "exam",
    complete: true,
    total,
    letter,
    points,
    passed: total >= PASS_SCORE,
    label: `${letter}(${total})`,
  };
}

/**
 * Semester summary for one student.
 * `results` = [{ subject, result }] for that semester.
 * ՄՈԳ = credit-weighted average of grade points (ստուգարք subjects are not counted).
 */
export function semesterSummary(results) {
  const graded = results.filter((r) => r.subject.type === "exam" && r.result.complete);
  const totalCredits = results.reduce((sum, r) => sum + r.subject.credits, 0);
  const qualityCredits = graded.reduce((sum, r) => sum + r.subject.credits, 0);
  const weightedScore = graded.reduce((sum, r) => sum + r.subject.credits * r.result.total, 0);
  const weightedPoints = graded.reduce((sum, r) => sum + r.subject.credits * r.result.points, 0);

  return {
    totalCredits,
    qualityCredits,
    weightedScore,
    averageScore: qualityCredits ? weightedScore / qualityCredits : 0,
    gpa: qualityCredits ? weightedPoints / qualityCredits : 0,
    category: progressCategory(results.map((r) => r.result)),
    hasDebt: results.some((r) => !r.result.passed),
  };
}

// Առաջադիմություն categories (to be confirmed with the lecturer).
export const CATEGORIES = ["Գերազանց", "Լավ և Գերազանց", "Խառը", "Բավարար", "Անբավարար"];

export function progressCategory(results) {
  if (results.length === 0) return "—";
  if (results.some((r) => !r.passed)) return "Անբավարար";

  const letters = results.filter((r) => r.type === "exam").map((r) => r.letter[0]);
  if (letters.length === 0) return "Գերազանց";
  if (letters.every((l) => l === "A")) return "Գերազանց";
  if (letters.every((l) => l === "A" || l === "B")) return "Լավ և Գերազանց";
  if (letters.every((l) => l === "C" || l === "D" || l === "E")) return "Բավարար";
  return "Խառը";
}

export const formatNumber = (n, digits = 2) => (isNumber(n) ? n.toFixed(digits) : "—");
