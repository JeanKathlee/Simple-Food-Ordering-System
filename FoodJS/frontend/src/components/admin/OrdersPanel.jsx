function formatDate(value) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrdersPanel({
  orders,
  statusOptions,
  filters,
  onFilterChange,
  title = "Order Management",
  showFilters = true,
  isAdmin = false,
  onUpdateStatus,
  onDeleteOrder,
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>{title}</h2>
      </div>

      {showFilters ? (
        <div className="admin-order-filters">
          <label>
            <span>From</span>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) => onFilterChange("fromDate", event.target.value)}
            />
          </label>

          <label>
            <span>To</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) => onFilterChange("toDate", event.target.value)}
            />
          </label>

          <label>
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => onFilterChange("status", event.target.value)}
            >
              <option value="All">All</option>
              {statusOptions.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Customer Filter</span>
            <input
              type="text"
              placeholder="Filter by customer"
              value={filters.customer}
              onChange={(event) => onFilterChange("customer", event.target.value)}
            />
          </label>

          <label>
            <span>Search</span>
            <input
              type="text"
              placeholder="Order ID or customer"
              value={filters.search}
              onChange={(event) => onFilterChange("search", event.target.value)}
            />
          </label>
        </div>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Items</th>
              <th>Total</th>
              <th>Created</th>
              {isAdmin && <th>Update</th>}
              {isAdmin && <th>Delete</th>}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 6} className="admin-empty-cell">
                  No orders match the selected filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>
                    <span className={`admin-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.itemCount}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  {isAdmin && (
                    <td>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value && onUpdateStatus) {
                            onUpdateStatus(order.id, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        style={{
                          padding: "6px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        <option value="">Change...</option>
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  )}
                  {isAdmin && (
                    <td>
                      <button
                        type="button"
                        onClick={() => onDeleteOrder && onDeleteOrder(order.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ff4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
