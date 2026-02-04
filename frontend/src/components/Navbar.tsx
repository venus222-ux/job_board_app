import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuth(false);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm px-4">
      <Link className="navbar-brand fw-bold text-white" to="/">
        💬 Messenger
      </Link>
      <div className="ms-auto d-flex align-items-center gap-2">
        <Link className="btn btn-outline-light btn-sm" to="/dashboard">
          🏠 Dashboard
        </Link>
        <Link className="btn btn-outline-light btn-sm" to="/profile">
          👤 Profile
        </Link>
        <button className="btn btn-outline-light btn-sm" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {isAuth && (
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            🚪 Logout
          </button>
        )}
      </div>
    </nav>
  );
}
