import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";

const Home = () => {
  const { isAuth } = useStore();

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-3">🏡 Welcome to the Home Page</h1>
      <p className="lead">
        {isAuth
          ? "You are logged in! Go to your dashboard to explore more."
          : "Please log in or register to access your dashboard."}
      </p>

      {!isAuth ? (
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link className="btn btn-primary" to="/login">
            🔑 Login
          </Link>
          <Link className="btn btn-secondary" to="/register">
            📝 Register
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <Link className="btn btn-success" to="/dashboard">
            🚀 Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
