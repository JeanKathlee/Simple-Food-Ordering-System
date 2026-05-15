export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn-light" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
