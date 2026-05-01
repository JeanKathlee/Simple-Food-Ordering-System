import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { clearAuthSession, getAuthSession } from "../lib/auth";
import {
  fetchMenuFromBackend,
  getCategoriesFromMenu,
  filterMenuByCategory,
  enrichMenuWithImages,
  formatPrice,
} from "../data/menuItems";

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [tabs, setTabs] = useState(["All"]);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sa menu and cart
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load menu gikan backend
        const items = await fetchMenuFromBackend();
        const enhancedItems = enrichMenuWithImages(items);
        setMenuItems(enhancedItems);
        
        const categories = getCategoriesFromMenu(enhancedItems);
        setTabs(categories);

        // Load cart gikan API
        const session = getAuthSession();
        const token = session?.token;
        if (token) {
          const cartResponse = await fetch("/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            setCartItems(cartData || []);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const visibleItems = useMemo(() => {
    const tabItems = filterMenuByCategory(menuItems, activeTab);

    if (!query.trim()) {
      return tabItems;
    }

    const keyword = query.toLowerCase();
    return tabItems.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.description && item.description.toLowerCase().includes(keyword))
    );
  }, [activeTab, query, menuItems]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const addToCart = async (item) => {
    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token) {
        alert("Please log in to add items to cart");
        return;
      }

      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to add to cart:", response.status, error);
        alert(error?.message || "Failed to add item to cart");
        return;
      }

      // Add or update in local state
      setCartItems((prev) => {
        const existing = prev.find((cart) => cart.menuItemId === item.id);
        if (existing) {
          return prev.map((cart) =>
            cart.menuItemId === item.id
              ? { ...cart, quantity: cart.quantity + 1 }
              : cart
          );
        }
        return [
          ...prev,
          {
            userId: session?.user?.id,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            selectedChoice: null,
          },
        ];
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Network error: " + err.message);
    }
  };

  const adjustQuantity = async (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(menuItemId);
      return;
    }

    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token) {
        alert("Please log in to update cart");
        return;
      }

      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update cart:", response.status, error);
        alert(error?.message || "Failed to update cart item");
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update cart:", err);
      alert("Network error: " + err.message);
    }
  };

  const removeFromCart = async (menuItemId) => {
    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token) {
        alert("Please log in to remove items from cart");
        return;
      }

      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to remove from cart:", response.status, error);
        alert(error?.message || "Failed to remove from cart");
        return;
      }

      setCartItems((prev) =>
        prev.filter((item) => item.menuItemId !== menuItemId)
      );
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      alert("Network error: " + err.message);
    }
  };

  const clearCart = async () => {
    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token) {
        alert("Please log in to clear cart");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to clear cart:", response.status, error);
        alert(error?.message || "Failed to clear cart");
        return;
      }

      setCartItems([]);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      alert("Network error: " + err.message);
    }
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
            <span className="customer-home-user">Hi, {getAuthSession()?.user?.name || "Customer"}</span>
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
              <article key={item.menuItemId} className="my-bag-item">
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price * item.quantity)}</p>
                <div className="my-bag-item-actions">
                  <button type="button" onClick={() => adjustQuantity(item.menuItemId, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => adjustQuantity(item.menuItemId, item.quantity + 1)}>
                    +
                  </button>
                  <button type="button" className="remove" onClick={() => removeFromCart(item.menuItemId)}>
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