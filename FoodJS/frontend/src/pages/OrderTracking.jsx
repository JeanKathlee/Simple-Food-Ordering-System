import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data/menuItems";

const CART_STORAGE_KEY = "foodjs-cart";

function readCart() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OrderTracking() {
  const navigate = useNavigate();
  const cartItems = useMemo(() => {
    const stored = readCart();
    if (stored.length) {
      return stored;
    }

    return [
      {
        name: "Family Feast Combo",
        quantity: 1,
        price: 999,
        selectedChoice: "Pomegranate Cooler McFloat Medium",
      },
      {
        name: "Cheese Burger",
        quantity: 1,
        price: 129,
        selectedChoice: "Pomegranate Cooler McFloat Medium",
      },
    ];
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const orderId = useMemo(() => {
    const existing = sessionStorage.getItem("foodjs-order-id");
    if (existing) {
      return existing;
    }

    const generated = `#${Date.now()}`;
    sessionStorage.setItem("foodjs-order-id", generated);
    return generated;
  }, []);

  const historyItems = [
    { id: "#1777038239767", date: "4/24/2026, 9:45:30 PM", status: "Preparing", total: 1147 },
    { id: "#1777025146443", date: "4/24/2026, 6:05:16 PM", status: "On the way", total: 848 },
    { id: "#1777024895278", date: "4/24/2026, 6:01:34 PM", status: "On the way", total: 2245 },
    { id: "#1776956077785", date: "4/23/2026, 10:54:32 PM", status: "Delivered", total: 2815 },
    { id: "#1776584905231", date: "4/19/2026, 8:42:15 PM", status: "Delivered", total: 2586 },
  ];

  return (
    <div className="tracking-detailed-page">
      <div className="tracking-detailed-topbar">
        <span>Order Confirmation</span>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="tracking-detailed-confirm">
        <h1>Order Confirmation</h1>
        <p>Your order was placed successfully. Order {orderId} is now in progress.</p>
      </div>

      <div className="tracking-detailed-grid">
        <section className="tracking-column-main">
          <article className="tracking-card-box">
            <div className="tracking-title-row">
              <div>
                <p>DELIVERY MAP</p>
                <h2>Colon, Cebu City</h2>
              </div>
              <span>In Kitchen</span>
            </div>

            <iframe
              title="delivery-map"
              src="https://www.google.com/maps?q=Colon,Cebu,Philippines&z=14&output=embed"
              className="tracking-map-frame"
              loading="lazy"
            />
          </article>

          <div className="tracking-main-bottom">
            <article className="tracking-card-box">
              <div className="tracking-title-row simple">
                <div>
                  <p>ORDER DETAILS</p>
                  <h2>Order {orderId}</h2>
                </div>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
              </div>

              <div className="tracking-order-table">
                <div className="tracking-order-row head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>

                {cartItems.map((item) => (
                  <div key={item.name} className="tracking-order-row">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="tracking-order-row total">
                  <span>Total</span>
                  <span />
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button type="button" className="tracking-cancel-btn" disabled>
                Cancel Order
              </button>
            </article>

            <article className="tracking-delivery-panel">
              <p>DELIVERY INFO</p>

              <div>
                <h4>ADDRESS</h4>
                <strong>Colon, Cebu City</strong>
              </div>

              <div>
                <h4>DRIVER</h4>
                <strong>Juan Dela Cruz</strong>
              </div>

              <div>
                <h4>ETA</h4>
                <strong>12 - 15 minutes</strong>
              </div>
            </article>
          </div>

          <article className="tracking-card-box tracking-notif-box">
            <p>IN-APP NOTIFICATIONS</p>
            <ul>
              <li>{orderId} is now Delivered</li>
              <li>{orderId} is now Preparing</li>
              <li>{orderId} is now On the way</li>
              <li>Small and SMS notifications are backend managed.</li>
            </ul>
          </article>
        </section>

        <section className="tracking-column-status">
          <article className="tracking-card-box">
            <div className="tracking-title-row">
              <div>
                <p>STATUS TIMELINE</p>
                <h2>Current progress</h2>
              </div>
              <span>In Kitchen</span>
            </div>

            <div className="tracking-steps">
              <div className="tracking-step active">
                <div className="dot" />
                <div>
                  <h3>Restaurant</h3>
                  <p>Order received</p>
                </div>
              </div>
              <div className="tracking-step active">
                <div className="dot" />
                <div>
                  <h3>Processing</h3>
                  <p>Preparing your food</p>
                </div>
              </div>
              <div className="tracking-step">
                <div className="dot" />
                <div>
                  <h3>On the way</h3>
                  <p>Rider is heading to you</p>
                </div>
              </div>
              <div className="tracking-step">
                <div className="dot" />
                <div>
                  <h3>Delivered</h3>
                  <p>Completed</p>
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className="tracking-column-history">
          <article className="tracking-card-box">
            <p>ORDER HISTORY</p>
            <h2>Past orders</h2>

            <input placeholder="Search Order ID" />
            <select defaultValue="All Status">
              <option>All Status</option>
              <option>Preparing</option>
              <option>On the way</option>
              <option>Delivered</option>
            </select>
            <input placeholder="mm/dd/yyyy" />

            <div className="tracking-history-list">
              {historyItems.map((entry) => (
                <div className="tracking-history-item" key={entry.id}>
                  <div>
                    <h3>Order {entry.id}</h3>
                    <p>{entry.date}</p>
                  </div>
                  <div>
                    <p>{entry.status}</p>
                    <strong>{formatPrice(entry.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}