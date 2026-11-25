// Who can see / edit / move a grade sheet (տեղեկագիր), step by step:
//
//   draft        → the responsible teacher (or the վարիչ) fills in grades
//   head_review  → the ամբիոնի վարիչ checks it, can fix it, sends it on or back
//   dean_review  → the դեկանատ checks it, can fix it, approves it
//   approved     → final, read-only, counted in առաջադիմություն

export function sheetAccess(auth, { sheet, assignment, subject }) {
  const { user, can, headOf } = auth;
  const isDean = user.type === "dean";
  const isHead = headOf?.id === subject.departmentId;
  const isResponsible = assignment.responsibleId === user.id;
  const teachesIt = [assignment.lecturerId, assignment.labTeacherId, assignment.responsibleId].includes(user.id);
  const status = sheet.status;

  const canEdit =
    (status === "draft" && (isResponsible || isHead) && can("enterGrades")) ||
    (status === "head_review" && isHead && can("enterGrades")) ||
    (status === "dean_review" && isDean && can("approveSheet"));

  // The main "next step" button.
  let nextStep = null;
  if (status === "draft" && (isResponsible || isHead) && can("submitSheet")) {
    nextStep = isHead
      ? { label: "Ուղարկել դեկանատ", status: "dean_review" }
      : { label: "Ուղարկել ամբիոնի վարիչին", status: "head_review" };
  } else if (status === "head_review" && isHead) {
    nextStep = { label: "Հաստատել և ուղարկել դեկանատ", status: "dean_review" };
  } else if (status === "dean_review" && isDean && can("approveSheet")) {
    nextStep = { label: "Հաստատել տեղեկագիրը", status: "approved" };
  }

  return {
    canView: isDean || isHead || teachesIt,
    canEdit,
    nextStep,
    canReturn: status === "head_review" && isHead, // send back to the teacher
  };
}
