// Home.jsx - Enhanced with loading state
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import SearchBar from "../components/Search/SearchBar";
import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import "./Home.css";

const Home = () => {
  const { isAuth, user } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const navigate = useNavigate();

  // Navigate after debounce
  useEffect(() => {
    if (debouncedQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery, navigate]);

  // Handle search state
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <div className="dashboard-home">
      <div className="dashboard-card">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-icon">🚀</div>
          <h1 className="dashboard-title">
            {isAuth
              ? `Welcome back, ${user?.name || "there"}!`
              : "Welcome to CareerHub"}
          </h1>
          <p className="dashboard-subtitle">
            {isAuth
              ? "Ready to find your next opportunity?"
              : "Find your dream job. Connect with top companies. Grow your career."}
          </p>
        </div>

        {/* Search Section */}
        {isAuth && (
          <div className="search-section">
            <label className="search-label">Search Opportunities</label>
            <div className="dashboard-search-bar">
              <div
                className={`search-input-container ${isSearching ? "searching" : ""}`}
              >
                <div className="search-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                {isSearching && (
                  <div className="search-loading active">
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="search-hint">
                Try: "Remote Developer", "Marketing Manager", or "Project Lead"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
