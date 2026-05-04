import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const session = getAuthSession();
        const token = session?.token;
        
        if (!token) {
          navigate("/menu");
          return;
        }

        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.reverse());
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  const filteredOrders = orders.filter((order) => {
    // by order ID
    if (searchId && !order.id.includes(searchId)) {
      return false;
    }

    // by customer name
    if (searchName && !order.customerName.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // by status
    if (filterStatus !== "All" && order.status !== filterStatus) {
      return false;
    }

    // by date range
    const orderDate = new Date(order.createdAt);
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      if (orderDate < fromDate) return false;
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59);
      if (orderDate > toDate) return false;
    }

    return true;
  });

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/menu")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => navigate("/menu")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Home
        </button>
      </div>
      <h1>Order History</h1>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Search & Filter</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Order ID</label>
            <input
              type="text"
              placeholder="Search by order ID (e.g., O-1001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Customer Name</label>
            <input
              type="text"
              placeholder="Search by customer name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option>All</option>
              <option>Pending</option>
              <option>Preparing</option>
              <option>Ready</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
          </div>
        </div>

        <p style={{ margin: "15px 0 0 0", fontSize: "12px", color: "#666" }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>
            {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => navigate("/menu")}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Start Ordering
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/order-tracking/${order.id}`)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <p style={{ margin: "0", fontWeight: "bold", fontSize: "16px" }}>Order {order.id}</p>
                  <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "12px" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0", fontWeight: "bold", fontSize: "16px" }}>
                    {formatPrice(order.total)}
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      padding: "4px 8px",
                      backgroundColor:
                        order.status === "Delivered"
                          ? "#c8e6c9"
                          : order.status === "Ready"
                          ? "#fff9c4"
                          : "#e0e0e0",
                      color:
                        order.status === "Delivered"
                          ? "#2e7d32"
                          : order.status === "Ready"
                          ? "#f57f17"
                          : "#424242",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {order.status}
                  </p>
                </div>
              </div>

              <div style={{ fontSize: "12px", color: "#666" }}>
                <p style={{ margin: "5px 0" }}>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} • {order.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
