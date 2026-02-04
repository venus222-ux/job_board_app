import { useState, FormEvent } from "react";
import API from "../api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/forgot-password", { email });
      toast.success("Password reset link sent!");
    } catch {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 420 }}>
      <h3>🔑 Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-3"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
