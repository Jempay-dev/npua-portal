// Helpers for academic years and semesters.
// A semester is identified by a key like "2026-2027/1".

export const semesterKey = (year, term) => `${year}/${term}`;

export function parseSemesterKey(key) {
  const [year, term] = key.split("/");
  return { year, term: Number(term) };
}

export const termLabel = (term) => (term === 1 ? "1-ին կիսամյակ" : "2-րդ կիսամյակ");

export function semesterLabel(key) {
  const { year, term } = parseSemesterKey(key);
  return `${year} · ${termLabel(term)}`;
}

/** Which semester of study (1, 2, 3…) a group is in, for a given semester key. */
export function groupSemesterNo(group, key) {
  const { year, term } = parseSemesterKey(key);
  const startYear = Number(year.slice(0, 4));
  return (startYear - group.admissionYear) * 2 + term;
}

/** Course (1-ին, 2-րդ…) of a group in a given academic year. */
export function groupCourse(group, year) {
  return Number(year.slice(0, 4)) - group.admissionYear + 1;
}

export const courseLabel = (course) => (course === 1 ? "1-ին կուրս" : `${course}-րդ կուրս`);
