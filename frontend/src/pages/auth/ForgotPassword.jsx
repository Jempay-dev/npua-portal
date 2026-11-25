import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../components/auth/TextField.jsx";
import BackToSignIn from "../../components/auth/BackToSignIn.jsx";
import { MailIcon } from "../../components/auth/Icons.jsx";
import { requestPasswordReset } from "../../api/auth.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError("Մուտքագրեք ձեր համալսարանական էլ. հասցեն։");
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset({ email });
      navigate("/forgot-password/sent");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth__header">
        <h1 className="auth__title">Վերականգնեք գաղտնաբառը</h1>
        <p className="auth__subtitle auth__subtitle--sm">
          Մուտքագրեք ձեր համալսարանական էլ. հասցեն, և մենք կուղարկենք վերականգնման հղում։
        </p>
      </header>

      <form className="auth__form auth__form--spaced" onSubmit={handleSubmit} noValidate>
        <div>
          <TextField
            label="Համալսարանական էլ. հասցե"
            icon={MailIcon}
            type="email"
            placeholder="name@polytech.am"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          {!error && (
            <p className="hint hint--below">
              Եթե այս էլ. հասցեով հաշիվ գոյություն ունի, մենք կուղարկենք գաղտնաբառի վերականգնման հրահանգներ։
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Ուղարկվում է…" : "Ուղարկել հղումը"}
        </button>
      </form>

      <BackToSignIn />

      <p className="auth__footer auth__footer--center auth__footer--far">
        Օգնության կարիք ունե՞ք
        <a href="mailto:admin@polytech.am" className="link">
          Կապվեք ադմինիստրացիայի հետ
        </a>
      </p>
    </>
  );
}
