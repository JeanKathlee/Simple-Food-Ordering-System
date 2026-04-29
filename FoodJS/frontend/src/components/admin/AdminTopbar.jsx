export default function AdminTopbar({ onLogout, adminName, syncLabel }) {
  return (
    <header className="admin-topbar">
      <div>
        <h1>Restaurant Admin Dashboard</h1>
        <p>Track orders, menu, and categories in one workspace.</p>
      </div>

      <div className="admin-topbar-actions">
        <span className="sync-pill">{syncLabel}</span>
        <span className="admin-avatar">{adminName.slice(0, 1).toUpperCase()}</span>
        <button type="button" className="admin-btn admin-btn-dark" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
