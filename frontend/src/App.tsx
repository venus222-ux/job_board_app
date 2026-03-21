import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";

// Lazy-loaded components
const Profile = lazy(() => import("./pages/Profile"));
const Home = lazy(() => import("./pages/Home"));
const EmployerDashboard = lazy(
  () => import("./pages/Dashboard/EmployerDashboard"),
);
const CandidateDashboard = lazy(
  () => import("./pages/Dashboard/CandidateDashboard"),
);
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const CompanyPage = lazy(() => import("./pages/Company/CompanyPage"));
const JobPage = lazy(() => import("./pages/Jobs/JobPage"));

import CompaniesList from "./pages/Company/CompaniesList";
import JobsList from "./pages/Jobs/JobsList";

const App = () => {
  const { theme, isAuth, role, startTokenRefreshLoop } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    if (isAuth) startTokenRefreshLoop();
  }, [theme, isAuth, startTokenRefreshLoop]);

  return (
    <BrowserRouter>
      <Navbar />
      {/* Wrap routes in Suspense for lazy-loading fallback */}
      <Suspense
        fallback={
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={!isAuth ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!isAuth ? <Register /> : <Navigate to="/dashboard" />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              isAuth ? (
                role === "employer" ? (
                  <EmployerDashboard />
                ) : role === "candidate" ? (
                  <CandidateDashboard />
                ) : role === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/profile"
            element={isAuth ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<NotFound />} />

          {/* Public routes */}
          <Route path="/companies" element={<CompaniesList />} />
          <Route path="/companies/:slug" element={<CompanyPage />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:slug" element={<JobPage />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
