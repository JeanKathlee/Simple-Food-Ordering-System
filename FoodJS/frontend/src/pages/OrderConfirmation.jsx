import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        navigate("/menu");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

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
          onClick={() => navigate("/")}
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
      <div style={{ backgroundColor: "#e8f5e9", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h1 style={{ color: "#2e7d32", margin: "0" }}>✓ Order Confirmed!</h1>
        <p style={{ color: "#558b2f", margin: "5px 0" }}>Thank you for your order</p>
      </div>

      <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Status:</strong> <span style={{ color: "#ff9800", fontWeight: "bold" }}>{order.status}</span></p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Items</h3>
        {order.items.map((item) => (
          <div key={item.menuItemId} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd" }}>
            <div>
              <strong>{item.name}</strong>
              <p style={{ fontSize: "12px", color: "#666", margin: "3px 0" }}>Qty: {item.quantity}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#fff9c4", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold" }}>
          <span>Total:</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => navigate(`/order-tracking/${order.id}`)}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Track Order
        </button>
        <button
          onClick={() => navigate("/menu")}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#757575",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
