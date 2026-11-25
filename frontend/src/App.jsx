import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import AuthLayout from "./components/auth/AuthLayout.jsx";
import AppLayout, { Guard } from "./components/layout/AppLayout.jsx";

// Login screens
import SignIn from "./pages/auth/SignIn.jsx";
import ActivateAccount from "./pages/auth/ActivateAccount.jsx";
import CreatePassword from "./pages/auth/CreatePassword.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetLinkSent from "./pages/auth/ResetLinkSent.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// Դեկանատ
import DeanHome from "./pages/dean/DeanHome.jsx";
import StudentsPage from "./pages/dean/StudentsPage.jsx";
import GroupsPage from "./pages/dean/GroupsPage.jsx";
import SubjectsPage from "./pages/dean/SubjectsPage.jsx";
import DepartmentsPage from "./pages/dean/DepartmentsPage.jsx";
import RoomsPage from "./pages/dean/RoomsPage.jsx";
import WorkloadPage from "./pages/dean/WorkloadPage.jsx";
import SheetsPage from "./pages/dean/SheetsPage.jsx";
import ProgressPage from "./pages/dean/ProgressPage.jsx";
import TranscriptPage from "./pages/dean/TranscriptPage.jsx";
import SchedulePage from "./pages/dean/SchedulePage.jsx";
import UsersPage from "./pages/dean/UsersPage.jsx";

// Ամբիոն
import TeacherHome from "./pages/department/TeacherHome.jsx";
import DepartmentPage from "./pages/department/DepartmentPage.jsx";

// Shared
import SheetPage from "./pages/shared/SheetPage.jsx";

export default function App() {
  const { isDean, headOf, can } = useAuth();

  // Wraps a page so only the դեկանատ (optionally with a permission) can open it.
  const dean = (page, permission) => <Guard allowed={isDean && (!permission || can(permission))}>{page}</Guard>;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<SignIn />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/activate/password" element={<CreatePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/sent" element={<ResetLinkSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={isDean ? <DeanHome /> : <TeacherHome />} />
        <Route path="/sheets/:id" element={<SheetPage />} />

        <Route path="/students" element={dean(<StudentsPage />)} />
        <Route path="/students/:id/transcript" element={dean(<TranscriptPage />)} />
        <Route path="/groups" element={dean(<GroupsPage />)} />
        <Route path="/subjects" element={dean(<SubjectsPage />)} />
        <Route path="/departments" element={dean(<DepartmentsPage />)} />
        <Route path="/rooms" element={dean(<RoomsPage />)} />
        <Route path="/workload" element={dean(<WorkloadPage />)} />
        <Route path="/sheets" element={dean(<SheetsPage />)} />
        <Route path="/progress" element={dean(<ProgressPage />)} />
        <Route path="/schedule" element={dean(<SchedulePage />, "makeSchedule")} />
        <Route path="/users" element={dean(<UsersPage />, "manageAccounts")} />

        <Route path="/department" element={<Guard allowed={Boolean(headOf)}><DepartmentPage /></Guard>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
