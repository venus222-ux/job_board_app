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
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

      // 🔑 Redirect to LOGIN page, NOT dashboard
      navigate("/login");
    } catch {
      toast.error("Reset failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h3>🔒 Reset Password</h3>
      <form onSubmit={handleSubmit}>
        <input type="hidden" value={email} />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Confirm Password"
          value={password_confirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <button className="btn btn-success w-100">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
