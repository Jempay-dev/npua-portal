import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import TextField from "../../components/auth/TextField.jsx";
import { LockIcon, MailIcon } from "../../components/auth/Icons.jsx";
import { signIn } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SignIn() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const signedInUser = await signIn(form);
      login(signedInUser, form.remember);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth__header">
        <h1 className="auth__title">Բարի վերադարձ</h1>
        <p className="auth__subtitle">Մուտք գործեք ձեր համալսարանական հաշիվ</p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Էլ. հասցե"
          icon={MailIcon}
          type="email"
          placeholder="name@polytech.am"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
        />
        <TextField
          label="Գաղտնաբառ"
          icon={LockIcon}
          type="password"
          placeholder="••••••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={update("password")}
        />

        <div className="auth__row">
          <label className="checkbox">
            <input type="checkbox" checked={form.remember} onChange={update("remember")} />
            <span className="checkbox__box" aria-hidden="true" />
            Հիշել ինձ
          </label>
          <Link to="/forgot-password" className="link">
            Մոռացե՞լ եք գաղտնաբառը
          </Link>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Մուտք…" : "Մուտք"}
        </button>
      </form>

      <p className="auth__footer auth__footer--center">
        Առաջին անգա՞մ եք այստեղ
        <Link to="/activate" className="link">
          Ակտիվացրեք ձեր հաշիվը
        </Link>
      </p>
    </>
  );
}
