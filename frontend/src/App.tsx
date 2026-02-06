import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { useStore } from "./store/useStore";
import EmployerDashboard from "./pages/Dashboard/EmployerDashboard";
import CandidateDashboard from "./pages/Dashboard/CandidateDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import CompaniesList from "./pages/Company/CompaniesList";
import CompanyPage from "./pages/Company/CompanyPage";
import JobsList from "./pages/Jobs/JobsList";
import JobPage from "./pages/Jobs/JobPage";

const App = () => {
  const { theme, isAuth, role, startTokenRefreshLoop } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);

    if (isAuth) startTokenRefreshLoop(); // auto refresh if logged in
  }, [theme, isAuth, startTokenRefreshLoop]);

  return (
    <BrowserRouter>
      <Navbar />
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
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
        {/*Public routes*/}
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/companies/:slug" element={<CompanyPage />} />
        {/* Public Jobs */}
        <Route path="/jobs" element={<JobsList />} />

        {/* Job Details Page */}
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:slug" element={<JobPage />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
};

export default App;
