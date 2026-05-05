import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../lib/auth";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import AnalyticsCards from "../components/admin/AnalyticsCards";
import RevenueChart from "../components/admin/RevenueChart";
import OrdersPanel from "../components/admin/OrdersPanel";
import MenuManagement from "../components/admin/MenuManagement";
import CategoryManagement from "../components/admin/CategoryManagement";
import PopularItems from "../components/admin/PopularItems";
import ConfirmModal from "../components/admin/ConfirmModal";
import "../dashboard.css";

const DEFAULT_STATUS_OPTIONS = ["Pending", "Preparing", "Ready", "Cancelled", "Delivered"];
const DEFAULT_WEEKLY_REVENUE = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 0 },
  { day: "Thu", amount: 0 },
  { day: "Fri", amount: 0 },
  { day: "Sat", amount: 0 },
  { day: "Sun", amount: 0 },
];

function matchesDate(dateValue, fromDate, toDate) {
  const value = new Date(dateValue).getTime();

  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
    if (value < from) {
      return false;
    }
  }

  if (toDate) {
    const to = new Date(`${toDate}T23:59:59.000Z`).getTime();
    if (value > to) {
      return false;
    }
  }

  return true;
}

function normalizeMenu(items = [], categories = []) {
  return items.map((item, index) => {
    const category = categories.find(
      (entry) => entry.id === item.categoryId || entry.name === item.category
    );

    return {
      id: String(item.id ?? `M-${1000 + index}`),
      name: item.name || "Unnamed Item",
      categoryId: item.categoryId || category?.id || categories[0]?.id || "",
      price: Number(item.price || 0),
      prepTime: Number(item.prepTime || 10),
      isAvailable: item.isAvailable !== false,
      soldCount: Number(item.soldCount || 0),
      category: item.category || category?.name || "",
    };
  });
}

function normalizeOrders(items = []) {
  return items.map((order, index) => {
    const itemCount =
      typeof order.itemCount === "number"
        ? order.itemCount
        : (order.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0);
    const total =
      typeof order.total === "number"
        ? order.total
        : (order.items || []).reduce(
            (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

    return {
      id: String(order.id ?? `ORD-${index + 1}`),
      customerName: order.customerName || `Customer ${index + 1}`,
      status: order.status || "Pending",
      total,
      itemCount,
      createdAt: order.createdAt || new Date().toISOString(),
    };
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const session = useMemo(() => getAuthSession(), []);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState(DEFAULT_WEEKLY_REVENUE);
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "All",
    customer: "",
    search: "",
  });
  const [syncLabel, setSyncLabel] = useState("Live sync active");
  const [modalConfig, setModalConfig] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Delete",
    onConfirm: () => {},
  });

  const bumpSyncState = (source) => {
    const time = new Date().toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSyncLabel(`Synced from ${source} at ${time}`);
  };

  const loadAdminData = async () => {
    try {
      const [categoriesResponse, menuResponse, ordersResponse, insightsResponse] =
        await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu"),
          fetch("/api/orders"),
          fetch("/api/admin-insights"),
        ]);

      const [categoryData, menuData, orderData, insightData] = await Promise.all([
        categoriesResponse.json(),
        menuResponse.json(),
        ordersResponse.json(),
        insightsResponse.json(),
      ]);

      const nextCategories = Array.isArray(categoryData) ? categoryData : [];
      setCategories(nextCategories);
      setMenuItems(normalizeMenu(Array.isArray(menuData) ? menuData : [], nextCategories));
      setOrders(normalizeOrders(Array.isArray(orderData) ? orderData : []));
      setWeeklyRevenue(
        Array.isArray(insightData?.weeklyRevenue) && insightData.weeklyRevenue.length > 0
          ? insightData.weeklyRevenue
          : DEFAULT_WEEKLY_REVENUE
      );
      setStatusOptions(
        Array.isArray(insightData?.statusOptions) && insightData.statusOptions.length > 0
          ? insightData.statusOptions
          : DEFAULT_STATUS_OPTIONS
      );
      bumpSyncState("server data");
    } catch (_error) {
      setSyncLabel("Live sync unavailable");
    }
  };

  const loadAllOrders = async () => {
    try {
      const response = await fetch("/api/orders/admin/all", {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllOrders(normalizeOrders(Array.isArray(data) ? data : []));
      }
    } catch (_error) {
      // silent fail
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        const normalized = normalizeOrders([updated]);
        setAllOrders((prev) =>
          prev.map((order) => (order.id === orderId ? normalized[0] : order))
        );
        alert("Status updated!");
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error updating status");
    }
  };

  useEffect(() => {
    loadAdminData();
    loadAllOrders();
    const pollingId = setInterval(() => {
      loadAdminData();
      loadAllOrders();
    }, 15000);

    return () => clearInterval(pollingId);
  }, []);

  const filteredOrders = useMemo(() => {
    const customerFilter = filters.customer.trim().toLowerCase();
    const searchFilter = filters.search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch = filters.status === "All" || order.status === filters.status;
      const dateMatch = matchesDate(order.createdAt, filters.fromDate, filters.toDate);
      const customerMatch =
        !customerFilter || order.customerName.toLowerCase().includes(customerFilter);

      const searchMatch =
        !searchFilter ||
        order.id.toLowerCase().includes(searchFilter) ||
        order.customerName.toLowerCase().includes(searchFilter);

      return statusMatch && dateMatch && customerMatch && searchMatch;
    });
  }, [filters, orders]);

  const filteredAdminOrders = useMemo(() => {
    const customerFilter = filters.customer.trim().toLowerCase();
    const searchFilter = filters.search.trim().toLowerCase();

    return allOrders.filter((order) => {
      const statusMatch = filters.status === "All" || order.status === filters.status;
      const dateMatch = matchesDate(order.createdAt, filters.fromDate, filters.toDate);
      const customerMatch =
        !customerFilter || order.customerName.toLowerCase().includes(customerFilter);

      const searchMatch =
        !searchFilter ||
        order.id.toLowerCase().includes(searchFilter) ||
        order.customerName.toLowerCase().includes(searchFilter);

      return statusMatch && dateMatch && customerMatch && searchMatch;
    });
  }, [filters, allOrders]);

  const dashboardStats = useMemo(() => {
    const statsData = filteredAdminOrders;
    
    const completedOrders = statsData.filter((order) => order.status === "Delivered").length;
    const cancelledOrders = statsData.filter((order) => order.status === "Cancelled").length;
    const pendingOrders = statsData.filter((order) => order.status === "Pending").length;
    const preparingOrders = statsData.filter((order) => order.status === "Preparing").length;
    
    const revenueTotal = statsData.reduce((sum, order) => {
      if (order.status === "Cancelled") return sum;
      return sum + order.total;
    }, 0);

    return {
      totalOrdersFiltered: statsData.length,
      revenueFiltered: revenueTotal,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      preparingOrders,
    };
  }, [filteredAdminOrders]);

  const topItems = useMemo(() => {
    return [...menuItems].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);
  }, [menuItems]);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  const handleOrderFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleAddMenuItem = async (payload) => {
    try {
      const session = getAuthSession();
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.message || "Failed to add menu item");
        return;
      }

      const newItem = await response.json();
      setMenuItems((current) => [newItem, ...current]);
      bumpSyncState("menu");
    } catch (err) {
      alert("Error adding menu item");
    }
  };

  const handleUpdateMenuItem = async (id, payload) => {
    try {
      const session = getAuthSession();
      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error?.message || "Failed to update menu item");
        return;
      }

      const updatedItem = await response.json();
      setMenuItems((current) =>
        current.map((item) => (item.id === id ? updatedItem : item))
      );
      bumpSyncState("menu");
    } catch (err) {
      alert("Error updating menu item");
    }
  };

  const handleDeleteMenuItem = (id) => {
    setModalConfig({
      open: true,
      title: "Delete menu item",
      message: "This action removes the item from the menu list.",
      confirmLabel: "Delete Item",
      onConfirm: async () => {
        try {
          const session = getAuthSession();
          const response = await fetch(`/api/menu/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session?.token}`,
            },
          });

          if (!response.ok) {
            const error = await response.json();
            alert(error?.message || "Failed to delete menu item");
            return;
          }

          setMenuItems((current) => current.filter((item) => item.id !== id));
          setModalConfig((current) => ({ ...current, open: false }));
          bumpSyncState("menu");
        } catch (err) {
          alert("Error deleting menu item");
          setModalConfig((current) => ({ ...current, open: false }));
        }
      },
    });
  };

  const handleAddCategory = (payload) => {
    setCategories((current) => [
      {
        id: `cat-${Date.now().toString().slice(-4)}`,
        ...payload,
      },
      ...current,
    ]);
    bumpSyncState("categories");
  };

  const handleUpdateCategory = (id, payload) => {
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, ...payload } : category))
    );
    bumpSyncState("categories");
  };

  const handleDeleteCategory = (id, itemCount) => {
    if (itemCount > 0) {
      return;
    }

    setModalConfig({
      open: true,
      title: "Delete category",
      message: "This category will be removed from your menu organization.",
      confirmLabel: "Delete Category",
      onConfirm: () => {
        setCategories((current) => current.filter((category) => category.id !== id));
        setModalConfig((current) => ({ ...current, open: false }));
        bumpSyncState("categories");
      },
    });
  };

  const closeModal = () => {
    setModalConfig((current) => ({ ...current, open: false }));
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="admin-main">
        <AdminTopbar
          onLogout={handleLogout}
          adminName={session?.user?.name || "Admin"}
          syncLabel={syncLabel}
        />

        {activeSection === "dashboard" && (
          <>
            <AnalyticsCards stats={dashboardStats} topItems={topItems} />

            <div className="admin-content-grid">
              <RevenueChart weeklyRevenue={weeklyRevenue} />
              <PopularItems topItems={topItems} />
            </div>

            <OrdersPanel
              title="Recent Client Orders"
              orders={orders.slice(0, 6)}
              statusOptions={statusOptions}
              filters={filters}
              onFilterChange={handleOrderFilter}
              showFilters={false}
            />
          </>
        )}

        {activeSection === "orders" && (
          <OrdersPanel
            orders={filteredOrders}
            statusOptions={statusOptions}
            filters={filters}
            onFilterChange={handleOrderFilter}
          />
        )}

        {activeSection === "manage-orders" && (
          <OrdersPanel
            title="All Orders - Admin Management"
            orders={filteredAdminOrders}
            statusOptions={statusOptions}
            filters={filters}
            onFilterChange={handleOrderFilter}
            isAdmin={true}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {activeSection === "menu" && (
          <MenuManagement
            categories={categories}
            menuItems={menuItems}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        )}

        {activeSection === "categories" && (
          <CategoryManagement
            categories={categories}
            menuItems={menuItems}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>

      <ConfirmModal
        open={modalConfig.open}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        onCancel={closeModal}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}