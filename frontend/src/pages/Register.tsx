import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "candidate" | "employer";
}

const Register = () => {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "candidate", // default role
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/register", form);

      // If registration returns token, store it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Registration successful! Redirecting to dashboard...");

        // Redirect based on role
        if (form.role === "employer") {
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setTimeout(() => navigate("/login"), 1500);
        }
      } else {
        toast.success("Registration successful! Please login.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Show validation errors from server
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 450 }}>
        <div className="text-center mb-4">
          <h3 className="mb-2">
            <i className="bi bi-person-plus me-2"></i> Create Account
          </h3>
          <p className="text-muted small">Join our job portal community</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Name Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              className="form-control"
              placeholder="Enter your full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              I am registering as
            </label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="candidate">Job Seeker / Candidate</option>
              <option value="employer">Employer / Company</option>
            </select>
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Minimum 6 characters"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="Re-enter your password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
            {form.password !== form.password_confirmation &&
              form.password_confirmation && (
                <div className="text-danger small mt-1">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Passwords do not match
                </div>
              )}
          </div>

          {/* Submit Button */}
          <button
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Register
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted small mb-1">
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-none">
              Sign In
            </Link>
          </p>
          <Link to="/forgot-password" className="text-decoration-none small">
            <i className="bi bi-key me-1"></i>
            Forgot Password?
          </Link>
        </div>

        <hr className="my-3" />

        <p className="text-muted small text-center mb-0">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Register;
