import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
          path="/order-tracking"
          element={
            <CustomerRoute>
              <OrderTracking />
            </CustomerRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}