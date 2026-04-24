import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../lib/auth";

export default function CustomerMenuPlaceholder() {
  const navigate = useNavigate();
  const session = getAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard">
      <div className="topbar compact page-header">
        <h1>Customer Menu</h1>
        <div className="page-header-actions">
          <button className="btn-primary small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "28px" }}>
        <h2 style={{ marginBottom: "10px" }}>Hi, {session?.user?.name || "Customer"}</h2>
        <p style={{ color: "#666" }}>
          Menu screen placeholder. Customer menu and ordering flow will be added here.
        </p>
      </div>
    </div>
  );
}
