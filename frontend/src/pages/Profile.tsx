import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { useStore } from "../store/useStore";
import "./Profile.css";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const setIsAuth = useStore((state) => state.setIsAuth);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    API.get("/profile")
      .then((res) => {
        setProfile(res.data);
        setFormData((prev) => ({ ...prev, email: res.data.email || "" }));
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setError("Unable to load your profile. Please try again.");
        setLoading(false);
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(null);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);

    // Validate passwords match
    if (
      formData.password &&
      formData.password !== formData.password_confirmation
    ) {
      toast.error("Passwords do not match");
      setSubmitting(false);
      return;
    }

    try {
      const response = await API.put("/profile", formData);
      setProfile((prev) => (prev ? { ...prev, email: formData.email } : null));
      setFormData((prev) => ({
        ...prev,
        password: "",
        password_confirmation: "",
      }));
      setSuccess(response.data.message || "Profile updated successfully!");
      toast.success("Profile updated successfully");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Update failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "⚠️ Are you absolutely sure?\n\nThis will permanently delete your account and all associated data. This action cannot be undone.",
      )
    )
      return;

    API.delete("/profile")
      .then(() => {
        toast.success("Account deleted successfully");
        setIsAuth(false);
        localStorage.removeItem("token");
        window.location.href = "/login";
      })
      .catch(() => toast.error("Failed to delete account. Please try again."));
  };

  // Loading State
  if (loading) {
    return (
      <div className={`profile-page ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`profile-page ${theme}`}>
        <div className="profile-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Error Loading Profile</h3>
            <p className="error-message">{error}</p>
            <button className="error-retry" onClick={fetchProfile}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-page ${theme}`}>
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <h1 className="profile-title">Profile Settings</h1>
          <p className="profile-subtitle">
            Manage your account information and preferences
          </p>

          <div className="profile-info">
            <div className="info-card">
              <div className="info-label">
                <span>📧</span> Email Address
              </div>
              <div className="info-value">{profile?.email || "Unknown"}</div>
            </div>

            <div className="info-card">
              <div className="info-label">
                <span>📅</span> Member Since
              </div>
              <div className="info-value">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form
          onSubmit={handleUpdate}
          className="profile-form"
          autoComplete="off"
        >
          <h2 className="form-title">Update Account</h2>

          {success && <div className="success-message">{success}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label email">Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
              <p className="form-hint">
                This email will be used for account notifications and login.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label password">New Password</label>
              <input
                type="password"
                className="form-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Enter new password (optional)"
              />
              <p className="form-hint">
                Leave blank if you don't want to change your password.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label confirm">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
              <p className="form-hint">Passwords must match to update.</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <div
                    className="loading-spinner"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderWidth: "2px",
                    }}
                  />
                  Updating...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="danger-zone">
          <h2 className="danger-title">Danger Zone</h2>

          <p className="danger-description">
            These actions are permanent and cannot be undone. Please proceed
            with caution.
          </p>

          <div className="danger-warning">
            <h4 className="warning-title">Before you delete:</h4>
            <ul className="warning-list">
              <li className="warning-item">
                All your data will be permanently removed
              </li>
              <li className="warning-item">This action cannot be reversed</li>
              <li className="warning-item">
                You will lose access to all your content
              </li>
              <li className="warning-item">
                Associated companies and jobs will be affected
              </li>
            </ul>
          </div>

          <button className="delete-btn" onClick={handleDelete} type="button">
            <span>🗑️</span>
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
