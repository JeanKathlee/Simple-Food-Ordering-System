import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../data/menuItems";
import { getAuthSession } from "../lib/auth";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const session = getAuthSession();
        const token = session?.token;

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data || []);
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [navigate]);

  const adjustQuantity = async (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(menuItemId);
      return;
    }

    try {
      const session = getAuthSession();
      const token = session?.token;

      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.menuItemId === menuItemId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const removeFromCart = async (menuItemId) => {
    try {
      const session = getAuthSession();
      const token = session?.token;

      const response = await fetch(`/api/cart/items/${menuItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCartItems((prev) =>
          prev.filter((item) => item.menuItemId !== menuItemId)
        );
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      const session = getAuthSession();
      const token = session?.token;

      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "30px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/menu")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Menu
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 12px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Home
        </button>
      </div>

      <h1>My Cart</h1>

      {cartItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            Your cart is empty
          </p>
          <button
            onClick={() => navigate("/menu")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Start Adding Items
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div style={{ marginBottom: "30px" }}>
            {cartItems.map((item) => (
              <div
                key={item.menuItemId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  border: "1px solid #eee",
                }}
              >
                <div>
                  <p style={{ margin: "0", fontWeight: "bold", fontSize: "16px" }}>
                    {item.name}
                  </p>
                  <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
                    {formatPrice(item.price)} each
                  </p>
                </div>

                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "0 8px",
                    }}
                  >
                    <button
                      onClick={() =>
                        adjustQuantity(item.menuItemId, item.quantity - 1)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "4px",
                      }}
                    >
                      −
                    </button>
                    <span style={{ padding: "0 8px", minWidth: "30px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        adjustQuantity(item.menuItemId, item.quantity + 1)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: "4px",
                      }}
                    >
                      +
                    </button>
                  </div>

                  <p
                    style={{
                      margin: "0",
                      fontWeight: "bold",
                      fontSize: "16px",
                      minWidth: "100px",
                      textAlign: "right",
                    }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: "#fff9c4",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Clear Cart
            </button>
          </div>

          <button
            onClick={() => navigate("/menu")}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#757575",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Continue Shopping
          </button>
        </>
      )}
    </div>
  );
}
