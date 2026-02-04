import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-3 text-danger">404</h1>
      <h2 className="mb-3">Page Not Found</h2>
      <p className="lead">Oops! The page you are looking for doesn’t exist.</p>
      <Link className="btn btn-primary mt-3" to="/">
        🏡 Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
