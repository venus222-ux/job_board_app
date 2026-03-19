import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await API.post("/forgot-password", { email });
      setSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      console.error("Forgot password error:", error);

      // Handle specific error cases
      if (
        error.response?.status === 404 ||
        error.response?.data?.message?.includes("not found") ||
        error.response?.data?.errors?.email?.[0]?.includes("exists")
      ) {
        toast.error("Email not found in our records");
      } else if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors.email) {
          toast.error(errors.email[0]);
        } else {
          toast.error("Validation failed. Please check your email.");
        }
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="container d-flex align-items-center justify-content-center vh-100">
        <div
          className="card shadow p-4 text-center"
          style={{ width: "100%", maxWidth: 450 }}
        >
          <div className="mb-4">
            <div className="display-1 text-success mb-3">✓</div>
            <h4 className="mb-3">Check Your Email</h4>
            <p className="text-muted mb-2">
              We've sent a password reset link to:
            </p>
            <p className="fw-bold bg-light p-2 rounded">{email}</p>
            <p className="text-muted small mt-3">
              Didn't receive it? Check your spam folder or{" "}
              <button
                className="btn btn-link p-0"
                onClick={() => setSubmitted(false)}
                style={{ textDecoration: "none" }}
              >
                try again
              </button>
            </p>
          </div>
          <div className="d-grid gap-2">
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
            <Link to="/" className="btn btn-outline-secondary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 450 }}>
        <div className="text-center mb-4">
          <div className="display-6 mb-3">🔑</div>
          <h3 className="mb-2">Forgot Password?</h3>
          <p className="text-muted small">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <div className="form-text text-muted">
              We'll send a password reset link to this email.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-decoration-none small">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Login
            </Link>
          </div>
        </form>

        <hr className="my-4" />

        <div className="text-center">
          <p className="text-muted small mb-0">
            Don't have an account?{" "}
            <Link to="/register" className="text-decoration-none">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
