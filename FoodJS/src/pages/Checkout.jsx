import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();

  return (
    <div className="dashboard checkout-wrapper">
      
      {/* TOPBAR */}
      <div className="topbar compact page-header">
        <h1>Checkout</h1>
        <div className="page-header-actions">
          <button className="btn-primary small" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="checkout-page compact">

        {/* LEFT */}
        <div className="checkout-main">

          {/* PROGRESS */}
          <div className="checkout-section small">
            <div className="checkout-progress">
              <span>✓ Cart</span>
              <span>✓ Shipping</span>
              <span className="active">Checkout</span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="checkout-section small">
            <p className="checkout-label">Payment Method</p>

            <div className="payment-card selected">
              <div>
                <h4>Cash</h4>
                <p>Pay on delivery</p>
              </div>
              <span>●</span>
            </div>

            <div className="payment-card">
              <div>
                <h4>Debit Card</h4>
                <p>**** 1234</p>
              </div>
              <span>○</span>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="checkout-section small">
            <p className="checkout-label">Delivery Address</p>
            <div className="address-box">
              Colon, Cebu City
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="checkout-sidebar">
          <div className="order-summary-card compact">

            <div>
              <h3>Order Summary</h3>

              <div className="summary-item">
                <span>Cheeseburger</span>
                <span>₱49.00</span>
              </div>

              <div className="summary-breakdown">
                <div>
                  <span>Delivery</span>
                  <span>₱19.00</span>
                </div>
                <div className="total-row">
                  <span>Total</span>
                  <span>₱68.00</span>
                </div>
              </div>
            </div>

            <button className="pay-btn">Pay Now</button>

          </div>
        </div>

      </div>
    </div>
  );
}