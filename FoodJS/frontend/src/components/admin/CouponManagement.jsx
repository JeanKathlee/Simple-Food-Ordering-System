import { useState } from "react";

const EMPTY_COUPON = {
  code: "",
  discount: "",
  discountType: "percentage",
  minOrderAmount: "",
  maxUses: "",
};

export default function CouponManagement({ coupons, onAddCoupon, onUpdateCoupon, onDeleteCoupon }) {
  const [form, setForm] = useState(EMPTY_COUPON);
  const [editId, setEditId] = useState(null);

  const reset = () => {
    setForm(EMPTY_COUPON);
    setEditId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code || !form.discount) return;

    const payload = {
      code: form.code.toUpperCase(),
      discount: parseFloat(form.discount),
      discountType: form.discountType,
      minOrderAmount: parseFloat(form.minOrderAmount) || 0,
      maxUses: form.maxUses === "" ? -1 : parseInt(form.maxUses),
      description: `${form.discountType === "percentage" ? form.discount + "%" : "₹" + form.discount} off`,
    };

    if (editId) {
      onUpdateCoupon(editId, payload);
    } else {
      onAddCoupon(payload);
    }
    reset();
  };

  const handleEdit = (coupon) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
    });
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Coupon Management</h2>
      </div>

      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Code (e.g., SAVE10)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          maxLength="20"
        />

        <input
          type="number"
          placeholder="Discount amount"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          min="0"
        />

        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed (₹)</option>
        </select>

        <input
          type="number"
          placeholder="Min order amount"
          value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          min="0"
        />

        <input
          type="number"
          placeholder="Max uses (-1 for unlimited)"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          min="-1"
        />

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            {editId ? "Update Coupon" : "Add Coupon"}
          </button>
          {editId && (
            <button type="button" className="admin-btn admin-btn-light" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="admin-category-list">
        {coupons.map((coupon) => (
          <li key={coupon.id}>
            <div>
              <h3>{coupon.code}</h3>
              <p>{coupon.description}</p>
              <span>Min: ₹{coupon.minOrderAmount} | Uses: {coupon.maxUses === -1 ? "∞" : coupon.usedCount + "/" + coupon.maxUses}</span>
            </div>
            <div className="admin-item-actions">
              <button
                type="button"
                className="admin-btn admin-btn-light"
                onClick={() => handleEdit(coupon)}
              >
                Edit
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => onDeleteCoupon(coupon.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
