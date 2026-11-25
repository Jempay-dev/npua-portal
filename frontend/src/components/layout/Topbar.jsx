import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../data/store.js";
import { byId } from "../../data/queries.js";
import { LogoutIcon } from "../ui/Icons.jsx";

export default function Topbar() {
  const navigate = useNavigate();
  const data = useData();
  const { user, isDean, headOf, logout } = useAuth();

  const place = isDean ? "Դեկանատ" : byId(data.departments, user.departmentId)?.name;
  const role = headOf ? "Ամբիոնի վարիչ" : user.position;
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <img src="/logo.jpg" alt="" className="topbar__logo" />
        <div>
          <p className="topbar__title">Ուսումնական պորտալ</p>
          <p className="topbar__subtitle">{place}</p>
        </div>
      </div>

      <div className="topbar__user">
        <span className="avatar" aria-hidden="true">
          {initials}
        </span>
        <div className="topbar__user-text">
          <p className="topbar__name">
            {user.firstName} {user.lastName}
          </p>
          <p className="topbar__role">{role}</p>
        </div>
        <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Ելք" title="Ելք">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
