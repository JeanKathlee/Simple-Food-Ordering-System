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
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
