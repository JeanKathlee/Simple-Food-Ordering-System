import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { clearAuthSession, getAuthSession } from "../lib/auth";
import { formatPrice, menuItems, tabs } from "../data/menuItems";

const CART_STORAGE_KEY = "foodjs-cart";

function readCart() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(cartItems) {
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const session = useMemo(() => getAuthSession(), []);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [cartItems, setCartItems] = useState(() => readCart());

  const visibleItems = useMemo(() => {
    const tabItems =
      activeTab === "All" ? menuItems : menuItems.filter((item) => item.category === activeTab);

    if (!query.trim()) {
      return tabItems;
    }

    const keyword = query.toLowerCase();
    return tabItems.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
    );
  }, [activeTab, query]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  useEffect(() => {
    writeCart(cartItems);
  }, [cartItems]);

  const adjustQuantity = (name, change) => {
    setCartItems((previous) =>
      previous
        .map((item) => (item.name === name ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (name) => {
    setCartItems((previous) => previous.filter((item) => item.name !== name));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const hasCartItems = cartItems.length > 0;

  return (
    <div className="customer-home-page">
      <section className="customer-home-hero">
        <div className="customer-home-toprow">
          <div className="customer-home-brand">
            <img src={logo} alt="FoodJS" />
            <div>
              <h1>FoodJS</h1>
              <p>Choose your favorites and order fast.</p>
            </div>
          </div>

          <div className="customer-home-actions">
            <span className="customer-home-user">Hi, {session?.name || "Customer"}</span>
            <button type="button" className="customer-home-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="customer-search-wrap">
          <input
            className="customer-search"
            type="search"
            placeholder="Search menu"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="customer-search-icon">⌕</span>
        </div>

        <div className="customer-chip-row">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`customer-chip ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      <section className={`customer-layout ${hasCartItems ? "with-bag" : ""}`}>
        <div className="customer-main">
          <div className="customer-grid-wrap">
            <div className="customer-grid">
              {visibleItems.map((item) => (
                <article
                  key={item.name}
                  className="customer-card"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/product/${encodeURIComponent(item.name)}`, {
                      state: { item },
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/product/${encodeURIComponent(item.name)}`, {
                        state: { item },
                      });
                    }
                  }}
                >
                  <img src={item.image} alt={item.name} className="customer-card-image" />
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <strong>{formatPrice(item.price)}</strong>
                  <button
                    type="button"
                    className="customer-add-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/product/${encodeURIComponent(item.name)}`, {
                        state: { item },
                      });
                    }}
                    aria-label={`Add ${item.name}`}
                  >
                    +
                  </button>
                </article>
              ))}
            </div>

            {!visibleItems.length && (
              <div className="customer-empty-state">
                <h2>No matches found.</h2>
                <p>Try a different keyword or category.</p>
              </div>
            )}
          </div>
        </div>

        {hasCartItems && <aside className="my-bag-panel">
          <div className="my-bag-header-row">
            <h2>My Bag</h2>
            <div className="my-bag-meta">
              <span>{cartCount} item{cartCount === 1 ? "" : "s"}</span>
              <button type="button" onClick={clearCart} disabled={!cartItems.length}>
                Delete All
              </button>
            </div>
          </div>

          <div className="my-bag-list">
            {cartItems.map((item) => (
              <article key={item.name} className="my-bag-item">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price * item.quantity)}</p>
                <div className="my-bag-item-actions">
                  <button type="button" onClick={() => adjustQuantity(item.name, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => adjustQuantity(item.name, 1)}>
                    +
                  </button>
                  <button type="button" className="remove" onClick={() => removeFromCart(item.name)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="my-bag-total">
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <button type="button" disabled={!cartItems.length} onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </aside>}
      </section>
    </div>
  );
}