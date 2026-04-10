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
    <div className="dashboard">
      {/* HEADER */}
      <div className="topbar">
        <h1>Dashboard</h1>
        <button className="btn-primary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card">
          <p>Total Orders</p>
          <h2>1,280</h2>
          <span>↑ 12.4%</span>
        </div>

        <div className="stat-card">
          <p>Total Revenue</p>
          <h2>₱ 84.1K</h2>
          <span>↑ 8.1%</span>
        </div>

        <div className="stat-card">
          <p>New Customers</p>
          <h2>348</h2>
          <span>↑ 5.3%</span>
        </div>

        <div className="stat-card">
          <p>Cancelled</p>
          <h2>27</h2>
          <span>↑ 2.1%</span>
        </div>
      </div>

      {/* HIGHLIGHT BAR */}
      <div className="highlight">
        <div>
          <p>Today’s Revenue</p>
          <h2>₱ 20,899</h2>
          <span>↑ 21% vs yesterday</span>
        </div>

        <div>
          <p>Active Orders</p>
          <h2>51</h2>
          <span>30 in delivery • 21 preparing</span>
        </div>

        <div>
          <p>Average Delivery Time</p>
          <h2>25 minutes</h2>
          <span>↑ 30%</span>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid">
        {/* RECENT ORDERS */}
        <div className="card orders">
          <h3>Recent Orders</h3>
          <ul>
            <li>#101 Maria Santos — Cheeseburger ₱49.00</li>
            <li>#102 Juan Cruz — Fries ₱35.00</li>
            <li>#103 Ana Reyes — Burger ₱60.00</li>
            <li>#104 Mark Lee — Combo ₱120.00</li>
          </ul>
        </div>

        {/* CHART */}
        <div className="card chart">
          <h3>Orders Overview</h3>
          <div className="chart-circle">1,284</div>
          <p className="chart-label">orders</p>
        </div>

        {/* TOP ITEMS */}
        <div className="card menu">
          <h3>Top Menu Items</h3>

          <div className="menu-item">
            <span>🍔 Cheeseburger</span>
            <b>₱40</b>
          </div>

          <div className="menu-item">
            <span>🍗 Fried Chicken Burger</span>
            <b>₱60</b>
          </div>

          <div className="menu-item">
            <span>🥗 Veggie Burger</span>
            <b>₱45</b>
          </div>

          <div className="menu-item">
            <span>🍟 Double Smash</span>
            <b>₱75</b>
          </div>
        </div>
      </div>
    </div>
  );
}