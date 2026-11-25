import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import TextField from "../../components/auth/TextField.jsx";
import { LockIcon } from "../../components/auth/Icons.jsx";
import { activateAccount } from "../../api/auth.js";
import { PASSWORD_HINT, validateNewPassword } from "../../utils/validation.js";

export default function CreatePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // This step only makes sense after the code was verified.
  if (!email) return <Navigate to="/activate" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validateNewPassword(password, confirm);
    if (problem) return setError(problem);
    setError("");
    setLoading(true);
    try {
      await activateAccount({ email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth__header">
        <h1 className="auth__title">Ստեղծեք ձեր գաղտնաբառը</h1>
        <p className="auth__subtitle auth__subtitle--sm">
          Ձեր էլ. հասցեն հաստատված է։ Ընտրեք գաղտնաբառ հետագա մուտքերի համար։
        </p>
      </header>

      <form className="auth__form auth__form--tight" onSubmit={handleSubmit} noValidate>
        <TextField label="Համալսարանական էլ. հասցե" type="email" value={email} verified />
        <TextField
          label="Նոր գաղտնաբառ"
          icon={LockIcon}
          type="password"
          placeholder="Ստեղծեք գաղտնաբառ"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Հաստատեք գաղտնաբառը"
          icon={LockIcon}
          type="password"
          placeholder="Կրկին մուտքագրեք գաղտնաբառը"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <p className={error ? "form-error" : "hint"} role={error ? "alert" : undefined}>
          {error || PASSWORD_HINT}
        </p>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Ակտիվացվում է…" : "Ակտիվացնել հաշիվը"}
        </button>
      </form>

      <p className="auth__footer auth__footer--center">
        Արդեն ակտիվացրե՞լ եք
        <Link to="/login" className="link">
          Մուտք
        </Link>
      </p>
    </>
  );
}
