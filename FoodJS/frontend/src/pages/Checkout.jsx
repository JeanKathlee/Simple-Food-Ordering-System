import { useMemo, useState } from "react";
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

export default function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [couponCode, setCouponCode] = useState("");
  const cartItems = useMemo(() => readCart(), []);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const total = subtotal;

  function handlePlaceOrder() {
    // Clear any previous order ID so OrderTracking generates a fresh one
    sessionStorage.removeItem("foodjs-order-id");
    navigate("/order-tracking");
  }

  return (
    <div className="checkout-view">
      <div className="checkout-topbar">
        <h1>Checkout</h1>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="checkout-layout">
        <section className="checkout-left">
          <article className="checkout-card">
            <h2>Contact Details</h2>

            <div className="checkout-name-row">
              <label>
                <span>First Name</span>
                <input value="Juan" readOnly />
              </label>
              <label>
                <span>Last Name</span>
                <input value="Dela Cruz" readOnly />
              </label>
            </div>

            <label className="checkout-single-input">
              <span>Mobile Number</span>
              <input value="+63 931845632" readOnly />
            </label>
          </article>

          <article className="checkout-card">
            <h2>Pick-up (Friday, 12:34 am)</h2>
            <p className="checkout-muted">Pick-up at McDonald's Cebu Northroad</p>

            <p className="checkout-field-label">Payment Method</p>
            <div className="checkout-payment-row">
              <button
                type="button"
                className={`checkout-payment ${paymentMethod === "cash" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                <strong>Cash</strong>
                <span>Pay on pick-up</span>
              </button>

              <button
                type="button"
                className={`checkout-payment ${paymentMethod === "debit" ? "active" : ""}`}
                onClick={() => setPaymentMethod("debit")}
              >
                <strong>Debit Card</strong>
                <span>**** 1234</span>
              </button>
            </div>

            <p className="checkout-field-label">Address</p>
            <textarea className="checkout-address" value="Colon, Cebu City" readOnly />

            <p className="checkout-field-label">Discount / Coupon</p>
            <div className="checkout-coupon-row">
              <input
                placeholder="Enter code (ex: SAVE10)"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
              <button type="button">Apply</button>
            </div>

            <div className="checkout-footer-row">
              <div>
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button type="button" disabled={!cartItems.length} onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div>
          </article>
        </section>

        <aside className="checkout-right">
          <article className="checkout-summary-card">
            <h2>Order Summary</h2>

            <div className="checkout-summary-list">
              {!cartItems.length && <p className="checkout-empty">No items in bag yet.</p>}

              {cartItems.map((item) => (
                <div key={item.name} className="checkout-summary-item">
                  <div>
                    <h3>
                      x{item.quantity} {item.name}
                    </h3>
                    <p>
                      {item.selectedChoice || item.selectedDrink || "Meal option"}
                      {item.selectedSize ? ` ${item.selectedSize}` : ""}
                    </p>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-total">
              <div>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div>
                <strong>Total</strong>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}