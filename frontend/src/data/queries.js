// Read helpers that join the collections together.
// Every function takes `data` (from useData()) as the first argument.

import { SPECIALTIES } from "./constants.js";
import { subjectResult, semesterSummary } from "../utils/grading.js";
import { parseSemesterKey } from "../utils/semester.js";

export const byId = (list, id) => list.find((item) => item.id === id);

export const specialtyOf = (group) => SPECIALTIES.find((s) => s.id === group?.specialtyId);

const nameOrder = (a, b) =>
  a.lastName.localeCompare(b.lastName, "hy") || a.firstName.localeCompare(b.firstName, "hy");

/** Students of a group in alphabetical order. */
export const studentsOfGroup = (data, groupId) =>
  data.students.filter((s) => s.groupId === groupId).sort(nameOrder);

export const teachersOfDepartment = (data, departmentId) =>
  data.users.filter((u) => u.type === "department" && u.departmentId === departmentId);

export const isHeadOf = (data, user) => data.departments.find((d) => d.headId === user?.id) ?? null;

/** A sheet together with everything it refers to. */
export function sheetDetails(data, sheet) {
  const assignment = byId(data.assignments, sheet.assignmentId);
  const group = byId(data.groups, assignment.groupId);
  const subject = byId(data.subjects, assignment.subjectId);
  return {
    sheet,
    assignment,
    group,
    subject,
    department: byId(data.departments, subject.departmentId),
    responsible: byId(data.users, assignment.responsibleId),
    students: studentsOfGroup(data, group.id),
  };
}

export const sheetOfAssignment = (data, assignmentId) => data.sheets.find((s) => s.assignmentId === assignmentId);

/** Approved results of one group in one semester: { subjects, rows: [{ student, results, summary }] } */
export function groupProgress(data, groupId, semester) {
  const assignments = data.assignments.filter((a) => a.groupId === groupId && a.semester === semester);
  const courses = assignments.map((a) => ({
    subject: byId(data.subjects, a.subjectId),
    sheet: sheetOfAssignment(data, a.id),
  }));

  const rows = studentsOfGroup(data, groupId).map((student) => {
    const results = courses.map(({ subject, sheet }) => ({
      subject,
      result: sheet?.status === "approved" ? subjectResult(subject, sheet.rows[student.id]) : null,
    }));
    const approved = results.filter((r) => r.result);
    return { student, results, summary: approved.length ? semesterSummary(approved) : null };
  });

  return { subjects: courses.map((c) => c.subject), rows };
}

/** Every approved subject of one student, grouped by semester (oldest first). */
export function studentTranscript(data, studentId) {
  const student = byId(data.students, studentId);
  const semesters = {};

  for (const assignment of data.assignments.filter((a) => a.groupId === student.groupId)) {
    const sheet = sheetOfAssignment(data, assignment.id);
    if (sheet?.status !== "approved") continue;
    const subject = byId(data.subjects, assignment.subjectId);
    (semesters[assignment.semester] ??= []).push({ subject, result: subjectResult(subject, sheet.rows[student.id]) });
  }

  const keys = Object.keys(semesters).sort((a, b) => {
    const x = parseSemesterKey(a);
    const y = parseSemesterKey(b);
    return x.year === y.year ? x.term - y.term : x.year.localeCompare(y.year);
  });

  let allSoFar = [];
  return keys.map((key) => {
    const results = semesters[key].sort((a, b) => a.subject.code.localeCompare(b.subject.code));
    allSoFar = [...allSoFar, ...results];
    return { semester: key, results, summary: semesterSummary(results), cumulative: semesterSummary(allSoFar) };
  });
}
