import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchMenuFromBackend, enrichMenuWithImages, formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function ProductDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = useParams();
  const [item, setItem] = useState(location.state?.item || null);
  const [quantity, setQuantity] = useState(1);
  const [choice, setChoice] = useState("Go Regular Iced Tea");
  const [loading, setLoading] = useState(!item);

  const choiceOptions = [
    { label: "Go Large Iced Tea", addOn: 50 },
    { label: "Go Medium Iced Tea", addOn: 45 },
    { label: "Go Regular Iced Tea", addOn: 0 },
  ];

  useEffect(() => {
    if (item || !name) return;

    const loadItem = async () => {
      try {
        const items = await fetchMenuFromBackend();
        const enhanced = enrichMenuWithImages(items);
        const decodedName = decodeURIComponent(name);
        const found = enhanced.find((i) => i.name === decodedName);
        setItem(found || null);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [name, item]);

  if (!item) {
    return (
      <div className="product-page">
        <div className="product-page-header" />
        <div className="product-page-missing">
          <h2>Product not found.</h2>
          <button type="button" onClick={() => navigate("/menu")}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const selectedChoice = choiceOptions.find((option) => option.label === choice) || choiceOptions[2];
  const itemTotal = (item.price + selectedChoice.addOn) * quantity;

  const handleAddToBag = async () => {
    setLoading(true);
    try {
      const session = getAuthSession();
      const token = session?.token;
      
      if (!token) {
        alert("Please log in to add items to cart");
        setLoading(false);
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
          price: item.price + selectedChoice.addOn,
          quantity,
          selectedChoice: choice,
        }),
      });

      if (response.ok) {
        navigate("/menu");
      } else {
        const error = await response.json();
        console.error("Failed to add to cart:", response.status, error);
        alert(error?.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Error adding item to cart: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-page">
      <header className="product-top-nav">
        <div className="product-top-left">
          <h1>FoodJS</h1>
          <button type="button">Select your address</button>
        </div>
        <div className="product-top-right">
          <button type="button" onClick={() => navigate("/menu")}>Menu</button>
          <button type="button" className="product-order-now" onClick={() => navigate("/checkout")}>
            Order Now
          </button>
        </div>
      </header>

      <section className="product-page-content">
        <div className="product-title-strip">
          <button type="button" className="product-back-link" onClick={() => navigate("/menu")}>
            ←
          </button>
          <h2>Product details</h2>
        </div>

        <div className="product-structure-card">
          <div className="product-left">
            <img src={item.image} alt={item.name} className="product-main-image" />
          </div>

          <div className="product-right">
            <div className="product-heading-row">
              <h3>{item.name}</h3>
              <strong>{formatPrice(item.price)}</strong>
            </div>

            <div className="product-choice-block">
              <h4>Choice A*</h4>
              <p>Select 1 option</p>

              <div className="choice-list">
                {choiceOptions.map((option) => (
                  <label key={option.label} className="choice-row">
                    <div>
                      <input
                        type="radio"
                        name="drink-choice"
                        checked={choice === option.label}
                        onChange={() => setChoice(option.label)}
                      />
                      <span>{option.label}</span>
                    </div>
                    <em>{option.addOn > 0 ? `+ ${formatPrice(option.addOn)}` : "Included"}</em>
                  </label>
                ))}
              </div>
            </div>

            <div className="product-action-row">
              <div className="product-qty-row">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>
                  +
                </button>
              </div>

              <button 
                type="button" 
                className="product-add-bag" 
                onClick={handleAddToBag}
                disabled={loading}
              >
                {loading ? "Adding..." : `Add To Cart - ${formatPrice(itemTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}