function formatCompact(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export default function RevenueChart({ weeklyRevenue }) {
  const maxValue = Math.max(...weeklyRevenue.map((entry) => entry.amount), 1);

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Weekly Revenue</h2>
      </div>
      <div className="admin-revenue-chart">
        {weeklyRevenue.map((entry, index) => {
          const height = `${Math.round((entry.amount / maxValue) * 100)}%`;
          return (
            <div className="admin-chart-col" key={entry.day}>
              <div className="admin-chart-track">
                <div
                  className="admin-chart-bar"
                  style={{ height, animationDelay: `${index * 80}ms` }}
                  title={`${entry.day}: ${entry.amount}`}
                />
              </div>
              <span>{entry.day}</span>
              <strong>{formatCompact(entry.amount)}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
