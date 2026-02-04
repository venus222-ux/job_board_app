import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/register", form);
      toast.success("Registration successful");
      navigate("/login");
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: 420 }}>
        <h3 className="text-center mb-3">
          <i className="bi bi-person-plus me-2"></i> Register
        </h3>
        <form onSubmit={handleRegister}>
          <input
            className="form-control mb-3"
            placeholder="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="btn btn-primary w-100">Register</button>
        </form>
        <p className="text-center mt-3 small">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
