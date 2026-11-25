// Sidebar menu. Which items a user sees depends on their type and permissions.

import {
  BookIcon,
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  DoorIcon,
  GroupIcon,
  HomeIcon,
  LinkIcon,
  SheetIcon,
  StudentIcon,
  UserCogIcon,
} from "../ui/Icons.jsx";

const DEAN_MENU = [
  { to: "/", label: "Գլխավոր", icon: HomeIcon },
  { section: "Տվյալներ" },
  { to: "/students", label: "Ուսանողներ", icon: StudentIcon },
  { to: "/groups", label: "Խմբեր", icon: GroupIcon },
  { to: "/subjects", label: "Առարկաներ", icon: BookIcon },
  { to: "/departments", label: "Ամբիոններ", icon: BuildingIcon },
  { to: "/rooms", label: "Դասասենյակներ", icon: DoorIcon },
  { to: "/workload", label: "Բեռնվածություն", icon: LinkIcon },
  { section: "Քննություններ" },
  { to: "/sheets", label: "Տեղեկագրեր", icon: SheetIcon },
  { to: "/progress", label: "Առաջադիմություն", icon: ChartIcon },
  { to: "/schedule", label: "Քննատախտակ", icon: CalendarIcon, permission: "makeSchedule" },
  { section: "Կառավարում", permission: "manageAccounts" },
  { to: "/users", label: "Օգտատերեր", icon: UserCogIcon, permission: "manageAccounts" },
];

const DEPARTMENT_MENU = [
  { to: "/", label: "Իմ առարկաները", icon: BookIcon },
  { to: "/department", label: "Ամբիոն", icon: BuildingIcon, headOnly: true },
];

export function menuFor({ isDean, headOf, can }) {
  const menu = isDean ? DEAN_MENU : DEPARTMENT_MENU;
  return menu.filter((item) => {
    if (item.permission && !can(item.permission)) return false;
    if (item.headOnly && !headOf) return false;
    return true;
  });
}
