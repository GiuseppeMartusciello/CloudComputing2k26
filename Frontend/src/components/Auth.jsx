import "./Auth.css";
import logo from "../assets/logo.png";
import logoSad from "../assets/logoSad.png";
import { useState, useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { loginApi, signUpApi } from "../services/authService";
import { getMe } from "../services/userService";
import { toast } from "react-toastify";
import { BiSolidHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";

export default function Auth({ showModal, onClickClose }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [birthdate, setBirthdate] = useState("");

  const [errors, setErrors] = useState({});

  const { login, setUser } = useAuth();

  useEffect(() => {
    if (showModal) {
      setEmail("");
      setUsername("");
      setPassword("");
      setBirthdate("");
      setErrors({});
    }
  }, [showModal]);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let accessToken;
      setErrors({});

      if (isRegistering) {
        const validationErrors = validateRegistration();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
        await signUpApi({ email, username, password, birthdate });
        const res = await loginApi(email, password);
        accessToken = res.accessToken;
        toast.success("Registrazione avvenuta con successo");
      } else {
        const validationErrors = validateRegistration();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
        const res = await loginApi(email, password);
        accessToken = res.accessToken;
        toast.success("Login effettuato");
      }

      login(accessToken);
      const me = await getMe();
      setUser(me);
      onClickClose();
    } catch (err) {
      if (err.status === 401) {
        setErrors({ general: "Email o password errati" });
        toast.error("Email o password errati");
      } else if (err.status === 409) {
        setErrors({ general: "Email o username già utilizzati" });
        toast.error("Email o username già utilizzati");
      } else {
        setErrors({ general: "Errore imprevisto, riprova" });
        toast.error("Errore imprevisto, riprova");
      }
    }
  };

  const validateRegistration = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      newErrors.email = "Email non valida.";
    }

    if (isRegistering) {
      if (password.length < 8) {
        newErrors.password = "La password deve avere almeno 8 caratteri.";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password =
          "La password deve contenere almeno una lettera minuscola.";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password =
          "La password deve contenere almeno una lettera maiuscola.";
      } else if (!/\d/.test(password)) {
        newErrors.password = "La password deve contenere almeno un numero.";
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        newErrors.password = "La password deve contenere almeno un simbolo.";
      }

      if (username.length < 5) {
        newErrors.username = "Username deve avere almeno 5 caratteri.";
      }

      if (!birthdate) {
        newErrors.birthdate = "La data di nascita è obbligatoria.";
      } else {
        const today = new Date().toISOString().split("T")[0];
        if (birthdate >= today) {
          newErrors.birthdate = "La data di nascita deve essere nel passato.";
        }
      }
    }

    return newErrors;
  };

  return (
    <div className="overlay" onClick={onClickClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="top">
          <button className="close-button" onClick={onClickClose}>
            ✕
          </button>
          {Object.keys(errors).length > 0 ? (
            <img src={logoSad} alt="Errore" className="logo" />
          ) : (
            <img src={logo} alt="Logo" className="logo" />
          )}
        </div>

        <h2>{isRegistering ? "Registrati" : "Accedi"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="input-error">{errors.email}</p>}

          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <p className="input-error">{errors.username}</p>
              )}
              <input
                type="date"
                placeholder="Data di nascita"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
              {errors.birthdate && (
                <p className="input-error">{errors.birthdate}</p>
              )}
            </>
          )}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "40px" }}
            />

            <button
              type="button"
              className="passwordToggleIcon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <BiSolidHide /> : <BiShow />}
            </button>
          </div>
          {errors.password && <p className="input-error">{errors.password}</p>}

          <button type="submit">
            {isRegistering ? "Crea Account" : "Entra"}
          </button>
          {errors.general && <p className="input-error">{errors.general}</p>}
        </form>

        <div className="switch-auth">
          {isRegistering ? (
            <p>
              Hai già un account?{" "}
              <span
                style={{ color: "#1e4ed8", cursor: "pointer" }}
                onClick={() => setIsRegistering(false)}
              >
                Accedi
              </span>
            </p>
          ) : (
            <p>
              Non hai un account?{" "}
              <span
                style={{ color: "#1e4ed8", cursor: "pointer" }}
                onClick={() => setIsRegistering(true)}
              >
                Registrati
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
