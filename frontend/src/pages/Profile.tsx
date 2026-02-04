import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";

interface ProfileData {
  email: string;
  created_at?: string;
}

interface FormData {
  email: string;
  password: string;
  password_confirmation: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setIsAuth = useStore((state) => state.setIsAuth);

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        setProfile(res.data);
        setFormData((prev) => ({ ...prev, email: res.data.email || "" }));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    API.put("/profile", formData)
      .then((res) => toast.success(res.data.message))
      .catch((err) =>
        toast.error(err.response?.data?.message || "Update failed"),
      );
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account.",
      )
    )
      return;

    API.delete("/profile")
      .then(() => {
        toast.success("Account deleted");
        setIsAuth(false);
        localStorage.removeItem("token");
        window.location.replace("/login");
      })
      .catch(() => toast.error("Failed to delete account"));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h2>👤 Profile</h2>
      <p>
        <strong>Email:</strong> {profile?.email || "Unknown"}
      </p>
      <p>
        <strong>Joined:</strong>{" "}
        {profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString()
          : "Unknown"}
      </p>

      <form onSubmit={handleUpdate} className="mt-4" autoComplete="off">
        <h5>✏️ Edit Email / Password</h5>
        <div className="mb-2">
          <label>Email</label>
          <input
            className="form-control"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-2">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>
        <div className="mb-2">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Update Profile
        </button>
      </form>

      <hr className="my-4" />
      <button className="btn btn-danger" onClick={handleDelete}>
        🗑️ Delete Account
      </button>
    </div>
  );
};

export default Profile;
