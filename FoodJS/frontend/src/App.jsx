import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationContainer } from "./components/NotificationContainer";
import { getUserRole, isAuthenticated } from "./lib/auth";

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() !== "admin") {
    return <Navigate to="/menu" replace />;
  }

  return children;
}

function CustomerRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <NotificationContainer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <CustomerRoute>
              <Menu />
            </CustomerRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <CustomerRoute>
              <Cart />
            </CustomerRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <CustomerRoute>
              <Checkout />
            </CustomerRoute>
          }
        />
        <Route
          path="/product/:name"
          element={
            <CustomerRoute>
              <ProductDetails />
            </CustomerRoute>
          }
        />
        <Route
          path="/order-tracking/:orderId"
          element={
            <CustomerRoute>
              <OrderTracking />
            </CustomerRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <CustomerRoute>
              <OrderConfirmation />
            </CustomerRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <CustomerRoute>
              <OrderHistory />
            </CustomerRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <CustomerRoute>
              <Profile />
            </CustomerRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}