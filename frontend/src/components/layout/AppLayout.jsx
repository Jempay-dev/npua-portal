import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

/** Shell for every page after login: top bar + sidebar + page content. */
export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app">
      <Topbar />
      <div className="app__body">
        <Sidebar />
        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Shows the page only if `allowed` is true; otherwise sends the user home. */
export function Guard({ allowed, children }) {
  return allowed ? children : <Navigate to="/" replace />;
}
