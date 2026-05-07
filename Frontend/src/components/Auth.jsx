import "./Auth.css";
import logo from "../assets/logo.png";
import { useAuth } from "../services/AuthContext";
import { toast } from "react-toastify";
import { FaMicrosoft } from "react-icons/fa";

export default function Auth({ showModal, onClickClose }) {
  const { login } = useAuth();

  if (!showModal) return null;

  const handleMicrosoftLogin = () => {
    login(); // Questo reindirizzerà la pagina intera a Microsoft
  };

  return (
    <div className="overlay" onClick={onClickClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="top">
          <button className="close-button" onClick={onClickClose}>
            ✕
          </button>
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <h2>Benvenuto su Bizment</h2>
        <p className="auth-subtitle">Accedi per condividere immagini e GIF con la community</p>

        <div className="auth-methods">
          <button className="microsoft-login-button" onClick={handleMicrosoftLogin}>
            <FaMicrosoft className="ms-icon" />
            Accedi con Microsoft
          </button>
        </div>

        <div className="auth-footer">
          <p>Utilizziamo Microsoft Entra ID per garantire la massima sicurezza dei tuoi dati.</p>
        </div>
      </div>
    </div>
  );
}
