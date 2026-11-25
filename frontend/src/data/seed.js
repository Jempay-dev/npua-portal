// Builds the made-up demo database.
// A seeded random generator is used, so the data is the same on every reset.

import { ACADEMIC_YEARS, CURRENT_TERM, CURRENT_YEAR, SPECIALTIES } from "./constants.js";
import { groupSemesterNo, semesterKey } from "../utils/semester.js";

/* ------------------------------------------------------------------ */
/* Random helpers                                                      */
/* ------------------------------------------------------------------ */

function createRandom(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let random = createRandom(2026); // restarted in createSeed() so every reset gives the same data
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => Math.floor(min + random() * (max - min + 1));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const digits = (count) => Array.from({ length: count }, () => between(0, 9)).join("");

/* ------------------------------------------------------------------ */
/* Ամբիոններ and staff                                                 */
/* ------------------------------------------------------------------ */

const DEPARTMENTS = [
  { id: "d1", name: "Ծրագրային ապահովման և կիբերանվտանգության ամբիոն", headId: "t1" },
  { id: "d2", name: "Բարձրագույն մաթեմատիկայի ամբիոն", headId: "t6" },
  { id: "d3", name: "Ֆիզիկայի ամբիոն", headId: "t8" },
  { id: "d4", name: "Օտար լեզուների ամբիոն", headId: "t10" },
  { id: "d5", name: "Համակարգչային համակարգերի և ցանցերի ամբիոն", headId: "t12" },
];

const TEACHER_PERMISSIONS = ["enterGrades", "submitSheet"];

// [id, lastName, firstName, middleName, departmentId, position, email]
const TEACHERS = [
  ["t1", "Հովհաննիսյան", "Արամ", "Գագիկի", "d1", "Պրոֆեսոր", "head@polytech.am"],
  ["t2", "Մարտիրոսյան", "Լիլիթ", "Արմենի", "d1", "Դոցենտ", "teacher@polytech.am"],
  ["t3", "Գրիգորյան", "Դավիթ", "Սամվելի", "d1", "Դոցենտ", "d.grigoryan@polytech.am"],
  ["t4", "Պողոսյան", "Անահիտ", "Ռոբերտի", "d1", "Ավագ դասախոս", "a.poghosyan@polytech.am"],
  ["t5", "Սահակյան", "Տիգրան", "Վահեի", "d1", "Ասիստենտ", "t.sahakyan@polytech.am"],
  ["t6", "Ավետիսյան", "Կարեն", "Հրաչյայի", "d2", "Պրոֆեսոր", "k.avetisyan@polytech.am"],
  ["t7", "Մկրտչյան", "Նարինե", "Աշոտի", "d2", "Դոցենտ", "n.mkrtchyan@polytech.am"],
  ["t8", "Խաչատրյան", "Սուրեն", "Վարդանի", "d3", "Պրոֆեսոր", "s.khachatryan@polytech.am"],
  ["t9", "Ղազարյան", "Մարինե", "Էդուարդի", "d3", "Դոցենտ", "m.ghazaryan@polytech.am"],
  ["t10", "Բաղդասարյան", "Լուսինե", "Կարոյի", "d4", "Դոցենտ", "l.baghdasaryan@polytech.am"],
  ["t11", "Հարությունյան", "Աննա", "Սերգեյի", "d4", "Ավագ դասախոս", "a.harutyunyan@polytech.am"],
  ["t12", "Վարդանյան", "Արթուր", "Մհերի", "d5", "Պրոֆեսոր", "a.vardanyan@polytech.am"],
  ["t13", "Եղիազարյան", "Գոռ", "Արտակի", "d5", "Դոցենտ", "g.yeghiazaryan@polytech.am"],
];

function buildUsers() {
  const teachers = TEACHERS.map(([id, lastName, firstName, middleName, departmentId, position, email]) => ({
    id,
    type: "department",
    lastName,
    firstName,
    middleName,
    departmentId,
    position,
    email,
    password: "password123",
    active: true,
    activationCode: null,
    permissions: TEACHER_PERMISSIONS,
  }));

  return [
    {
      id: "u1",
      type: "dean",
      lastName: "Սարգսյան",
      firstName: "Մարիամ",
      middleName: "Հակոբի",
      departmentId: null,
      position: "Դեկան",
      email: "dean@polytech.am",
      password: "password123",
      active: true,
      activationCode: null,
      permissions: ["approveSheet", "editData", "makeSchedule", "manageAccounts"],
    },
    {
      id: "u2",
      type: "dean",
      lastName: "Թորոսյան",
      firstName: "Էլեն",
      middleName: "Գևորգի",
      departmentId: null,
      position: "Մասնագետ",
      email: "secretary@polytech.am",
      password: "password123",
      active: true,
      activationCode: null,
      permissions: ["editData"],
    },
    ...teachers,
    {
      id: "t14",
      type: "department",
      lastName: "Դանիելյան",
      firstName: "Վահե",
      middleName: "Արսենի",
      departmentId: "d1",
      position: "Ասիստենտ",
      email: "new@polytech.am",
      password: null,
      active: false,
      activationCode: "123456",
      permissions: TEACHER_PERMISSIONS,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Subjects (curriculum)                                               */
/* ------------------------------------------------------------------ */

// One list per semester of study: [name, departmentId, credits, type]
const CURRICULUM = {
  bachelor: [
    [
      ["Բարձրագույն մաթեմատիկա 1", "d2", 6, "exam"],
      ["Ֆիզիկա 1", "d3", 5, "exam"],
      ["Ծրագրավորման հիմունքներ", "d1", 6, "exam"],
      ["Անգլերեն 1", "d4", 2, "credit"],
    ],
    [
      ["Բարձրագույն մաթեմատիկա 2", "d2", 6, "exam"],
      ["Ֆիզիկա 2", "d3", 5, "exam"],
      ["Օբյեկտ կողմնորոշված ծրագրավորում", "d1", 6, "exam"],
      ["Անգլերեն 2", "d4", 2, "credit"],
    ],
    [
      ["Դիսկրետ մաթեմատիկա", "d2", 5, "exam"],
      ["Տվյալների կառուցվածքներ և ալգորիթմներ", "d1", 6, "exam"],
      ["Համակարգչային ճարտարապետություն", "d5", 5, "exam"],
      ["Անգլերեն 3", "d4", 2, "credit"],
    ],
    [
      ["Հավանականությունների տեսություն", "d2", 5, "exam"],
      ["Օպերացիոն համակարգերի հիմունքներ", "d1", 6, "exam"],
      ["Տվյալների բազաներ", "d1", 6, "exam"],
      ["Մասնագիտական անգլերեն", "d4", 2, "credit"],
    ],
    [
      ["Համակարգչային ցանցեր", "d5", 6, "exam"],
      ["Վեբ ծրագրավորում", "d1", 6, "exam"],
      ["Կրիպտոգրաֆիայի հիմունքներ", "d1", 5, "exam"],
      ["Կուրսային աշխատանք 1", "d1", 2, "credit"],
    ],
    [
      ["Ծրագրային ճարտարագիտություն", "d1", 6, "exam"],
      ["Տեղեկատվական անվտանգության հիմունքներ", "d1", 6, "exam"],
      ["Թվային մեթոդներ", "d2", 5, "exam"],
      ["Կուրսային աշխատանք 2", "d1", 2, "credit"],
    ],
    [
      ["Բաշխված համակարգեր", "d5", 6, "exam"],
      ["Մեքենայական ուսուցում", "d1", 6, "exam"],
      ["Ցանցային անվտանգություն", "d1", 5, "exam"],
      ["Արտադրական պրակտիկա", "d1", 3, "credit"],
    ],
    [
      ["Ծրագրային ապահովման թեստավորում", "d1", 6, "exam"],
      ["Ներթափանցման թեստավորում", "d1", 5, "exam"],
      ["Նախագծերի կառավարում", "d1", 4, "exam"],
      ["Նախադիպլոմային պրակտիկա", "d1", 3, "credit"],
    ],
  ],
  master: [
    [
      ["Կիբերանվտանգության ժամանակակից մեթոդներ", "d1", 6, "exam"],
      ["Ալգորիթմների վերլուծություն", "d1", 6, "exam"],
      ["Գիտական հետազոտության մեթոդներ", "d2", 4, "exam"],
      ["Ակադեմիական անգլերեն", "d4", 2, "credit"],
    ],
    [
      ["Անվտանգ ծրագրավորում", "d1", 6, "exam"],
      ["Թվային դատաբժշկություն", "d1", 6, "exam"],
      ["Ամպային համակարգերի անվտանգություն", "d5", 5, "exam"],
      ["Գիտահետազոտական աշխատանք", "d1", 3, "credit"],
    ],
  ],
};

function buildSubjects() {
  const subjects = [];
  for (const [level, semesters] of Object.entries(CURRICULUM)) {
    semesters.forEach((list, index) => {
      const semesterNo = index + 1;
      list.forEach(([name, departmentId, credits, type], i) => {
        const levelNo = level === "bachelor" ? 1 : 2;
        subjects.push({
          id: `s${subjects.length + 1}`,
          code: `${levelNo}.${String(semesterNo).padStart(2, "0")}.${departmentId.slice(1)}.${String(i + 1).padStart(3, "0")}`,
          name,
          credits,
          type,
          level,
          semesterNo,
          departmentId,
        });
      });
    });
  }
  return subjects;
}

/* ------------------------------------------------------------------ */
/* Groups and students                                                 */
/* ------------------------------------------------------------------ */

const GROUPS = [
  { id: "g1", code: "SS-111", specialtyId: "sp1", admissionYear: 2026, size: 14 },
  { id: "g2", code: "SS-211", specialtyId: "sp1", admissionYear: 2025, size: 13 },
  { id: "g3", code: "SS-311", specialtyId: "sp1", admissionYear: 2024, size: 12 },
  { id: "g4", code: "SS-411", specialtyId: "sp1", admissionYear: 2023, size: 12 },
  { id: "g5", code: "ՏԱ-211", specialtyId: "sp2", admissionYear: 2025, size: 11 },
  { id: "g6", code: "ՏԱ-311", specialtyId: "sp2", admissionYear: 2024, size: 12 },
  { id: "g7", code: "ԿԱ-Մ11", specialtyId: "sp3", admissionYear: 2026, size: 9 },
];

const MALE_NAMES = ["Արամ", "Դավիթ", "Տիգրան", "Արմեն", "Գոռ", "Նարեկ", "Հայկ", "Սամվել", "Վահե", "Էրիկ", "Մհեր", "Արթուր", "Լևոն", "Ռուբեն", "Կարեն", "Սևակ", "Արսեն", "Գևորգ", "Միքայել", "Հովհաննես"];
const FEMALE_NAMES = ["Անի", "Մարիամ", "Լիլիթ", "Նարե", "Էլեն", "Սոնա", "Աննա", "Մանե", "Լուսինե", "Արփի", "Մերի", "Տաթև", "Գայանե", "Հասմիկ", "Միլենա", "Ռուզաննա", "Նունե", "Աստղիկ", "Սյուզաննա", "Ինեսա"];
const SURNAMES = ["Աբրահամյան", "Ալեքսանյան", "Աղաջանյան", "Բաբայան", "Գալստյան", "Գասպարյան", "Դալլաքյան", "Եսայան", "Զաքարյան", "Թադևոսյան", "Իսահակյան", "Լալայան", "Խաչիկյան", "Կարապետյան", "Համբարձումյան", "Հակոբյան", "Ղուկասյան", "Մանուկյան", "Մելքոնյան", "Միրզոյան", "Նազարյան", "Ներսիսյան", "Շահինյան", "Չոբանյան", "Պետրոսյան", "Ջհանգիրյան", "Ռոստոմյան", "Սիմոնյան", "Ստեփանյան", "Տոնոյան", "Փաշինյան", "Քոչարյան", "Օհանյան", "Ֆարմանյան"];
const ADDRESSES = [
  "ք. Երևան, Կոմիտասի պող.",
  "ք. Երևան, Բաղրամյան պող.",
  "ք. Երևան, Արշակունյաց պող.",
  "ք. Երևան, Մաշտոցի պող.",
  "ք. Երևան, Դավթաշեն, 2-րդ թաղ.",
  "Կոտայքի մարզ, ք. Աբովյան, Նոր թաղ.",
  "Արարատի մարզ, ք. Արտաշատ, Օգոստոսի 23 փ.",
  "Արմավիրի մարզ, ք. Էջմիածին, Մաշտոցի փ.",
  "Շիրակի մարզ, ք. Գյումրի, Ռիժկովի փ.",
];

function buildStudents(groups) {
  const students = [];
  for (const group of groups) {
    for (let i = 0; i < group.size; i++) {
      const gender = random() < 0.55 ? "male" : "female";
      const firstName = pick(gender === "male" ? MALE_NAMES : FEMALE_NAMES);
      const birthYear = group.admissionYear - (group.level === "master" ? 22 : 18) + between(-1, 0);

      students.push({
        id: `st${students.length + 1}`,
        groupId: group.id,
        studentNo: `${group.level === "master" ? "MS" : "BS"}${group.admissionYear % 100}${digits(8)}`,
        lastName: pick(SURNAMES),
        firstName,
        middleName: `${pick(MALE_NAMES)}ի`,
        gender,
        birthDate: `${birthYear}-${String(between(1, 12)).padStart(2, "0")}-${String(between(1, 28)).padStart(2, "0")}`,
        admissionDate: `${group.admissionYear}-09-${between(10, 15)}`,
        orderNo: `01-05/${between(1900, 3400)}`,
        funding: random() < 0.45 ? "state" : "paid",
        passport: `${pick(["AL", "AS", "AV", "AN"])}0${digits(6)}`,
        phone: `+374 9${between(1, 9)} ${digits(6)}`,
        address: `${pick(ADDRESSES)} ${between(1, 120)}`,
        admissionScore: Number((55 + random() * 40).toFixed(2)),
      });
    }
  }
  return students.sort((a, b) => a.lastName.localeCompare(b.lastName, "hy"));
}

/* ------------------------------------------------------------------ */
/* Workload (teacher ↔ subject ↔ group) and grade sheets              */
/* ------------------------------------------------------------------ */

function allSemesterKeys() {
  const keys = [];
  for (const year of ACADEMIC_YEARS) {
    for (const term of [1, 2]) {
      keys.push(semesterKey(year, term));
      if (year === CURRENT_YEAR && term === CURRENT_TERM) return keys;
    }
  }
  return keys;
}

function makeRow(subject, ability, withFinal) {
  if (subject.type === "credit") {
    return withFinal ? { passed: ability + random() * 0.3 > 0.55 } : {};
  }
  const part = (max) => clamp(Math.round(max * (ability + (random() - 0.5) * 0.3)), 0, max);
  return { m1: part(20), m2: part(20), final: withFinal ? part(60) : null };
}

function buildWorkloadAndSheets(groups, students, subjects, users) {
  const assignments = [];
  const sheets = [];
  const currentKey = semesterKey(CURRENT_YEAR, CURRENT_TERM);
  const teachersOf = (departmentId) => users.filter((u) => u.departmentId === departmentId && u.active);
  const nextTeacher = {}; // round-robin per department so everyone gets some work

  // Each student gets a fixed "ability" so their grades look consistent.
  const ability = Object.fromEntries(students.map((s) => [s.id, 0.38 + random() * 0.62]));

  for (const group of groups) {
    const groupStudents = students.filter((s) => s.groupId === group.id);

    for (const key of allSemesterKeys()) {
      const semesterNo = groupSemesterNo(group, key);
      if (semesterNo < 1) continue;
      const isCurrent = key === currentKey;

      for (const subject of subjects.filter((s) => s.level === group.level && s.semesterNo === semesterNo)) {
        const teachers = teachersOf(subject.departmentId);
        const index = (nextTeacher[subject.departmentId] ?? 0) % teachers.length;
        nextTeacher[subject.departmentId] = index + 1;
        const lecturer = teachers[index];
        const labTeacher =
          subject.departmentId === "d1" && subject.type === "exam" ? teachers[(index + 1) % teachers.length] : null;

        const assignment = {
          id: `a${assignments.length + 1}`,
          semester: key,
          groupId: group.id,
          subjectId: subject.id,
          lecturerId: lecturer.id,
          labTeacherId: labTeacher?.id ?? null,
          responsibleId: lecturer.id,
        };
        assignments.push(assignment);

        // Past semesters are approved. In the current one some sheets are
        // already moving through the review steps, the rest are drafts.
        let status = "approved";
        if (isCurrent) {
          if (group.code === "SS-411") status = "dean_review";
          else if (group.code === "SS-311" && subject.departmentId === "d1") status = "head_review";
          else status = "draft";
        }
        const withFinal = status !== "draft";

        sheets.push({
          id: `sh${sheets.length + 1}`,
          assignmentId: assignment.id,
          status,
          rows: Object.fromEntries(groupStudents.map((s) => [s.id, makeRow(subject, ability[s.id], withFinal)])),
        });
      }
    }
  }
  return { assignments, sheets };
}

/* ------------------------------------------------------------------ */
/* Rooms                                                               */
/* ------------------------------------------------------------------ */

const ROOMS = [
  ["2445", 30],
  ["5404", 40],
  ["5801", 60],
  ["2234", 25],
  ["2259", 30],
  ["1104", 80],
  ["2142", 24],
  ["5602", 50],
  ["2441", 35],
  ["Ընթերցասրահ", 120],
].map(([name, capacity], i) => ({ id: `r${i + 1}`, name, capacity }));

/* ------------------------------------------------------------------ */

export function createSeed() {
  random = createRandom(2026);
  const groups = GROUPS.map(({ size, ...g }) => {
    const specialty = SPECIALTIES.find((s) => s.id === g.specialtyId);
    return { ...g, level: specialty.level, departmentId: "d1", size };
  });
  const users = buildUsers();
  const subjects = buildSubjects();
  const students = buildStudents(groups);
  const { assignments, sheets } = buildWorkloadAndSheets(groups, students, subjects, users);

  return {
    departments: DEPARTMENTS,
    users,
    subjects,
    groups: groups.map(({ size, ...g }) => g),
    students,
    rooms: ROOMS,
    assignments,
    sheets,
    schedule: {
      settings: { start: "2027-01-11", end: "2027-02-05", gapDays: 3, times: ["10:00", "15:00"] },
      items: [],
    },
  };
}
