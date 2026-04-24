import { FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import { useAuth } from "../../services/AuthContext";

export default function Profile({ }) {
  const { user, isLoggedIn } = useAuth();

  if(!isLoggedIn)
    return ;

  return (
    <div className="user-profile-container">
      <FaUserCircle className="profile-icon" />

      <div className="user-info">
        <div>
          <strong>Username:</strong> {user.username}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Data di nascita:</strong> {user.birthDate}
        </div>
      </div>
    </div>
  );
}