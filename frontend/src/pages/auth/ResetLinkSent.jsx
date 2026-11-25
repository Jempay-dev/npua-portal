import { Link, useNavigate } from "react-router-dom";
import { MailCheckIcon } from "../../components/auth/Icons.jsx";

export default function ResetLinkSent() {
  const navigate = useNavigate();

  return (
    <div className="auth__centered">
      <div className="success-badge">
        <MailCheckIcon />
      </div>
      <h1 className="auth__title">Ստուգեք ձեր էլ. փոստը</h1>
      <p className="auth__subtitle auth__subtitle--narrow">
        Եթե այս էլ. հասցեով հաշիվ գոյություն ունի, հրահանգներն արդեն ճանապարհին են։
      </p>

      <button type="button" className="btn-primary" onClick={() => navigate("/login")}>
        Վերադառնալ մուտքի էջ
      </button>

      <Link to="/forgot-password" className="link">
        Օգտագործել այլ էլ. հասցե
      </Link>
    </div>
  );
}
