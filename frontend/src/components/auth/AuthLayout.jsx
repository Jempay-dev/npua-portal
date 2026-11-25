import { Outlet } from "react-router-dom";

// Two-column layout shared by all auth screens:
// left = university brand panel, right = white card with the form.
export default function AuthLayout() {
  return (
    <div className="auth">
      <aside className="auth__brand" aria-label="National Polytechnic University of Armenia" />
      <main className="auth__main">
        <div className="auth__card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
