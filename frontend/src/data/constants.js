// Fixed values used across the whole site.

// The semester "today" (Nov 2026). Lists use it as the default filter.
export const CURRENT_YEAR = "2026-2027";
export const CURRENT_TERM = 1;

export const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

export const LEVELS = {
  bachelor: { label: "Բակալավր", short: "Բ" },
  master: { label: "Մագիստրոս", short: "Մ" },
};

export const SPECIALTIES = [
  {
    id: "sp1",
    code: "061102.00.6",
    name: "Ծրագրային ճարտարագիտություն",
    level: "bachelor",
    qualification: "Ինֆորմատիկայի բակալավր",
  },
  {
    id: "sp2",
    code: "061104.00.6",
    name: "Տեղեկատվական անվտանգություն",
    level: "bachelor",
    qualification: "Ինֆորմատիկայի բակալավր",
  },
  {
    id: "sp3",
    code: "061104.00.7",
    name: "Կիբերանվտանգություն",
    level: "master",
    qualification: "Ինֆորմատիկայի մագիստրոս",
  },
];

export const SUBJECT_TYPES = {
  exam: "Քննություն",
  credit: "Ստուգարք",
};

export const FUNDING = {
  state: { label: "Պետպատվեր", short: "Պ" },
  paid: { label: "Վճարովի", short: "Վ" },
};

export const GENDERS = {
  male: "Արական",
  female: "Իգական",
};

export const USER_TYPES = {
  dean: "Դեկանատ",
  department: "Ամբիոն",
};

// Permissions the դեկանատ can give to each account.
export const PERMISSIONS = {
  enterGrades: "Գնահատականների մուտքագրում",
  submitSheet: "Տեղեկագրի ուղարկում",
  approveSheet: "Տեղեկագրի հաստատում",
  editData: "Ուսանողների և ուսումնական տվյալների խմբագրում",
  makeSchedule: "Քննատախտակի կազմում",
  manageAccounts: "Հաշիվների ստեղծում և կառավարում",
};

// Ведомость (քննական տեղեկագիր) life cycle:
// draft → head_review (ամբիոնի վարիչ) → dean_review (դեկանատ) → approved
export const SHEET_STATUS = {
  draft: { label: "Սևագիր", tone: "neutral" },
  head_review: { label: "Վարիչի մոտ", tone: "warning" },
  dean_review: { label: "Դեկանատում", tone: "info" },
  approved: { label: "Հաստատված", tone: "success" },
};

export const POSITIONS = ["Պրոֆեսոր", "Դոցենտ", "Ավագ դասախոս", "Ասիստենտ", "Մասնագետ"];
