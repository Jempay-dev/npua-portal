import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TextField from "../../components/auth/TextField.jsx";
import BackToSignIn from "../../components/auth/BackToSignIn.jsx";
import { LockIcon } from "../../components/auth/Icons.jsx";
import { resetPassword } from "../../api/auth.js";
import { PASSWORD_HINT, validateNewPassword } from "../../utils/validation.js";

// Opened from the email link: /reset-password?token=XXXX
export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validateNewPassword(password, confirm);
    if (problem) return setError(problem);
    setError("");
    setLoading(true);
    try {
      await resetPassword({ token, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth__header">
        <h1 className="auth__title">Ստեղծեք նոր գաղտնաբառ</h1>
        <p className="auth__subtitle auth__subtitle--sm">
          Ընտրեք նոր գաղտնաբառ ձեր համալսարանական հաշվի համար։
        </p>
      </header>

      <form className="auth__form auth__form--tight" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Նոր գաղտնաբառ"
          icon={LockIcon}
          type="password"
          placeholder="Մուտքագրեք նոր գաղտնաբառ"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Հաստատեք գաղտնաբառը"
          icon={LockIcon}
          type="password"
          placeholder="Կրկին մուտքագրեք նոր գաղտնաբառը"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <p className={error ? "form-error" : "hint"} role={error ? "alert" : undefined}>
          {error || PASSWORD_HINT}
        </p>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Պահպանվում է…" : "Վերականգնել գաղտնաբառը"}
        </button>
      </form>

      <BackToSignIn />
    </>
  );
}
