export const tabs = ["All", "Family Meal", "Burgers", "Desserts", "Drinks", "Chicken", "Promos"];

export const menuItems = [
  {
    name: "Family Bucket A",
    category: "Family Meal",
    price: 499,
    description: "6-pc crispy chicken bucket with rice and gravy for sharing",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Family Bucket B",
    category: "Family Meal",
    price: 699,
    description: "8-pc crispy chicken bucket with large fries and drinks",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Family Feast Combo",
    category: "Family Meal",
    price: 999,
    description: "4 burgers, 6 chicken pieces, 1 large spaghetti tray, and drinks",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Cheese Burger",
    category: "Burgers",
    price: 129,
    description: "Two juicy beef patties stacked with cheddar and crisp vegetables",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Double Patty Burger",
    category: "Burgers",
    price: 159,
    description: "Double beef patty burger with signature smoky sauce",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bacon Melt Burger",
    category: "Burgers",
    price: 179,
    description: "Grilled burger with bacon strips, melted cheese, and onion rings",
    image:
      "https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Chicken Sandwich Burger",
    category: "Chicken",
    price: 139,
    description: "Crispy chicken fillet burger with lettuce and garlic mayo",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Chocolate Sundae",
    category: "Desserts",
    price: 59,
    description: "Vanilla soft serve topped with rich chocolate syrup",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
  },
];

export function formatPrice(value) {
  return `Php ${value.toFixed(2)}`;
}

export function getMenuItemByName(name) {
  return menuItems.find((item) => item.name === name) || null;
}