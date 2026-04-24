function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AnalyticsCards({ stats, topItems }) {
  return (
    <section className="admin-analytics-grid">
      <article className="admin-stat-card">
        <p>Total Orders Today</p>
        <h3>{stats.totalOrdersToday}</h3>
        <span>{stats.pendingOrders} pending now</span>
      </article>

      <article className="admin-stat-card">
        <p>Revenue Today</p>
        <h3>{formatCurrency(stats.revenueToday)}</h3>
        <span>{stats.weeklyTrend}% vs last week</span>
      </article>

      <article className="admin-stat-card">
        <p>Completed Orders</p>
        <h3>{stats.completedOrders}</h3>
        <span>{stats.cancelledOrders} cancelled</span>
      </article>

      <article className="admin-stat-card">
        <p>Popular Item</p>
        <h3>{topItems[0]?.name || "-"}</h3>
        <span>{topItems[0]?.soldCount || 0} sold</span>
      </article>
    </section>
  );
}
