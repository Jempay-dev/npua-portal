import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "../../components/auth/TextField.jsx";
import OtpInput from "../../components/auth/OtpInput.jsx";
import BackToSignIn from "../../components/auth/BackToSignIn.jsx";
import { MailIcon } from "../../components/auth/Icons.jsx";
import { verifyActivationCode } from "../../api/auth.js";

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Մուտքագրեք ձեր համալսարանական էլ. հասցեն։");
    setLoading(true);
    try {
      const result = await verifyActivationCode({ email, code: code.join("") });
      navigate("/activate/password", { state: { email: result.email } });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <header className="auth__header">
        <h1 className="auth__title">Ակտիվացրեք ձեր հաշիվը</h1>
        <p className="auth__subtitle auth__subtitle--sm">
          Մուտքագրեք ձեր համալսարանական էլ. հասցեն և ադմինիստրացիայից ստացված մեկանգամյա կոդը։
        </p>
      </header>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Համալսարանական էլ. հասցե"
          icon={MailIcon}
          type="email"
          placeholder="name@polytech.am"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <OtpInput label="Մեկանգամյա ակտիվացման կոդ" value={code} onChange={setCode} />

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Ստուգվում է…" : "Ստուգել կոդը"}
        </button>
      </form>

      <p className="auth__footer">
        Նոր կոդի կարիք ունե՞ք
        <a href="mailto:admin@polytech.am" className="link">
          Կապվեք ադմինիստրացիայի հետ
        </a>
      </p>
      <BackToSignIn />
    </>
  );
}
