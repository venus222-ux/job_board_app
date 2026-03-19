import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import axios from "axios";
import styles from "./AdminDashboard.module.css";
import Button from "../../components/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
);

type JobView = {
  _id: string;
  views: number;
};

type DashboardData = {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  pendingApplications: number;
  recentUsers: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }[];
  recentApplications: {
    id: number;
    candidate: { name: string };
    job: { title: string };
    created_at: string;
    viewed_at: string | null;
  }[];
  jobStatusDistribution: { status: string; count: number }[];
  userRoleDistribution: { role: string; count: number }[];
  monthlyApplications: { month: string; count: number }[];
  jobTypeDistribution: { type: string; count: number }[];
  recentJobViews: JobView[];
};

type Category = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type Skill = {
  id: number;
  name: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("30d");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [activeTab, setActiveTab] = useState<"categories" | "skills">(
    "categories",
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentItem, setCurrentItem] = useState<Category | Skill | null>(null);
  const [itemName, setItemName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | Skill | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsLoggedIn(true);
      fetchAllData(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token && isLoggedIn) {
      fetchDashboardData(token);
    }
  }, [range, isLoggedIn]);

  const fetchAllData = async (token: string) => {
    await Promise.all([
      fetchDashboardData(token),
      fetchCategories(token),
      fetchSkills(token),
    ]);
  };

  const fetchCategories = async (token: string) => {
    setLoadingCategories(true);
    try {
      const response = await axios.get("http://localhost:8000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please refresh the page.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSkills = async (token: string) => {
    setLoadingSkills(true);
    try {
      const response = await axios.get("http://localhost:8000/api/skills", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSkills(response.data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError("Failed to load skills. Please refresh the page.");
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email: "admin@example.com",
        password: "password123",
      });

      const token = response.data.access_token || response.data.token;
      if (token) {
        localStorage.setItem("adminToken", token);
        setIsLoggedIn(true);
        await fetchAllData(token);
      } else {
        throw new Error("No token received");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/admin/dashboard?range=${range}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch dashboard:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        setIsLoggedIn(false);
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load dashboard data. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
    setData(null);
    setCategories([]);
    setSkills([]);
    setError(null);
  };

  const handleRetry = () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchAllData(token);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentItem(null);
    setItemName("");
    setSelectedCategoryId("");
    setShowModal(true);
  };

  const openEditModal = (item: Category | Skill) => {
    setModalMode("edit");
    setCurrentItem(item);
    setItemName(item.name);
    if ("category_id" in item) {
      setSelectedCategoryId(item.category_id || "");
    } else {
      setSelectedCategoryId("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
    setItemName("");
    setSelectedCategoryId("");
  };

  const openDeleteConfirm = (item: Category | Skill) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleCreateItem = async () => {
    if (!itemName.trim()) return;

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      if (activeTab === "categories") {
        const response = await axios.post(
          "http://localhost:8000/api/categories",
          { name: itemName },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setCategories([...categories, response.data]);
      } else {
        const response = await axios.post(
          "http://localhost:8000/api/skills",
          {
            name: itemName,
            category_id: selectedCategoryId || undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSkills([...skills, response.data]);
      }
      closeModal();
    } catch (err: any) {
      console.error(`Failed to create ${activeTab}:`, err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        `Failed to create ${activeTab}. Please try again.`;
      alert(errorMessage);
    }
  };

  const handleEditItem = async () => {
    if (!itemName.trim() || !currentItem) return;

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      if (activeTab === "categories") {
        const response = await axios.put(
          `http://localhost:8000/api/categories/${currentItem.id}`,
          { name: itemName },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setCategories(
          categories.map((c) => (c.id === currentItem.id ? response.data : c)),
        );
      } else {
        const response = await axios.put(
          `http://localhost:8000/api/skills/${currentItem.id}`,
          {
            name: itemName,
            category_id: selectedCategoryId || undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSkills(
          skills.map((s) => (s.id === currentItem.id ? response.data : s)),
        );
      }
      closeModal();
    } catch (err: any) {
      console.error(`Failed to update ${activeTab}:`, err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        `Failed to update ${activeTab}. Please try again.`;
      alert(errorMessage);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      if (activeTab === "categories") {
        await axios.delete(
          `http://localhost:8000/api/categories/${itemToDelete.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setCategories(categories.filter((c) => c.id !== itemToDelete.id));
        fetchSkills(token);
      } else {
        await axios.delete(
          `http://localhost:8000/api/skills/${itemToDelete.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSkills(skills.filter((s) => s.id !== itemToDelete.id));
      }
      closeDeleteConfirm();
    } catch (err: any) {
      console.error(`Failed to delete ${activeTab}:`, err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        `Failed to delete ${activeTab}. Please try again.`;
      alert(errorMessage);
    }
  };

  const processJobViews = () => {
    if (!data?.recentJobViews || data.recentJobViews.length === 0) {
      return { topViews: [], totalViews: 0, avgViews: 0 };
    }

    const topViews = [...data.recentJobViews]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const totalViews = data.recentJobViews.reduce(
      (sum, view) => sum + view.views,
      0,
    );
    const avgViews = Math.round(totalViews / data.recentJobViews.length);

    return { topViews, totalViews, avgViews };
  };

  const { topViews, totalViews, avgViews } = processJobViews();

  const jobViewsChart = {
    labels: topViews.map((view) => {
      const jobId = view._id.toString();
      return jobId.length > 8 ? `${jobId.substring(0, 8)}...` : jobId;
    }),
    datasets: [
      {
        label: "Job Views",
        data: topViews.map((view) => view.views),
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  if (!isLoggedIn) {
    return (
      <div className={styles["login-container"]}>
        <div className={styles["login-card"]}>
          <div className={styles["login-icon"]}>🔐</div>
          <h1 className={styles["login-title"]}>Admin Portal</h1>
          <p className={styles["login-subtitle"]}>
            Sign in to access the dashboard
          </p>

          {error && <div className={styles["login-error"]}>{error}</div>}

          <form onSubmit={handleAdminLogin}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="🔑"
              loading={loading}
              type="submit"
            >
              Login as Administrator
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-content"]}>
          <div className={styles["loading-spinner"]}></div>
          <p className={styles["loading-text"]}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles["error-container"]}>
        <div className={styles["error-icon"]}>⚠️</div>
        <h2 className={styles["error-title"]}>Error Loading Dashboard</h2>
        <p className={styles["error-message"]}>{error}</p>
        <div className={styles["error-actions"]}>
          <Button variant="primary" onClick={handleRetry}>
            Retry
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const applicationsChart = {
    labels: data.monthlyApplications?.map((d) => d.month) || [],
    datasets: [
      {
        label: "Applications",
        data: data.monthlyApplications?.map((d) => d.count) || [],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        borderWidth: 3,
        tension: 0.4,
        fill: {
          target: "origin",
          above: "rgba(99, 102, 241, 0.2)",
        },
      },
    ],
  };

  const jobStatusChart = {
    labels: data.jobStatusDistribution?.map((d) => d.status) || [],
    datasets: [
      {
        data: data.jobStatusDistribution?.map((d) => d.count) || [],
        backgroundColor: ["#4ade80", "#fbbf24", "#f87171"],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 15,
      },
    ],
  };

  const userRoleChart = {
    labels: data.userRoleDistribution?.map((d) => d.role) || [],
    datasets: [
      {
        data: data.userRoleDistribution?.map((d) => d.count) || [],
        backgroundColor: ["#60a5fa", "#f472b6", "#34d399"],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 15,
      },
    ],
  };

  const jobTypeBarChart = {
    labels: data.jobTypeDistribution?.map((d) => d.type) || [],
    datasets: [
      {
        label: "Jobs by Type",
        data: data.jobTypeDistribution?.map((d) => d.count) || [],
        backgroundColor: ["#8b5cf6", "#f59e0b", "#ef4444", "#10b981"],
        borderColor: ["#7c3aed", "#d97706", "#dc2626", "#059669"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const stats = [
    {
      label: "Total Users",
      value: data.totalUsers || 0,
      icon: "👥",
      color: "primary",
    },
    {
      label: "Companies",
      value: data.totalCompanies || 0,
      icon: "🏢",
      color: "success",
    },
    {
      label: "Total Jobs",
      value: data.totalJobs || 0,
      icon: "💼",
      color: "warning",
    },
    {
      label: "Active Jobs",
      value: data.activeJobs || 0,
      icon: "✅",
      color: "info",
    },
    {
      label: "Applications",
      value: data.totalApplications || 0,
      icon: "📄",
      color: "primary",
    },
    {
      label: "Pending Apps",
      value: data.pendingApplications || 0,
      icon: "⏳",
      color: "warning",
    },
    { label: "Job Views", value: totalViews, icon: "👁️", color: "success" },
    { label: "Avg Views/Job", value: avgViews, icon: "📊", color: "info" },
  ];

  return (
    <div className={styles["admin-dashboard-root"]}>
      <div className={styles["admin-dashboard"]}>
        <header className={styles["dashboard-header"]}>
          <div>
            <h1 className={styles["dashboard-title"]}>Admin Dashboard</h1>
            <div className={styles["header-controls"]}>
              <div className={styles["range-selector"]}>
                {["7d", "30d", "90d"].map((r) => (
                  <button
                    key={r}
                    className={`${styles["range-btn"]} ${range === r ? styles["active"] : ""}`}
                    onClick={() => setRange(r)}
                  >
                    {r === "7d"
                      ? "7 Days"
                      : r === "30d"
                        ? "30 Days"
                        : "90 Days"}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="md" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className={styles["stats-grid"]}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${styles["stat-card"]} ${styles[`stat-card-${stat.color}`]}`}
            >
              <div className={styles["stat-label"]}>{stat.label}</div>
              <div className={styles["stat-value"]}>
                {stat.value.toLocaleString()}
              </div>
              <div className={styles["stat-icon"]}>{stat.icon}</div>
            </div>
          ))}
        </div>

        <div className={styles["charts-grid"]}>
          {data.monthlyApplications && data.monthlyApplications.length > 0 && (
            <div className={styles["chart-card"]}>
              <div className={styles["chart-header"]}>
                <div>
                  <h3 className={styles["chart-title"]}>Applications Trend</h3>
                  <p className={styles["chart-subtitle"]}>
                    Monthly application submissions
                  </p>
                </div>
              </div>
              <div className={styles["chart-container"]}>
                <Line
                  data={applicationsChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </div>
          )}

          <div className={styles["chart-card"]}>
            <div className={styles["chart-header"]}>
              <div>
                <h3 className={styles["chart-title"]}>
                  Job Status Distribution
                </h3>
                <p className={styles["chart-subtitle"]}>
                  Current status of all jobs
                </p>
              </div>
            </div>
            <div className={styles["chart-container"]}>
              <Doughnut
                data={jobStatusChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>

          <div className={styles["chart-card"]}>
            <div className={styles["chart-header"]}>
              <div>
                <h3 className={styles["chart-title"]}>User Roles</h3>
                <p className={styles["chart-subtitle"]}>
                  Distribution by user type
                </p>
              </div>
            </div>
            <div className={styles["chart-container"]}>
              <Doughnut
                data={userRoleChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>

          <div className={styles["chart-card"]}>
            <div className={styles["chart-header"]}>
              <div>
                <h3 className={styles["chart-title"]}>Job Types</h3>
                <p className={styles["chart-subtitle"]}>
                  Distribution of employment types
                </p>
              </div>
            </div>
            <div className={styles["chart-container"]}>
              <Bar
                data={jobTypeBarChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {topViews.length > 0 && (
            <div className={`${styles["chart-card"]} ${styles["full-width"]}`}>
              <div className={styles["chart-header"]}>
                <div>
                  <h3 className={styles["chart-title"]}>
                    Top Job Views (MongoDB)
                  </h3>
                  <p className={styles["chart-subtitle"]}>
                    Most viewed jobs in the last {range}
                  </p>
                </div>
              </div>
              <div
                className={styles["chart-container"]}
                style={{ height: "400px" }}
              >
                <Bar
                  data={jobViewsChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const view = topViews[context.dataIndex];
                            return [
                              `Views: ${view.views}`,
                              `Job ID: ${view._id}`,
                            ];
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Number of Views" },
                      },
                    },
                  }}
                />
              </div>
              <div className={styles["chart-footer"]}>
                <span>
                  <strong>Total Views:</strong> {totalViews.toLocaleString()}
                </span>
                <span>
                  <strong>Jobs Tracked:</strong> {data.recentJobViews.length}
                </span>
                <span>
                  <strong>Avg per Job:</strong> {avgViews.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles["management-section"]}>
          <div className={styles["management-header"]}>
            <div className={styles["management-tabs"]}>
              <button
                className={`${styles["tab-btn"]} ${activeTab === "categories" ? styles["active"] : ""}`}
                onClick={() => setActiveTab("categories")}
              >
                Categories
              </button>
              <button
                className={`${styles["tab-btn"]} ${activeTab === "skills" ? styles["active"] : ""}`}
                onClick={() => setActiveTab("skills")}
              >
                Skills
              </button>
            </div>
            <Button
              variant="primary"
              size="md"
              icon="+"
              onClick={openCreateModal}
            >
              Create {activeTab === "categories" ? "Category" : "Skill"}
            </Button>
          </div>

          <div className={styles["management-content"]}>
            {activeTab === "categories" ? (
              loadingCategories ? (
                <div className={styles["loading-spinner-small"]}></div>
              ) : (
                <table className={styles["management-table"]}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>
                          {category.created_at
                            ? new Date(category.created_at).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className={styles["actions"]}>
                          <Button
                            variant="info"
                            size="xs"
                            onClick={() => openEditModal(category)}
                            icon="✏️"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => openDeleteConfirm(category)}
                            icon="🗑️"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className={styles["empty-state"]}>
                          No categories found. Create your first category!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )
            ) : loadingSkills ? (
              <div className={styles["loading-spinner-small"]}></div>
            ) : (
              <table className={styles["management-table"]}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => (
                    <tr key={skill.id}>
                      <td>{skill.id}</td>
                      <td>{skill.name}</td>
                      <td>
                        {skill.category?.name ||
                          categories.find((c) => c.id === skill.category_id)
                            ?.name ||
                          "Uncategorized"}
                      </td>
                      <td>
                        {skill.created_at
                          ? new Date(skill.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className={styles["actions"]}>
                        <Button
                          variant="info"
                          size="xs"
                          onClick={() => openEditModal(skill)}
                          icon="✏️"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => openDeleteConfirm(skill)}
                          icon="🗑️"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {skills.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles["empty-state"]}>
                        No skills found. Create your first skill!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles["activity-grid"]}>
          {data.recentUsers && data.recentUsers.length > 0 && (
            <div className={styles["activity-card"]}>
              <div className={styles["activity-header"]}>
                <div>
                  <h3 className={styles["activity-title"]}>Recent Users</h3>
                  <p className={styles["activity-subtitle"]}>
                    Newly registered users
                  </p>
                </div>
                <button
                  className={styles["chart-action-btn"]}
                  onClick={() =>
                    fetchDashboardData(localStorage.getItem("adminToken") || "")
                  }
                >
                  ↻
                </button>
              </div>
              <div className={styles["activity-list"]}>
                {data.recentUsers.map((user) => (
                  <div key={user.id} className={styles["activity-item"]}>
                    <div
                      className={`${styles["activity-avatar"]} ${styles[user.role] || styles["user"]}`}
                    >
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className={styles["activity-content"]}>
                      <div className={styles["activity-name"]}>{user.name}</div>
                      <div className={styles["activity-detail"]}>
                        {user.email}
                      </div>
                    </div>
                    <div className={styles["activity-time"]}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                    <span
                      className={`${styles["activity-badge"]} ${
                        user.role === "admin"
                          ? styles["badge-danger"]
                          : user.role === "employer"
                            ? styles["badge-primary"]
                            : styles["badge-success"]
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recentApplications && data.recentApplications.length > 0 && (
            <div className={styles["activity-card"]}>
              <div className={styles["activity-header"]}>
                <div>
                  <h3 className={styles["activity-title"]}>
                    Recent Applications
                  </h3>
                  <p className={styles["activity-subtitle"]}>
                    Latest job applications
                  </p>
                </div>
                <button
                  className={styles["chart-action-btn"]}
                  onClick={() =>
                    fetchDashboardData(localStorage.getItem("adminToken") || "")
                  }
                >
                  ↻
                </button>
              </div>
              <div className={styles["activity-list"]}>
                {data.recentApplications.map((app) => (
                  <div key={app.id} className={styles["activity-item"]}>
                    <div
                      className={`${styles["activity-avatar"]} ${styles["candidate"]}`}
                    >
                      {app.candidate?.name?.charAt(0) || "A"}
                    </div>
                    <div className={styles["activity-content"]}>
                      <div className={styles["activity-name"]}>
                        {app.candidate?.name || "Unknown"}
                      </div>
                      <div className={styles["activity-detail"]}>
                        {app.job?.title || "Unknown Job"}
                      </div>
                    </div>
                    <div className={styles["activity-time"]}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    <span
                      className={`${styles["activity-badge"]} ${app.viewed_at ? styles["badge-success"] : styles["badge-warning"]}`}
                    >
                      {app.viewed_at ? "Reviewed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showModal && (
          <div className={styles["modal-overlay"]} onClick={closeModal}>
            <div
              className={`${styles["modal"]} ${styles["modal-small"]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles["modal-header"]}>
                <h3>
                  {modalMode === "create" ? "Create" : "Edit"}{" "}
                  {activeTab === "categories" ? "Category" : "Skill"}
                </h3>
                <button className={styles["close-btn"]} onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className={styles["modal-body"]}>
                <div className={styles["form-group"]}>
                  <label htmlFor="itemName">Name *</label>
                  <input
                    id="itemName"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={`Enter ${activeTab === "categories" ? "category" : "skill"} name`}
                    autoFocus
                  />
                </div>
                {activeTab === "skills" && (
                  <div className={styles["form-group"]}>
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={selectedCategoryId}
                      onChange={(e) =>
                        setSelectedCategoryId(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className={styles["modal-footer"]}>
                <Button variant="secondary" size="md" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={
                    modalMode === "create" ? handleCreateItem : handleEditItem
                  }
                  disabled={!itemName.trim()}
                >
                  {modalMode === "create" ? "Create" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && itemToDelete && (
          <div className={styles["modal-overlay"]} onClick={closeDeleteConfirm}>
            <div
              className={`${styles["modal"]} ${styles["modal-small"]}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles["modal-header"]}>
                <h3>Confirm Delete</h3>
                <button
                  className={styles["close-btn"]}
                  onClick={closeDeleteConfirm}
                >
                  &times;
                </button>
              </div>
              <div className={styles["modal-body"]}>
                <p>Are you sure you want to delete "{itemToDelete.name}"?</p>
                {activeTab === "categories" && (
                  <p className={styles["warning-text"]}>
                    ⚠️ This will also delete all skills in this category.
                  </p>
                )}
              </div>
              <div className={styles["modal-footer"]}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={closeDeleteConfirm}
                >
                  Cancel
                </Button>
                <Button variant="danger" size="md" onClick={handleDeleteItem}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
