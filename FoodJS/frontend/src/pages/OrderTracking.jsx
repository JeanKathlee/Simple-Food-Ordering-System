import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token || !orderId) {
        navigate("/menu");
        return;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        navigate("/menu");
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    
    // matic update every5 seconds
    const interval = setInterval(loadOrder, 5000);
    
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const session = getAuthSession();
      const token = session?.token;

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const updated = await response.json();
        setOrder(updated);
        alert("Order cancelled successfully");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Error: " + err.message);
    }
  };

  const canCancel = order && (order.status === "Pending" || order.status === "Preparing");
  const statusSteps = ["Pending", "Preparing", "Ready", "Delivered"];
  const currentStatusIndex = statusSteps.indexOf(order?.status || "Pending");

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  if (!order) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Order not found</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "30px" }}>
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
      <h1>Order Tracking</h1>
      <p><strong>Order ID:</strong> {order.id}</p>

      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          {statusSteps.map((step, index) => (
            <div key={step} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  margin: "0 auto 8px",
                  backgroundColor: index <= currentStatusIndex ? "#4caf50" : "#ddd",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {index <= currentStatusIndex ? "✓" : index + 1}
              </div>
              <p style={{ fontSize: "12px", margin: "0", fontWeight: index === currentStatusIndex ? "bold" : "normal" }}>
                {step}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            height: "3px",
            backgroundColor: "#ddd",
            position: "relative",
            marginTop: "-25px",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#4caf50",
              width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 5px 0" }}>Current Status</h3>
        <p style={{ margin: "0", fontSize: "18px", color: "#1976d2" }}>{order.status}</p>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Order Details</h3>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Payment:</strong> {order.paymentMethod}</p>
        <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Items</h3>
        {order.items.map((item) => (
          <div key={item.menuItemId} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd" }}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ fontSize: "12px", color: "#666", margin: "3px 0" }}>Qty: {item.quantity}</p>
            </div>
            <div>{formatPrice(item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#fff9c4", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold" }}>
          <span>Total:</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {canCancel && (
        <button
          onClick={handleCancelOrder}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Cancel Order
        </button>
      )}

      <button
        onClick={() => navigate("/order-history")}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#757575",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        View All Orders
      </button>
    </div>
  );
}