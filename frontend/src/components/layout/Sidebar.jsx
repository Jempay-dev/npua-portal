import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { menuFor } from "./navigation.js";

export default function Sidebar() {
  const auth = useAuth();

  return (
    <nav className="sidebar" aria-label="Գլխավոր մենյու">
      {menuFor(auth).map((item) =>
        item.section ? (
          <p key={item.section} className="sidebar__section">
            {item.section}
          </p>
        ) : (
          <NavLink key={item.to} to={item.to} end={item.to === "/"} className="sidebar__link">
            <item.icon />
            {item.label}
          </NavLink>
        )
      )}
    </nav>
  );
}
