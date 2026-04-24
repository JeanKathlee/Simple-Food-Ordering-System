import { useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  price: "",
  prepTime: "",
  isAvailable: true,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MenuManagement({
  categories,
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    categoryId: categories[0]?.id || "",
  });
  const [editId, setEditId] = useState(null);

  const groupedItems = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      items: menuItems.filter((item) => item.categoryId === category.id),
    }));
  }, [categories, menuItems]);

  const handleInput = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id || "",
    });
  };

  const submitForm = (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      prepTime: Number(form.prepTime),
      isAvailable: form.isAvailable,
    };

    if (!payload.name || !payload.categoryId || payload.price <= 0 || payload.prepTime <= 0) {
      return;
    }

    if (editId) {
      onUpdateMenuItem(editId, payload);
    } else {
      onAddMenuItem(payload);
    }

    resetForm();
  };

  const beginEdit = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      price: String(item.price),
      prepTime: String(item.prepTime),
      isAvailable: item.isAvailable,
    });
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Menu Management</h2>
      </div>

      <form className="admin-form-grid" onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Menu item name"
          value={form.name}
          onChange={(event) => handleInput("name", event.target.value)}
        />

        <select
          value={form.categoryId}
          onChange={(event) => handleInput("categoryId", event.target.value)}
        >
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Price"
          value={form.price}
          onChange={(event) => handleInput("price", event.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Prep time (min)"
          value={form.prepTime}
          onChange={(event) => handleInput("prepTime", event.target.value)}
        />

        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(event) => handleInput("isAvailable", event.target.checked)}
          />
          <span>Available</span>
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            {editId ? "Save Item" : "Add Item"}
          </button>
          {editId ? (
            <button
              type="button"
              className="admin-btn admin-btn-light"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="admin-grid-columns">
        {groupedItems.map((category) => (
          <article key={category.id} className="admin-subcard">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <ul className="admin-item-list">
              {category.items.length === 0 ? (
                <li className="admin-empty-item">No items in this category yet.</li>
              ) : (
                category.items.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {formatCurrency(item.price)} | {item.prepTime} min |{" "}
                        {item.isAvailable ? "Available" : "Hidden"}
                      </span>
                    </div>
                    <div className="admin-item-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-light"
                        onClick={() => beginEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => onDeleteMenuItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
