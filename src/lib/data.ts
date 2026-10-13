export type Range = "today" | "week" | "month";

const hours = ["12 AM", "2 AM", "4 AM", "6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "11 PM"];
export const trend: Record<Range, { label: string; revenue: number; orders: number }[]> = {
  today: hours.map((label, i) => ({
    label,
    revenue: [80000, 60000, 90000, 150000, 230000, 360000, 560000, 420000, 260000, 350000, 320000, 180000][i]!,
    orders: [3, 2, 4, 7, 11, 18, 28, 21, 12, 17, 15, 8][i]!,
  })),
  week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({
    label,
    revenue: [2100000, 2450000, 1980000, 2730000, 3245000, 3890000, 3520000][i]!,
    orders: [110, 128, 102, 141, 168, 201, 183][i]!,
  })),
  month: ["W1", "W2", "W3", "W4"].map((label, i) => ({
    label,
    revenue: [15200000, 17150000, 16530000, 19870000][i]!,
    orders: [790, 902, 861, 1040][i]!,
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
  { id: "1", name: "Mufete de Cacusso", orders: 124, price: 5200, emoji: "🐟", category: "Main Course" },
  { id: "2", name: "Muamba de Galinha", orders: 98, price: 5900, emoji: "🍛", category: "Main Course" },
  { id: "3", name: "Funje com Carne Seca", orders: 76, price: 4500, emoji: "🍚", category: "Main Course" },
  { id: "4", name: "Pastéis de Bacalhau", orders: 65, price: 1800, emoji: "🥟", category: "Snacks" },
  { id: "5", name: "Pudim de Leite", orders: 54, price: 2200, emoji: "🍮", category: "Desserts" },
  { id: "6", name: "Sumo de Múcua", orders: 41, price: 1200, emoji: "🥤", category: "Beverages" },
];

export type OrderStatus = "Completed" | "Preparing" | "Pending" | "Cancelled";
export type Order = { id: string; customer: string; dish: string; amount: number; status: OrderStatus; time: string };
export const orders: Order[] = Array.from({ length: 24 }, (_, i) => {
  const d = dishes[i % dishes.length]!;
  const st: OrderStatus[] = ["Completed", "Completed", "Preparing", "Completed", "Pending", "Cancelled"];
  return {
    id: `#ORD-${1040 + i}`,
    customer: ["Nádia", "Mário", "Luísa", "Kiala", "Pedro", "Esperança", "José", "Marta"][i % 8]!,
    dish: d.name,
    amount: d.price * (1 + (i % 3)),
    status: st[i % st.length]!,
    time: `${(i % 12) + 1}:${String((i * 7) % 60).padStart(2, "0")} PM`,
  };
});

export type Customer = { name: string; orders: number; spent: number; joined: string };
export const customers: Customer[] = ["Nádia Silva", "Mário Santos", "Luísa Ferreira", "Kiala Neto", "Pedro Domingos", "Esperança Costa", "José Manuel", "Marta Cardoso"].map(
  (name, i) => ({ name, orders: 30 - i * 3, spent: 420000 - i * 41000, joined: `${i + 2} Jun 2026` }),
);

export type StockItem = { item: string; stock: number; unit: string; min: number };
export const inventory: StockItem[] = [
  { item: "Peixe Cacusso", stock: 12, unit: "kg", min: 5 },
  { item: "Fuba de Bombó", stock: 40, unit: "kg", min: 15 },
  { item: "Galinha", stock: 4, unit: "kg", min: 8 },
  { item: "Tomate", stock: 18, unit: "kg", min: 10 },
  { item: "Óleo de Palma", stock: 3, unit: "L", min: 4 },
  { item: "Leite", stock: 25, unit: "L", min: 10 },
];

export type Review = { name: string; rating: number; text: string };
export const reviews: Review[] = [
  { name: "Luísa", rating: 5, text: "A melhor muamba da cidade! Entrega super rápida." },
  { name: "Kiala", rating: 4, text: "O mufete estava rico e bem temperado." },
  { name: "Pedro", rating: 3, text: "Os pastéis estavam bons mas chegaram um pouco frios." },
  { name: "Esperança", rating: 5, text: "O pudim é incrível. Vou pedir de novo." },
];

export type Campaign = { id: string; name: string; channel: string; budget: number; status: "Active" | "Paused" | "Draft" };
export const campaigns: Campaign[] = [
  { id: "1", name: "Almoço de Sexta -10%", channel: "WhatsApp", budget: 50000, status: "Active" },
  { id: "2", name: "Menu Família Fim-de-Semana", channel: "Instagram", budget: 80000, status: "Active" },
  { id: "3", name: "Entrega Grátis Maianga", channel: "SMS", budget: 30000, status: "Paused" },
];

/** Format a number as Angolan Kwanza: Kz 1.250.000 */
export const kz = (n: number) => "Kz " + Math.round(n).toLocaleString("pt-AO");
