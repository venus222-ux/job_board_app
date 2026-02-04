const Dashboard = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🏠 Welcome to your Dashboard</h2>
      <div className="row g-3">
        {[
          {
            icon: "bi-person-circle",
            title: "Profile",
            desc: "Edit your account information",
            color: "text-primary",
          },
          {
            icon: "bi-shield-lock",
            title: "Security",
            desc: "Update password and privacy settings",
            color: "text-success",
          },
          {
            icon: "bi-bar-chart-line",
            title: "Analytics",
            desc: "View your activity statistics",
            color: "text-warning",
          },
        ].map((card, idx) => (
          <div key={idx} className="col-md-4">
            <div className="card shadow-sm text-center p-3">
              <i className={`bi ${card.icon} fs-2 ${card.color}`}></i>
              <h5>{card.title}</h5>
              <p>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
