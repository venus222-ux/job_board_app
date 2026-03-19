import { useState, FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation,
      });

      // Clear any old token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Password reset successful! Please log in.");

      // Redirect to login page
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      console.error("Reset failed:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Reset failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 450 }}>
        <div className="text-center mb-4">
          <div className="display-6 mb-3">🔒</div>
          <h3 className="mb-2">Reset Password</h3>
          <p className="text-muted small">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Hidden email field - using proper hidden input */}
          <input type="hidden" name="email" value={email} readOnly />

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              className="form-control bg-light"
              type="email"
              value={email}
              disabled
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">New Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Confirm New Password
            </label>
            <input
              className="form-control"
              type="password"
              placeholder="Re-enter new password"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            {password !== password_confirmation && password_confirmation && (
              <div className="text-danger small mt-1">
                <i className="bi bi-exclamation-circle me-1"></i>
                Passwords do not match
              </div>
            )}
          </div>

          <button
            className="btn btn-success w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/login" className="text-decoration-none small">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
