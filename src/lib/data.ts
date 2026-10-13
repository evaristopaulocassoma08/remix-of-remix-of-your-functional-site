export type Range = "today" | "week" | "month";

const hours = ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "11 PM"];
export const trend: Record<Range, { label: string; revenue: number; orders: number }[]> = {
  today: hours.map((label, i) => ({
    label,
    revenue: [800, 600, 900, 1500, 2300, 3600, 5600, 4200, 2600, 3500, 3200, 1800][i],
    orders: [3, 2, 4, 7, 11, 18, 28, 21, 12, 17, 15, 8][i],
  })),
  week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({
    label,
    revenue: [21000, 24500, 19800, 27300, 32450, 38900, 35200][i],
    orders: [110, 128, 102, 141, 168, 201, 183][i],
  })),
  month: ["W1", "W2", "W3", "W4"].map((label, i) => ({
    label,
    revenue: [152000, 171500, 165300, 198700][i],
    orders: [790, 902, 861, 1040][i],
  })),
};

export const categories = [
  { name: "Main Course", orders: 93, color: "var(--chart-1)" },
  { name: "Snacks", orders: 34, color: "var(--chart-4)" },
  { name: "Beverages", orders: 25, color: "var(--chart-2)" },
  { name: "Desserts", orders: 16, color: "var(--chart-5)" },
];

export type Dish = { id: string; name: string; orders: number; price: number; emoji: string; category: string };
export const dishes: Dish[] = [
  { id: "1", name: "Paneer Butter Masala", orders: 124, price: 52, emoji: "🍛", category: "Main Course" },
  { id: "2", name: "Chicken Biryani", orders: 98, price: 59, emoji: "🍚", category: "Main Course" },
  { id: "3", name: "Veg Pizza", orders: 76, price: 56, emoji: "🍕", category: "Snacks" },
  { id: "4", name: "Masala Dosa", orders: 65, price: 48, emoji: "🥞", category: "Snacks" },
  { id: "5", name: "Chocolate Lava Cake", orders: 54, price: 42, emoji: "🍰", category: "Desserts" },
  { id: "6", name: "Mango Lassi", orders: 41, price: 25, emoji: "🥭", category: "Beverages" },
];

export type OrderStatus = "Completed" | "Preparing" | "Pending" | "Cancelled";
export const orders = Array.from({ length: 24 }, (_, i) => {
  const d = dishes[i % dishes.length];
  const st: OrderStatus[] = ["Completed", "Completed", "Preparing", "Completed", "Pending", "Cancelled"];
  return {
    id: `#ORD-${1040 + i}`,
    customer: ["Aarav", "Diya", "Kabir", "Meera", "Rohan", "Ananya", "Vihaan", "Sara"][i % 8],
    dish: d.name,
    amount: d.price * (1 + (i % 3)),
    status: st[i % st.length],
    time: `${(i % 12) + 1}:${String((i * 7) % 60).padStart(2, "0")} PM`,
  };
});

export const customers = ["Aarav Shah", "Diya Patel", "Kabir Rao", "Meera Iyer", "Rohan Das", "Ananya Gupta", "Vihaan Mehta", "Sara Khan"].map(
  (name, i) => ({ name, orders: 30 - i * 3, spent: 4200 - i * 410, joined: `${i + 2} Jun 2026` }),
);

export const inventory = [
  { item: "Paneer", stock: 12, unit: "kg", min: 5 },
  { item: "Basmati Rice", stock: 40, unit: "kg", min: 15 },
  { item: "Chicken", stock: 4, unit: "kg", min: 8 },
  { item: "Tomatoes", stock: 18, unit: "kg", min: 10 },
  { item: "Cheese", stock: 3, unit: "kg", min: 4 },
  { item: "Milk", stock: 25, unit: "L", min: 10 },
];

export const reviews = [
  { name: "Diya", rating: 5, text: "Best biryani in town! Super fast delivery." },
  { name: "Kabir", rating: 4, text: "Paneer butter masala was rich and creamy." },
  { name: "Meera", rating: 3, text: "Pizza was good but arrived a bit cold." },
  { name: "Rohan", rating: 5, text: "Lava cake is unreal. Will order again." },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
