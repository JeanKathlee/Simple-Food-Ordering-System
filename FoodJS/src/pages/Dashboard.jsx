import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../lib/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const session = useMemo(() => getAuthSession(), []);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">FoodJS</p>
          <h1>Dashboard</h1>
        </div>

        <button className="btn-primary dashboard-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-card">
          <h2>Welcome, {session?.user?.name || "User"}</h2>
          <p>You are logged in and can access protected screens.</p>
          <p><strong>Email:</strong> {session?.user?.email || "N/A"}</p>
          <p><strong>Role:</strong> {session?.user?.role || "N/A"}</p>
        </section>
      </main>
    </div>
  );
}
