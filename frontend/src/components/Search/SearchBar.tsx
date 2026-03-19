import { useState, useEffect, useRef } from "react";
import Autocomplete from "./Autocomplete";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setFocus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    onChange("");
    setFocus(true);
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <div className="search-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          className="search-input"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setLoading(true);
            // Simulate loading
            setTimeout(() => setLoading(false), 300);
          }}
          onFocus={() => setFocus(true)}
          placeholder="Search for jobs, companies, or locations..."
          autoComplete="off"
        />
        {value && (
          <button
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        {loading && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {focus && value && <Autocomplete query={value} onSelect={onChange} />}

      {focus && !value && (
        <div className="search-hint">
          Try: "Frontend Developer", "Remote", "Google"
        </div>
      )}
    </div>
  );
}
