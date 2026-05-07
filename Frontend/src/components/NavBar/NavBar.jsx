import { Navbar, Container } from "react-bootstrap";
import "./NavBar.css";
import { IoPersonAddOutline, IoAddOutline } from "react-icons/io5";
import logo from "../../assets/logo.png";
import UserMenu from "./UserMenu/UserMenu";
import SearchBar from "./SearchBar/SearchBar";
import { useAuth } from "../../services/AuthContext";

export default function AppNavbar({
  onClick,
  onOpenCreateModal,
  onToggleSidebar
}) {
  const { isLoggedIn } = useAuth();

  return (
    <Navbar className="app-navbar py-2" expand="lg">
      <Container
        fluid
        className="navbar-container d-flex flex-wrap justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center">
          <button
            id="hamburger-toggle"
            className="btn btn-outline-light d-md-none me-2"
            onClick={onToggleSidebar}
            style={{ marginLeft: "-20px" }}
          >
            ☰
          </button>

          <div className="d-none d-md-flex align-items-center">
            <img src={logo} alt="Logo" className="navbar-logo me-2" />
            <span className="navbar-title">Bizment</span>
          </div>
        </div>

        <div className="navbar-search-container mx-auto flex-grow-1 mx-3">
          <SearchBar/>
        </div>

        <div className="d-flex align-items-center">
          {isLoggedIn ? (
            <>
              <button
                onClick={onOpenCreateModal}
                className="btn btn-outline-light me-0 login-button"
                title="Crea un nuovo post"
              >
                <IoAddOutline />
                <span className="d-none d-md-inline ms-1">Nuovo Post</span>
              </button>

              <div className="d-none d-md-block">
                <UserMenu/>
              </div>
            </>
          ) : (
            <button
              onClick={onClick}
              className="btn btn-outline-light login-button "
              title="Accedi o registrati"
            >
              <IoPersonAddOutline />
              <span className="d-none d-md-inline ms-1"> Accedi/Registrati </span>
            </button>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
