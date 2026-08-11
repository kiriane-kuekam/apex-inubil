import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpg";
import logoTransparent from "../assets/logo-transparent.png";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__brand">
        <h1 className="login-page__headline">
          Anticipez l'échec académique avant qu'il ne survienne
        </h1>
        <p className="login-page__sub">
          Suivi intelligent de la réussite étudiante pour ISTAMA, ISPL, ISPM
          et ISSTAP.
        </p>

        <div className="login-page__preview">
          <div className="login-page__preview-row">
            <span>Taux de détection précoce</span>
            <strong>+40%</strong>
          </div>
          <div className="login-page__preview-bars">
            <div className="bar bar--low" style={{ height: "38%" }} />
            <div className="bar bar--mid" style={{ height: "58%" }} />
            <div className="bar bar--high" style={{ height: "82%" }} />
            <div className="bar bar--low" style={{ height: "30%" }} />
            <div className="bar bar--mid" style={{ height: "64%" }} />
          </div>
        </div>

        <div className="login-page__pills">
          {["ISTAMA", "ISPL", "ISPM", "ISSTAP"].map((i) => (
            <span key={i} className="login-page__pill">{i}</span>
          ))}
        </div>
      </div>

      <div className="login-page__form-side">
        <form className="login-card" onSubmit={handleSubmit}>
          <img src={logo} alt="APEX INUBIL" className="login-card__logo login-card__logo--center" />
          <h2>Bienvenue</h2>
          <p className="login-card__sub">Connectez-vous à votre espace</p>

          <label className="field">
            <span>Adresse email</span>
            <input
              type="email"
              className="text-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@apexinubil.cm"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <input
              type="password"
              className="text-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="login-card__error">{error}</p>}

          <button className="btn btn-primary login-card__submit" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="login-card__footnote">
            Accès réservé au personnel académique - contactez votre
            administrateur pour obtenir un compte.
          </p>
        </form>
      </div>
    </div>
  );
}
