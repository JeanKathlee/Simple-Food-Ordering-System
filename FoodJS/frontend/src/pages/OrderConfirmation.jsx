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
    return <div className="page-loading">Loading...</div>;
  }

  if (!order) {
    return <div className="page-loading">Order not found</div>;
  }

  return (
    <div className="client-page order-page">
      <div className="client-shell">
        <header className="page-topbar">
          <div>
            <h1>Order Confirmed</h1>
            <p>Your meal is on the way. Save this order ID for tracking.</p>
          </div>
          <div className="page-actions">
            <button className="client-btn ghost" onClick={() => navigate("/")}>Home</button>
          </div>
        </header>

        <section className="panel-card order-highlight">
          <div>
            <h2>✓ Order Confirmed!</h2>
            <p>Thank you for your order.</p>
          </div>
          <span className="status-pill pending">{order.status}</span>
        </section>

        <section className="panel-card order-details">
          <h3>Order Details</h3>
          <div className="order-detail-grid">
            <div>
              <span>Order ID</span>
              <strong>{order.id}</strong>
            </div>
            <div>
              <span>Customer</span>
              <strong>{order.customerName}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{order.paymentMethod}</strong>
            </div>
          </div>
        </section>

        <section className="panel-card">
          <h3>Items</h3>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="order-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <p>Qty: {item.quantity}</p>
                </div>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="order-total-row">
            <span>Total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </section>

        <div className="order-actions">
          <button className="client-btn primary" onClick={() => navigate(`/order-tracking/${order.id}`)}>
            Track Order
          </button>
          <button className="client-btn ghost" onClick={() => navigate("/menu")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
