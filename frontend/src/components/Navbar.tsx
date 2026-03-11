import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { isAuth, setIsAuth, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setIsAuth(false);
    navigate("/login");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "✨" },
    { to: "/profile", label: "Profile", icon: "⭐" },
    { to: "/jobs", label: "Jobs", icon: "💫" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""} ${theme}`}>
        <div className="navbar-gradient"></div>
        <div className="navbar-container">
          {/* Logo Section */}
          <Link className="logo" to="/" onClick={() => setIsMenuOpen(false)}>
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="url(#gradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="url(#gradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="url(#gradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="2"
                    y1="2"
                    x2="22"
                    y2="22"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#C026D3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-primary">Nexus</span>
              <span className="logo-badge">v2.0</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? "active" : ""}`}
                onMouseEnter={() => setHoveredLink(link.to)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
                {(isActive(link.to) || hoveredLink === link.to) && (
                  <span className="nav-indicator"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="nav-right">
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme}>
              <div className="toggle-track">
                <div className={`toggle-thumb ${theme}`}>
                  {theme === "light" ? "🌙" : "☀️"}
                </div>
              </div>
            </button>

            {/* User Menu */}
            {isAuth ? (
              <div className="user-menu">
                <div className="user-button">
                  {" "}
                  {/* changed to div */}
                  <div className="user-avatar">
                    <span>JD</span>
                    <div className="avatar-glow"></div>
                  </div>
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">JD</div>
                      <div className="dropdown-info">
                        <span className="dropdown-name">John Doe</span>
                        <span className="dropdown-email">john@example.com</span>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link to="/profile" className="dropdown-item">
                      <span>👤</span> Profile
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className={`mobile-menu-btn ${isMenuOpen ? "active" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="mobile-menu-header">
            <div className="mobile-user">
              <div className="mobile-avatar">JD</div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">John Doe</span>
                <span className="mobile-user-email">john@example.com</span>
              </div>
            </div>
          </div>
          <div className="mobile-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-link ${isActive(link.to) ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mobile-link-icon">{link.icon}</span>
                <span className="mobile-link-label">{link.label}</span>
                <span className="mobile-link-arrow">→</span>
              </Link>
            ))}
          </div>
          <div className="mobile-footer">
            <button className="mobile-theme" onClick={toggleTheme}>
              <span>
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </span>
            </button>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
