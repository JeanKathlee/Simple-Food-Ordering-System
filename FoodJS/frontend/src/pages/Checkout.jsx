import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    address: "",
  });

  // Load cart gikan API
  useEffect(() => {
    const loadData = async () => {
      try {
        const session = getAuthSession();
        const token = session?.token;
        if (!token) {
          return;
        }

        const cartResponse = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cartResponse.ok) {
          const data = await cartResponse.json();
          setCartItems(data || []);
        }

        // input form gamit user data
        if (session?.user) {
          const names = session.user.name.split(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: names[0] || "",
            lastName: names.slice(1).join(" ") || "",
          }));
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    const isValidFormat = /^[A-Z0-9]{4,12}$/.test(normalizedCode);

    if (!normalizedCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!isValidFormat) {
      setCouponError("Coupon must be 4-12 letters or numbers");
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode, orderAmount: subtotal }),
      });

      const result = await response.json();

      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount);
        setCouponError("");
      } else {
        setCouponError(result.error);
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      setCouponError("Error validating coupon");
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const total = subtotal - discountAmount;

  async function handlePlaceOrder() {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.mobileNumber || !formData.address) {
      alert("Please fill in all contact details");
      return;
    }

    setLoading(true);
    try {
      const session = getAuthSession();
      const token = session?.token;

      if (!token) {
        alert("Please log in to place an order");
        navigate("/login");
        return;
      }

      const customerFullName = `${formData.firstName} ${formData.lastName}`;

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          customerName: customerFullName,
          paymentMethod,
          couponCode: appliedCoupon?.code || null,
          discount: discountAmount,
          address: formData.address,
          mobileNumber: formData.mobileNumber,
        }),
      });

      if (response.ok) {
        const order = await response.json();

        await fetch("/api/cart", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          firstName: "",
          lastName: "",
          mobileNumber: "",
          address: "",
        });
        setCouponCode("");
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError("");

        navigate(`/order-confirmation/${order.id}`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-view client-page checkout-page">
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
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </label>
              <label>
                <span>Last Name</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </label>
            </div>

            <label className="checkout-single-input">
              <span>Mobile Number</span>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
              />
            </label>
          </article>

          <article className="checkout-card">
            <h2>Delivery Address</h2>

            <p className="checkout-field-label">Payment Method</p>
            <div className="checkout-payment-row">
              <button
                type="button"
                className={`checkout-payment ${paymentMethod === "cash" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cash")}
              >
                <strong>Cash</strong>
                <span>Pay on delivery</span>
              </button>

              <button
                type="button"
                className={`checkout-payment ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <strong>Credit Card</strong>
                <span>Online payment</span>
              </button>
            </div>

            <p className="checkout-field-label">Address</p>
            <textarea
              className="checkout-address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your delivery address"
            />

            <p className="checkout-field-label">Discount / Coupon</p>
            <div className="checkout-coupon-row">
              <input
                placeholder="Enter code (ex: SAVE10)"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
              <button type="button" onClick={handleApplyCoupon}>Apply</button>
            </div>
            {couponError && <p className="checkout-coupon-error">{couponError}</p>}
            {appliedCoupon && (
              <div className="checkout-coupon-success">
                <strong>✓ Coupon Applied!</strong>
                <p>{appliedCoupon.description}</p>
                <p className="checkout-coupon-savings">-{formatPrice(discountAmount)}</p>
              </div>
            )}

            <div className="checkout-footer-row">
              <div>
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button type="button" disabled={!cartItems.length || loading} onClick={handlePlaceOrder}>
                {loading ? "Placing Order..." : "Place Order"}
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
              {discountAmount > 0 && (
                <div style={{ color: "green" }}>
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
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