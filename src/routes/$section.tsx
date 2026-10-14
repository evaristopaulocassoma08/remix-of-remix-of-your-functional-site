import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Trash2, Pencil, X, Download, Minus } from "lucide-react";
import { Shell, Card, nav } from "@/components/Shell";
import { usePersistent } from "@/lib/store";
import {
  orders as seedOrders, dishes as seedDishes, customers as seedCustomers, inventory as seedInv, reviews as seedReviews,
  campaigns as seedCampaigns, categories as seedCats, trend, kz,
  type Order, type OrderStatus, type Dish, type Customer, type StockItem, type Review, type Campaign, type Range,
} from "@/lib/data";

export const Route = createFileRoute("/$section")({
  beforeLoad: ({ params }) => {
    if (!nav.some((n) => n.to === "/" + params.section)) throw notFound();
  },
  head: ({ params }) => {
    const label = nav.find((n) => n.to === "/" + params.section)?.label ?? "Page";
    return { meta: [
      { title: `${label} — FoodAnalytics` },
      { name: "description", content: `${label} for your food business on FoodAnalytics.` },
      { property: "og:title", content: `${label} — FoodAnalytics` },
      { property: "og:description", content: `Manage ${label.toLowerCase()} with FoodAnalytics.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] };
  },
  component: Section,
});

const th = "px-3 py-2 text-left text-xs font-semibold text-muted-foreground";
const td = "px-3 py-2 border-t text-sm";
const inp = "w-full rounded-lg border bg-background px-3 py-2 text-sm";
const btn = "flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground";
const chip = (on: boolean) => `rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-accent text-primary" : ""}`;
const STATUSES: OrderStatus[] = ["Pending", "Preparing", "Completed", "Cancelled"];
const CATS = ["Main Course", "Snacks", "Beverages", "Desserts"];

function csv(name: string, rows: (string | number)[][]) {
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

function Modal({ title, onClose, onSubmit, children }: { title: string; onClose: () => void; onSubmit: (f: FormData) => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}
        className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-center justify-between"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose}><X className="h-4 w-4" /></button></div>
        {children}
        <button className={btn + " w-full justify-center"}>Save</button>
      </form>
    </div>
  );
}

function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl bg-accent p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div>;
}

/* ---------------- Orders ---------------- */
function Orders({ q }: { q: string }) {
  const [list, setList] = usePersistent<Order[]>("orders", seedOrders);
  const [dishes] = usePersistent<Dish[]>("dishes", seedDishes);
  const [filter, setFilter] = useState<string>("All");
  const [adding, setAdding] = useState(false);
  const m = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const shown = list.filter((o) => (filter === "All" || o.status === filter) && (m(o.dish) || m(o.customer) || m(o.id)));
  const total = list.filter((o) => o.status === "Completed").reduce((a, o) => a + o.amount, 0);
  return (<>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Total orders" value={list.length} />
      <Stat label="Pending" value={list.filter((o) => o.status === "Pending").length} />
      <Stat label="Preparing" value={list.filter((o) => o.status === "Preparing").length} />
      <Stat label="Revenue (completed)" value={kz(total)} />
    </div>
    <Toolbar>
      {["All", ...STATUSES].map((f) => <button key={f} onClick={() => setFilter(f)} className={chip(filter === f)}>{f}</button>)}
      <div className="ml-auto flex gap-2">
        <button onClick={() => csv("orders.csv", [["Order", "Customer", "Dish", "Amount (Kz)", "Status"], ...shown.map((o) => [o.id, o.customer, o.dish, o.amount, o.status])])} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Download className="h-4 w-4" />Export</button>
        <button onClick={() => setAdding(true)} className={btn}><Plus className="h-4 w-4" />New Order</button>
      </div>
    </Toolbar>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Dish</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Time</th><th className={th}></th></tr></thead>
      <tbody>{shown.map((o) => (
        <tr key={o.id}><td className={td}>{o.id}</td><td className={td}>{o.customer}</td><td className={td}>{o.dish}</td><td className={td}>{kz(o.amount)}</td>
          <td className={td}><select value={o.status} onChange={(e) => setList((l) => l.map((x) => x.id === o.id ? { ...x, status: e.target.value as OrderStatus } : x))} className="rounded-full bg-accent px-2 py-0.5 text-xs">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
          <td className={td}>{o.time}</td>
          <td className={td}><button onClick={() => setList((l) => l.filter((x) => x.id !== o.id))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button></td></tr>))}</tbody></table>
      {!shown.length && <p className="p-4 text-sm text-muted-foreground">No orders found.</p>}</div>
    {adding && <Modal title="New Order" onClose={() => setAdding(false)} onSubmit={(f) => {
      const d = dishes.find((x) => x.id === f.get("dish"))!; const qty = +(f.get("qty") || 1);
      const n = Math.max(1039, ...list.map((o) => +o.id.replace(/\D/g, ""))) + 1;
      setList((l) => [{ id: `#ORD-${n}`, customer: String(f.get("customer")), dish: d.name, amount: d.price * qty, status: "Pending", time: new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" }) }, ...l]);
      setAdding(false);
    }}>
      <input name="customer" required placeholder="Customer name" className={inp} />
      <select name="dish" className={inp}>{dishes.map((d) => <option key={d.id} value={d.id}>{d.name} — {kz(d.price)}</option>)}</select>
      <input name="qty" type="number" min={1} defaultValue={1} className={inp} />
    </Modal>}
  </>);
}

/* ---------------- Menu items ---------------- */
function MenuItems({ q }: { q: string }) {
  const [list, setList] = usePersistent<Dish[]>("dishes", seedDishes);
  const [catList] = useCats();
  const CATS = catList.map((c) => c.name);
  const [cat, setCat] = useState("All");
  const [edit, setEdit] = useState<Dish | "new" | null>(null);
  const shown = list.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) && (cat === "All" || d.category === cat));
  const cur = edit && edit !== "new" ? edit : null;
  return (<>
    <Toolbar>
      {["All", ...CATS].map((c) => <button key={c} onClick={() => setCat(c)} className={chip(cat === c)}>{c}</button>)}
      <button onClick={() => setEdit("new")} className={btn + " ml-auto"}><Plus className="h-4 w-4" />Add Dish</button>
    </Toolbar>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shown.map((d) => (
      <div key={d.id} className="flex items-center gap-3 rounded-xl border p-3"><span className="text-3xl">{d.emoji}</span>
        <div className="flex-1"><p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.category} · {d.orders} orders</p><b className="text-sm">{kz(d.price)}</b></div>
        <button onClick={() => setEdit(d)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => setList((l) => l.filter((x) => x.id !== d.id))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
      </div>))}</div>
    {!shown.length && <p className="text-sm text-muted-foreground">No dishes found.</p>}
    {edit && <Modal title={cur ? "Edit Dish" : "Add Dish"} onClose={() => setEdit(null)} onSubmit={(f) => {
      const d: Dish = { id: cur?.id ?? crypto.randomUUID(), name: String(f.get("name")), price: +f.get("price")!, category: String(f.get("category")), emoji: String(f.get("emoji") || "🍽️"), orders: cur?.orders ?? 0 };
      setList((l) => cur ? l.map((x) => x.id === d.id ? d : x) : [...l, d]); setEdit(null);
    }}>
      <input name="name" required defaultValue={cur?.name} placeholder="Dish name" className={inp} />
      <input name="price" required type="number" min={1} defaultValue={cur?.price} placeholder="Price (Kz)" className={inp} />
      <select name="category" defaultValue={cur?.category ?? CATS[0]} className={inp}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
      <input name="emoji" defaultValue={cur?.emoji ?? "🍽️"} placeholder="Emoji" className={inp} />
    </Modal>}
  </>);
}

/* ---------------- Categories ---------------- */
type Cat = { id: string; name: string; color: string; description: string; active: boolean };
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const seedCatList: Cat[] = seedCats.map((c, i) => ({ id: String(i + 1), name: c.name, color: c.color, description: "", active: true }));
function useCats() { return usePersistent<Cat[]>("categories", seedCatList); }

function Categories({ q }: { q: string }) {
  const [cats, setCats] = useCats();
  const [dishes, setDishes] = usePersistent<Dish[]>("dishes", seedDishes);
  const [edit, setEdit] = useState<Cat | "new" | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [sort, setSort] = useState<"name" | "revenue" | "orders">("revenue");
  const [status, setStatus] = useState("All");
  const cur = edit && edit !== "new" ? edit : null;
  const rows = cats.map((c) => {
    const ds = dishes.filter((d) => d.category === c.name);
    return { ...c, ds, orders: ds.reduce((a, d) => a + d.orders, 0), revenue: ds.reduce((a, d) => a + d.orders * d.price, 0), avg: ds.length ? ds.reduce((a, d) => a + d.price, 0) / ds.length : 0 };
  });
  const totalRev = rows.reduce((a, r) => a + r.revenue, 0) || 1;
  const shown = rows
    .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()) && (status === "All" || (status === "Active") === r.active))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort]);
  const uncategorized = dishes.filter((d) => !cats.some((c) => c.name === d.category));
  const remove = (c: Cat) => {
    const n = dishes.filter((d) => d.category === c.name).length;
    if (n && !confirm(`${n} dish(es) will become uncategorized. Delete "${c.name}"?`)) return;
    setCats((l) => l.filter((x) => x.id !== c.id));
  };
  return (<>
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Categories" value={cats.length} />
      <Stat label="Active" value={cats.filter((c) => c.active).length} />
      <Stat label="Total dishes" value={dishes.length} />
      <Stat label="Top category" value={[...rows].sort((a, b) => b.revenue - a.revenue)[0]?.name ?? "—"} />
    </div>
    <div className="mb-4 grid gap-4 lg:grid-cols-3">
      <div className="h-64 rounded-xl border p-3 lg:col-span-1">
        <p className="mb-1 text-sm font-semibold">Revenue share</p>
        <ResponsiveContainer><PieChart><Pie data={rows.filter((r) => r.revenue)} dataKey="revenue" nameKey="name" innerRadius={45} outerRadius={80}>{rows.filter((r) => r.revenue).map((r) => <Cell key={r.id} fill={r.color} />)}</Pie><Tooltip formatter={(v) => kz(Number(v))} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>
      </div>
      <div className="h-64 rounded-xl border p-3 lg:col-span-2">
        <p className="mb-1 text-sm font-semibold">Orders by category</p>
        <ResponsiveContainer><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="orders" radius={[6, 6, 0, 0]}>{rows.map((r) => <Cell key={r.id} fill={r.color} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
    </div>
    <Toolbar>
      {["All", "Active", "Hidden"].map((s) => <button key={s} onClick={() => setStatus(s)} className={chip(status === s)}>{s}</button>)}
      <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border bg-background px-2 py-1.5 text-xs">
        <option value="revenue">Sort: Revenue</option><option value="orders">Sort: Orders</option><option value="name">Sort: Name</option>
      </select>
      <div className="ml-auto flex gap-2">
        <button onClick={() => csv("categories.csv", [["Category", "Dishes", "Orders", "Revenue (Kz)", "Share %", "Status"], ...rows.map((r) => [r.name, r.ds.length, r.orders, r.revenue, ((r.revenue / totalRev) * 100).toFixed(1), r.active ? "Active" : "Hidden"])])} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Download className="h-4 w-4" />Export</button>
        <button onClick={() => setEdit("new")} className={btn}><Plus className="h-4 w-4" />Add Category</button>
      </div>
    </Toolbar>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shown.map((c) => (
      <div key={c.id} className={`rounded-xl border p-4 ${c.active ? "" : "opacity-60"}`}>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
          <p className="flex-1 font-semibold">{c.name}</p>
          <button onClick={() => setCats((l) => l.map((x) => x.id === c.id ? { ...x, active: !x.active } : x))} className={chip(c.active)}>{c.active ? "Active" : "Hidden"}</button>
          <button onClick={() => setEdit(c)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => remove(c)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button>
        </div>
        {c.description && <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div><p className="text-muted-foreground">Dishes</p><b>{c.ds.length}</b></div>
          <div><p className="text-muted-foreground">Orders</p><b>{c.orders}</b></div>
          <div><p className="text-muted-foreground">Avg price</p><b>{kz(c.avg)}</b></div>
        </div>
        <p className="mt-3 text-lg font-bold">{kz(c.revenue)}</p>
        <div className="mt-1 h-1.5 rounded-full bg-accent"><div className="h-full rounded-full" style={{ width: `${(c.revenue / totalRev) * 100}%`, background: c.color }} /></div>
        <p className="mt-1 text-xs text-muted-foreground">{((c.revenue / totalRev) * 100).toFixed(1)}% of revenue</p>
        <button onClick={() => setOpen(open === c.id ? null : c.id)} className="mt-3 text-xs font-semibold text-primary">{open === c.id ? "Hide dishes" : `View dishes (${c.ds.length})`}</button>
        {open === c.id && <ul className="mt-2 space-y-1 text-xs">{c.ds.map((d) => (
          <li key={d.id} className="flex items-center gap-2"><span>{d.emoji}</span><span className="flex-1">{d.name}</span><span>{kz(d.price)}</span>
            <select value={d.category} onChange={(e) => setDishes((l) => l.map((x) => x.id === d.id ? { ...x, category: e.target.value } : x))} className="rounded border bg-background text-xs" aria-label="Move to">{cats.map((k) => <option key={k.id}>{k.name}</option>)}</select></li>))}
          {!c.ds.length && <li className="text-muted-foreground">No dishes yet.</li>}</ul>}
      </div>))}</div>
    {!shown.length && <p className="text-sm text-muted-foreground">No categories found.</p>}
    {uncategorized.length > 0 && <div className="mt-4 rounded-xl border border-destructive/40 p-4 text-sm">
      <p className="font-semibold">Uncategorized dishes ({uncategorized.length})</p>
      <ul className="mt-2 space-y-1">{uncategorized.map((d) => <li key={d.id} className="flex items-center gap-2">{d.emoji} <span className="flex-1">{d.name}</span>
        <select defaultValue="" onChange={(e) => setDishes((l) => l.map((x) => x.id === d.id ? { ...x, category: e.target.value } : x))} className="rounded border bg-background text-xs"><option value="" disabled>Assign…</option>{cats.map((k) => <option key={k.id}>{k.name}</option>)}</select></li>)}</ul>
    </div>}
    {edit && <Modal title={cur ? "Edit Category" : "Add Category"} onClose={() => setEdit(null)} onSubmit={(f) => {
      const name = String(f.get("name")).trim();
      if (cats.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== cur?.id)) { alert("A category with this name already exists."); return; }
      const c: Cat = { id: cur?.id ?? crypto.randomUUID(), name, color: String(f.get("color")), description: String(f.get("description") || ""), active: cur?.active ?? true };
      if (cur && cur.name !== name) setDishes((l) => l.map((d) => d.category === cur.name ? { ...d, category: name } : d));
      setCats((l) => cur ? l.map((x) => x.id === c.id ? c : x) : [...l, c]); setEdit(null);
    }}>
      <input name="name" required defaultValue={cur?.name} placeholder="Category name" className={inp} />
      <textarea name="description" defaultValue={cur?.description} placeholder="Description (optional)" className={inp} />
      <div className="flex gap-3">{COLORS.map((col, i) => <label key={col} className="flex items-center gap-1"><input type="radio" name="color" value={col} defaultChecked={(cur?.color ?? COLORS[0]) === col || (!cur && i === 0)} /><span className="h-5 w-5 rounded-full" style={{ background: col }} /></label>)}</div>
    </Modal>}
  </>);
}

/* ---------------- Customers ---------------- */
function Customers({ q }: { q: string }) {
  const [list, setList] = usePersistent<Customer[]>("customers", seedCustomers);
  const [adding, setAdding] = useState(false);
  const [sort, setSort] = useState<"spent" | "orders" | "name">("spent");
  const shown = list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort]);
  return (<>
    <div className="mb-4 grid grid-cols-3 gap-3">
      <Stat label="Customers" value={list.length} />
      <Stat label="Total spent" value={kz(list.reduce((a, c) => a + c.spent, 0))} />
      <Stat label="Top customer" value={[...list].sort((a, b) => b.spent - a.spent)[0]?.name ?? "-"} />
    </div>
    <Toolbar>
      <span className="text-xs text-muted-foreground">Sort:</span>
      {(["spent", "orders", "name"] as const).map((s) => <button key={s} onClick={() => setSort(s)} className={chip(sort === s)}>{s}</button>)}
      <button onClick={() => setAdding(true)} className={btn + " ml-auto"}><Plus className="h-4 w-4" />Add Customer</button>
    </Toolbar>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Name</th><th className={th}>Orders</th><th className={th}>Spent</th><th className={th}>Tier</th><th className={th}>Joined</th><th className={th}></th></tr></thead>
      <tbody>{shown.map((c) => <tr key={c.name}><td className={td}>{c.name}</td><td className={td}>{c.orders}</td><td className={td}>{kz(c.spent)}</td>
        <td className={td}><span className="rounded-full bg-accent px-2 py-0.5 text-xs">{c.spent >= 300000 ? "Gold" : c.spent >= 150000 ? "Silver" : "Bronze"}</span></td>
        <td className={td}>{c.joined}</td>
        <td className={td}><button onClick={() => setList((l) => l.filter((x) => x.name !== c.name))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button></td></tr>)}</tbody></table></div>
    {adding && <Modal title="Add Customer" onClose={() => setAdding(false)} onSubmit={(f) => {
      setList((l) => [...l, { name: String(f.get("name")), orders: 0, spent: 0, joined: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }]); setAdding(false);
    }}><input name="name" required placeholder="Full name" className={inp} /></Modal>}
  </>);
}

/* ---------------- Inventory ---------------- */
function Inventory({ q }: { q: string }) {
  const [list, setList] = usePersistent<StockItem[]>("inventory", seedInv);
  const [adding, setAdding] = useState(false);
  const [low, setLow] = useState(false);
  const change = (item: string, d: number) => setList((l) => l.map((x) => x.item === item ? { ...x, stock: Math.max(0, x.stock + d) } : x));
  const shown = list.filter((i) => i.item.toLowerCase().includes(q.toLowerCase()) && (!low || i.stock < i.min));
  return (<>
    <Toolbar>
      <button onClick={() => setLow(!low)} className={chip(low)}>Only low stock ({list.filter((i) => i.stock < i.min).length})</button>
      <button onClick={() => setList((l) => l.map((x) => x.stock < x.min ? { ...x, stock: x.min * 2 } : x))} className="rounded-lg border px-3 py-2 text-sm">Restock all low</button>
      <button onClick={() => setAdding(true)} className={btn + " ml-auto"}><Plus className="h-4 w-4" />Add Item</button>
    </Toolbar>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Item</th><th className={th}>Stock</th><th className={th}>Min</th><th className={th}>Status</th><th className={th}></th></tr></thead>
      <tbody>{shown.map((i) => <tr key={i.item}><td className={td}>{i.item}</td>
        <td className={td}><div className="flex items-center gap-2"><button onClick={() => change(i.item, -1)} className="rounded border p-0.5"><Minus className="h-3 w-3" /></button>{i.stock} {i.unit}<button onClick={() => change(i.item, 1)} className="rounded border p-0.5"><Plus className="h-3 w-3" /></button></div></td>
        <td className={td}>{i.min} {i.unit}</td>
        <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs ${i.stock < i.min ? "bg-destructive text-destructive-foreground" : "bg-accent"}`}>{i.stock < i.min ? "Low stock" : "OK"}</span></td>
        <td className={td}><button onClick={() => setList((l) => l.filter((x) => x.item !== i.item))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button></td></tr>)}</tbody></table></div>
    {adding && <Modal title="Add Stock Item" onClose={() => setAdding(false)} onSubmit={(f) => {
      setList((l) => [...l, { item: String(f.get("item")), stock: +f.get("stock")!, min: +f.get("min")!, unit: String(f.get("unit")) }]); setAdding(false);
    }}>
      <input name="item" required placeholder="Item name" className={inp} />
      <input name="stock" required type="number" min={0} placeholder="Current stock" className={inp} />
      <input name="min" required type="number" min={0} placeholder="Minimum stock" className={inp} />
      <select name="unit" className={inp}><option>kg</option><option>L</option><option>un</option></select>
    </Modal>}
  </>);
}

/* ---------------- Analytics ---------------- */
const RANGE_LABEL: Record<Range, string> = { today: "Today", week: "This Week", month: "This Month" };
const PREV_FACTOR: Record<Range, number> = { today: 0.91, week: 0.87, month: 0.94 };
function Delta({ now, prev }: { now: number; prev: number }) {
  const p = prev ? ((now - prev) / prev) * 100 : 0;
  return <span className={`text-xs font-semibold ${p >= 0 ? "text-primary" : "text-destructive"}`}>{p >= 0 ? "▲" : "▼"} {Math.abs(p).toFixed(1)}% vs previous</span>;
}
function Kpi({ label, value, now, prev }: { label: string; value: ReactNode; now: number; prev: number }) {
  return <div className="rounded-xl bg-accent p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p><Delta now={now} prev={prev} /></div>;
}
function Analytics() {
  const [range, setRange] = useState<Range>("week");
  const [metric, setMetric] = useState<"revenue" | "orders" | "both">("both");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [orders] = usePersistent<Order[]>("orders", seedOrders);
  const [dishes] = usePersistent<Dish[]>("dishes", seedDishes);
  const [custs] = usePersistent<Customer[]>("customers", seedCustomers);
  const [cats] = useCats();
  const data = trend[range];
  const f = PREV_FACTOR[range];
  const rev = data.reduce((a, d) => a + d.revenue, 0), ord = data.reduce((a, d) => a + d.orders, 0);
  const prevRev = rev * f, prevOrd = Math.round(ord * (f + 0.03));
  const peak = [...data].sort((a, b) => b.revenue - a.revenue)[0]!;
  const done = orders.filter((o) => o.status === "Completed").length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;
  const statusData = STATUSES.map((s, i) => ({ name: s, value: orders.filter((o) => o.status === s).length, color: COLORS[i] }));
  const catData = cats.map((c) => ({ name: c.name, color: c.color, value: dishes.filter((d) => d.category === c.name).reduce((a, d) => a + d.orders * d.price, 0) })).filter((c) => c.value);
  const top = [...dishes].sort((a, b) => b.orders * b.price - a.orders * a.price).slice(0, 5);
  const topRev = top[0] ? top[0].orders * top[0].price : 1;
  const series = metric === "both" ? ["revenue", "orders"] : [metric];
  const exportCsv = () => csv(`analytics-${range}.csv`, [
    ["Period", "Revenue (Kz)", "Orders", "Avg order (Kz)"], ...data.map((d) => [d.label, d.revenue, d.orders, Math.round(d.revenue / d.orders)]),
    [], ["Total", rev, ord, Math.round(rev / ord)], [], ["Top dish", "Orders", "Revenue (Kz)"], ...top.map((d) => [d.name, d.orders, d.orders * d.price]),
  ]);
  const Chart = chartType === "bar" ? BarChart : LineChart;
  return (<>
    <Toolbar>
      {(["today", "week", "month"] as Range[]).map((r) => <button key={r} onClick={() => setRange(r)} className={chip(range === r)}>{RANGE_LABEL[r]}</button>)}
      <span className="mx-2 h-5 w-px bg-border" />
      {(["both", "revenue", "orders"] as const).map((m) => <button key={m} onClick={() => setMetric(m)} className={chip(metric === m)}>{m === "both" ? "Revenue + Orders" : m[0]!.toUpperCase() + m.slice(1)}</button>)}
      <span className="mx-2 h-5 w-px bg-border" />
      {(["bar", "line"] as const).map((t) => <button key={t} onClick={() => setChartType(t)} className={chip(chartType === t)}>{t === "bar" ? "Bars" : "Lines"}</button>)}
      <div className="ml-auto flex gap-2">
        <button onClick={() => window.print()} className="rounded-lg border px-3 py-2 text-sm">Print</button>
        <button onClick={exportCsv} className={btn}><Download className="h-4 w-4" />Export CSV</button>
      </div>
    </Toolbar>
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi label="Revenue" value={kz(rev)} now={rev} prev={prevRev} />
      <Kpi label="Orders" value={ord} now={ord} prev={prevOrd} />
      <Kpi label="Avg order value" value={kz(rev / ord)} now={rev / ord} prev={prevRev / prevOrd} />
      <Kpi label="Customers" value={custs.length} now={custs.length} prev={Math.max(1, custs.length - 1)} />
    </div>
    <div className="mb-4 rounded-xl border p-3">
      <div className="mb-2 flex flex-wrap justify-between text-sm"><p className="font-semibold">Performance — {RANGE_LABEL[range]}</p><p className="text-muted-foreground">Peak: <b className="text-foreground">{peak.label}</b> ({kz(peak.revenue)})</p></div>
      <div className="h-72"><ResponsiveContainer><Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="revenue" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} hide={metric === "orders"} />
        <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11 }} hide={metric === "revenue"} />
        <Tooltip formatter={(v, n) => n === "revenue" ? kz(Number(v)) : String(v)} /><Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s) => chartType === "bar"
          ? <Bar key={s} yAxisId={s} dataKey={s} fill={s === "revenue" ? "var(--chart-1)" : "var(--chart-2)"} radius={[6, 6, 0, 0]} />
          : <Line key={s} yAxisId={s} dataKey={s} type="monotone" stroke={s === "revenue" ? "var(--chart-1)" : "var(--chart-2)"} strokeWidth={2} />)}
      </Chart></ResponsiveContainer></div>
    </div>
    <div className="mb-4 grid gap-4 lg:grid-cols-3">
      <div className="h-64 rounded-xl border p-3"><p className="text-sm font-semibold">Revenue by category</p>
        <ResponsiveContainer><PieChart><Pie data={catData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>{catData.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie><Tooltip formatter={(v) => kz(Number(v))} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
      <div className="h-64 rounded-xl border p-3"><p className="text-sm font-semibold">Order status</p>
        <ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" outerRadius={70}>{statusData.map((s) => <Cell key={s.name} fill={s.color} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
      <div className="rounded-xl border p-3 text-sm"><p className="mb-3 font-semibold">Operational metrics</p>
        <ul className="space-y-3">
          <li className="flex justify-between"><span className="text-muted-foreground">Completion rate</span><b>{orders.length ? ((done / orders.length) * 100).toFixed(1) : 0}%</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Cancellation rate</span><b>{orders.length ? ((cancelled / orders.length) * 100).toFixed(1) : 0}%</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Orders per customer</span><b>{custs.length ? (custs.reduce((a, c) => a + c.orders, 0) / custs.length).toFixed(1) : 0}</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Avg customer spend</span><b>{kz(custs.length ? custs.reduce((a, c) => a + c.spent, 0) / custs.length : 0)}</b></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Projected next period</span><b>{kz(rev * (2 - f))}</b></li>
        </ul></div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border p-3"><p className="mb-2 text-sm font-semibold">Top dishes by revenue</p>
        <ul className="space-y-2 text-sm">{top.map((d, i) => <li key={d.id}><div className="flex justify-between"><span>{i + 1}. {d.emoji} {d.name}</span><b>{kz(d.orders * d.price)}</b></div>
          <div className="mt-1 h-1.5 rounded-full bg-accent"><div className="h-full rounded-full bg-primary" style={{ width: `${(d.orders * d.price / topRev) * 100}%` }} /></div></li>)}</ul></div>
      <div className="overflow-x-auto rounded-xl border p-3"><p className="mb-2 text-sm font-semibold">Breakdown — {RANGE_LABEL[range]}</p>
        <table className="w-full"><thead><tr><th className={th}>Period</th><th className={th}>Revenue</th><th className={th}>Orders</th><th className={th}>Avg</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.label}><td className={td}>{d.label}</td><td className={td}>{kz(d.revenue)}</td><td className={td}>{d.orders}</td><td className={td}>{kz(d.revenue / d.orders)}</td></tr>)}</tbody></table></div>
    </div>
  </>);
}

/* ---------------- Reports ---------------- */
function Reports() {
  const [range, setRange] = useState<Range>("week");
  const data = trend[range];
  return (<>
    <Toolbar>
      {(["today", "week", "month"] as Range[]).map((r) => <button key={r} onClick={() => setRange(r)} className={chip(range === r)}>{r === "today" ? "Daily" : r === "week" ? "Weekly" : "Monthly"}</button>)}
      <button onClick={() => csv(`report-${range}.csv`, [["Period", "Revenue (Kz)", "Orders", "Avg Order (Kz)"], ...data.map((d) => [d.label, d.revenue, d.orders, Math.round(d.revenue / d.orders)])])} className={btn + " ml-auto"}><Download className="h-4 w-4" />Download CSV</button>
      <button onClick={() => window.print()} className="rounded-lg border px-3 py-2 text-sm">Print</button>
    </Toolbar>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className={th}>Period</th><th className={th}>Revenue</th><th className={th}>Orders</th><th className={th}>Avg Order</th></tr></thead>
      <tbody>{data.map((d) => <tr key={d.label}><td className={td}>{d.label}</td><td className={td}>{kz(d.revenue)}</td><td className={td}>{d.orders}</td><td className={td}>{kz(d.revenue / d.orders)}</td></tr>)}
        <tr className="font-bold"><td className={td}>Total</td><td className={td}>{kz(data.reduce((a, d) => a + d.revenue, 0))}</td><td className={td}>{data.reduce((a, d) => a + d.orders, 0)}</td><td className={td}></td></tr></tbody></table></div>
  </>);
}

/* ---------------- Marketing ---------------- */
function Marketing() {
  const [list, setList] = usePersistent<Campaign[]>("campaigns", seedCampaigns);
  const [adding, setAdding] = useState(false);
  return (<>
    <Toolbar>
      <Stat label="Total budget" value={kz(list.reduce((a, c) => a + c.budget, 0))} />
      <Stat label="Active" value={list.filter((c) => c.status === "Active").length} />
      <button onClick={() => setAdding(true)} className={btn + " ml-auto"}><Plus className="h-4 w-4" />New Campaign</button>
    </Toolbar>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => (
      <div key={c.id} className="rounded-xl border p-4">
        <div className="flex items-start justify-between"><p className="font-semibold">{c.name}</p><button onClick={() => setList((l) => l.filter((x) => x.id !== c.id))} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></button></div>
        <p className="text-xs text-muted-foreground">{c.channel} · {kz(c.budget)}</p>
        <button onClick={() => setList((l) => l.map((x) => x.id === c.id ? { ...x, status: x.status === "Active" ? "Paused" : "Active" } : x))} className={chip(c.status === "Active") + " mt-3"}>
          {c.status === "Active" ? "Active — Pause" : c.status + " — Activate"}
        </button>
      </div>))}</div>
    {adding && <Modal title="New Campaign" onClose={() => setAdding(false)} onSubmit={(f) => {
      setList((l) => [...l, { id: crypto.randomUUID(), name: String(f.get("name")), channel: String(f.get("channel")), budget: +f.get("budget")!, status: "Draft" }]); setAdding(false);
    }}>
      <input name="name" required placeholder="Campaign name" className={inp} />
      <select name="channel" className={inp}><option>WhatsApp</option><option>Instagram</option><option>Facebook</option><option>SMS</option></select>
      <input name="budget" required type="number" min={0} placeholder="Budget (Kz)" className={inp} />
    </Modal>}
  </>);
}

/* ---------------- Reviews ---------------- */
function Reviews() {
  const [list, setList] = usePersistent<(Review & { reply?: string })[]>("reviews", seedReviews);
  const [stars, setStars] = useState(0);
  const avg = list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;
  return (<>
    <Toolbar>
      <Stat label="Average rating" value={`${avg.toFixed(1)} ★`} />
      <Stat label="Reviews" value={list.length} />
      <div className="ml-auto flex gap-1">{[0, 5, 4, 3, 2, 1].map((s) => <button key={s} onClick={() => setStars(s)} className={chip(stars === s)}>{s ? `${s}★` : "All"}</button>)}</div>
    </Toolbar>
    <div className="grid gap-3 sm:grid-cols-2">{list.map((r, i) => (!stars || r.rating === stars) && (
      <div key={i} className="rounded-xl border p-4"><p className="text-chart-4">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
        <p className="mt-2 text-sm">"{r.text}"</p><p className="mt-2 text-xs text-muted-foreground">— {r.name}</p>
        {r.reply ? <p className="mt-2 rounded-lg bg-accent p-2 text-xs"><b>Your reply:</b> {r.reply}</p> :
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("reply"); if (v) setList((l) => l.map((x, j) => j === i ? { ...x, reply: String(v) } : x)); }}>
            <input name="reply" placeholder="Write a reply..." className={inp} /><button className={btn}>Reply</button></form>}
      </div>))}</div>
  </>);
}

/* ---------------- Settings ---------------- */
function SettingsPage() {
  const [s, setS] = usePersistent("settings", { owner: "Chef Rohan", business: "Rohan's Kitchen", phone: "+244 923 000 000", address: "Luanda, Angola", tax: 14, delivery: 1500, email: true, sms: false });
  const [saved, setSaved] = useState(false);
  return (
    <form onSubmit={(e) => {
      e.preventDefault(); const f = new FormData(e.currentTarget);
      setS({ owner: String(f.get("owner")), business: String(f.get("business")), phone: String(f.get("phone")), address: String(f.get("address")), tax: +f.get("tax")!, delivery: +f.get("delivery")!, email: f.get("email") === "on", sms: f.get("sms") === "on" });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    }} key={JSON.stringify(s)} className="grid max-w-2xl gap-3 sm:grid-cols-2">
      <label className="text-xs">Owner name<input name="owner" defaultValue={s.owner} className={inp} /></label>
      <label className="text-xs">Business name<input name="business" defaultValue={s.business} className={inp} /></label>
      <label className="text-xs">Phone<input name="phone" defaultValue={s.phone} className={inp} /></label>
      <label className="text-xs">Address<input name="address" defaultValue={s.address} className={inp} /></label>
      <label className="text-xs">VAT / IVA (%)<input name="tax" type="number" min={0} defaultValue={s.tax} className={inp} /></label>
      <label className="text-xs">Delivery fee (Kz)<input name="delivery" type="number" min={0} defaultValue={s.delivery} className={inp} /></label>
      <label className="text-xs">Currency<input value="Kwanza (Kz)" disabled className={inp} /></label>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2"><input name="email" type="checkbox" defaultChecked={s.email} /> Email notifications</label>
        <label className="flex items-center gap-2"><input name="sms" type="checkbox" defaultChecked={s.sms} /> SMS notifications</label>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className={btn}>Save</button>
        <button type="button" onClick={() => { Object.keys(localStorage).filter((k) => k.startsWith("fa:")).forEach((k) => localStorage.removeItem(k)); location.reload(); }} className="rounded-lg border px-4 py-2 text-sm text-destructive">Reset all data</button>
        {saved && <p className="text-sm text-success">Settings saved!</p>}
      </div>
    </form>
  );
}

function Section() {
  const { section } = Route.useParams();
  const label = nav.find((n) => n.to === "/" + section)!.label;
  const [q, setQ] = useState("");
  const pages: Record<string, ReactNode> = {
    orders: <Orders q={q} />, "menu-items": <MenuItems q={q} />, categories: <Categories q={q} />, customers: <Customers q={q} />,
    inventory: <Inventory q={q} />, analytics: <Analytics />, reports: <Reports />, marketing: <Marketing />, reviews: <Reviews />, settings: <SettingsPage />,
  };
  return (
    <Shell title={label} search={q} onSearch={setQ}>
      <h1 className="mb-4 text-2xl font-bold">{label}</h1>
      <Card key={section}>{pages[section]}</Card>
    </Shell>
  );
}
