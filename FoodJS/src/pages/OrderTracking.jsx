import { useNavigate } from "react-router-dom";

export default function OrderTracking() {
  const navigate = useNavigate();

  return (
    <div className="dashboard tracking-dashboard">
      <div className="topbar compact tracking-topbar page-header">
        <div className="tracking-heading">
          <h1>Order Tracking</h1>
        </div>

        <div className="page-header-actions">
          <button className="btn-primary small" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      <div className="tracking-page">
        <div className="tracking-left">
          <div className="card map-card tracking-map-card">
            <div className="tracking-map-header">
              <div>
                <p className="section-label">Delivery map</p>
                <h3>Colon, Cebu City</h3>
              </div>
              <span className="status-pill active">Preparing</span>
            </div>

            <iframe
              title="map"
              src="https://www.google.com/maps?q=Colon,Cebu,Philippines&z=15&output=embed"
              className="map-embed"
              loading="lazy"
            />
          </div>

          <div className="tracking-content-row">
            <div className="card order-details-card tracking-card">
              <div className="section-header">
                <div>
                  <p className="section-label">Order details</p>
                  <h3>Order #2145</h3>
                </div>
                <span className="status-pill">1 item</span>
              </div>

              <div className="order-table">
                <div className="table-row header">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>

                <div className="table-row">
                  <span>Cheeseburger</span>
                  <span>1</span>
                  <span>₱60.47</span>
                </div>

                <div className="table-row total-row tracking-total-row">
                  <span>Total</span>
                  <span />
                  <span>₱60.47</span>
                </div>
              </div>
            </div>

            <div className="delivery-card tracking-card delivery-card-compact">
              <p className="section-label light">Delivery info</p>
              <div className="tracking-meta-block">
                <p className="tracking-meta-label">Address</p>
                <p>123 Boulevard Avenue<br />Cebu City</p>
              </div>

              <div className="tracking-meta-block">
                <p className="tracking-meta-label">Driver</p>
                <p>Juan Dela Cruz</p>
              </div>

              <div className="tracking-meta-block">
                <p className="tracking-meta-label">ETA</p>
                <p>12 - 15 minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tracking-right tracking-panel">
          <div className="tracking-panel-header">
            <div>
              <p className="section-label">Status timeline</p>
              <h3>Current progress</h3>
            </div>
            <span className="status-pill active">In kitchen</span>
          </div>

          <div className="timeline">
            <div className="timeline-step active">
              <div className="timeline-dot"></div>
              <div className="timeline-title">Restaurant</div>
              <div className="timeline-sub">Order received</div>
            </div>

            <div className="timeline-step active">
              <div className="timeline-dot"></div>
              <div className="timeline-title">Processing</div>
              <div className="timeline-sub">Preparing your food</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-dot"></div>
              <div className="timeline-title">On the way</div>
              <div className="timeline-sub">Rider is heading to you</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-dot"></div>
              <div className="timeline-title">Delivered</div>
              <div className="timeline-sub">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}