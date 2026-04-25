import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatPrice, getMenuItemByName } from "../data/menuItems";

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

export default function ProductDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { name } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [choice, setChoice] = useState("Go Regular Iced Tea");

  const choiceOptions = [
    { label: "Go Large Iced Tea", addOn: 50 },
    { label: "Go Medium Iced Tea", addOn: 45 },
    { label: "Go Regular Iced Tea", addOn: 0 },
  ];

  const item = useMemo(() => {
    if (location.state?.item) {
      return location.state.item;
    }

    const decodedName = decodeURIComponent(name || "");
    return getMenuItemByName(decodedName);
  }, [location.state, name]);

  if (!item) {
    return (
      <div className="product-page">
        <div className="product-page-header" />
        <div className="product-page-missing">
          <h2>Product not found.</h2>
          <button type="button" onClick={() => navigate("/dashboard")}>Back to Menu</button>
        </div>
      </div>
    );
  }

  const selectedChoice = choiceOptions.find((option) => option.label === choice) || choiceOptions[2];
  const itemTotal = (item.price + selectedChoice.addOn) * quantity;

  const handleAddToBag = () => {
    const cartItems = readCart();
    const existing = cartItems.find((cartItem) => cartItem.name === item.name);

    const next = existing
      ? cartItems.map((cartItem) =>
          cartItem.name === item.name
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                selectedChoice: choice,
              }
            : cartItem
        )
      : [
          ...cartItems,
          {
            ...item,
            quantity,
            selectedChoice: choice,
          },
        ];

    writeCart(next);
    navigate("/dashboard");
  };

  return (
    <div className="product-page">
      <header className="product-top-nav">
        <div className="product-top-left">
          <h1>FoodJS</h1>
          <button type="button">Select your address</button>
        </div>
        <div className="product-top-right">
          <button type="button" onClick={() => navigate("/dashboard")}>Menu</button>
          <button type="button" className="product-order-now" onClick={() => navigate("/dashboard")}>
            Order Now
          </button>
        </div>
      </header>

      <section className="product-page-content">
        <div className="product-title-strip">
          <button type="button" className="product-back-link" onClick={() => navigate("/dashboard")}>
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

              <button type="button" className="product-add-bag" onClick={handleAddToBag}>
                Add To Cart - {formatPrice(itemTotal)}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
