import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { usePersistent } from "@/lib/store";
import { Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, Download, Plus, Banknote, ShoppingBag, UserPlus, ShoppingCart, ArrowUp, Crown, Lightbulb, X } from "lucide-react";
import { Shell, Card } from "@/components/Shell";
import { trend, categories, dishes as seed, kz, type Range, type Dish } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FoodAnalytics" },
      { name: "description", content: "Track revenue, orders, top dishes and insights for your food business." },
      { property: "og:title", content: "Dashboard — FoodAnalytics" },
      { property: "og:description", content: "Smart food insights for restaurants." },
    ],
  }),
  component: Dashboard,
});

const spark = (s: number) => Array.from({ length: 8 }, (_, i) => ({ v: 3 + Math.sin(i * 1.3 + s) * 2 + i * 0.6 }));

function Dashboard() {
  const [range, setRange] = useState<Range>("today");
  const [q, setQ] = useState("");
  const [dishes, setDishes] = usePersistent<Dish[]>("dishes", seed);
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState("2026-07-05");
  const data = trend[range];
  const totals = useMemo(() => ({ rev: data.reduce((a, b) => a + b.revenue, 0), ord: data.reduce((a, b) => a + b.orders, 0), peak: data.reduce((a, b) => (b.revenue > a.revenue ? b : a)) }), [data]);
  const shown = dishes.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.orders * b.price - a.orders * a.price).slice(0, 5);
  const totalCat = categories.reduce((a, c) => a + c.orders, 0);

  const download = () => {
    const rows = [["Period", "Revenue", "Orders"], ...data.map((d) => [d.label, d.revenue, d.orders])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `food-report-${range}.csv`;
    a.click();
  };

  const stats = [
    { label: "Total Revenue", value: "Kz 3.245.000", pct: "8.2%", icon: Banknote, color: "var(--chart-1)" },
    { label: "Total Orders", value: "168", pct: "6.2%", icon: ShoppingBag, color: "var(--chart-1)" },
    { label: "New Customers", value: "52", pct: "4.1%", icon: UserPlus, color: "var(--chart-2)" },
    { label: "Average Order Value", value: "Kz 19.300", pct: "3.7%", icon: ShoppingCart, color: "var(--chart-4)" },
  ];
  const status = [
    { l: "Completed", n: 108, p: 64, c: "var(--chart-2)" },
    { l: "Preparing", n: 37, p: 22, c: "var(--chart-4)" },
    { l: "Pending", n: 17, p: 10, c: "var(--chart-1)" },
    { l: "Cancelled", n: 6, p: 4, c: "var(--muted-foreground)" },
  ];

  return (
    <Shell title="Dashboard" search={q} onSearch={setQ}>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Good Morning, Chef! 👋</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your food business today.</p>
        </div>
        <label className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
          <Calendar className="h-4 w-4" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent outline-none" />
        </label>
        <button onClick={download} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"><Download className="h-4 w-4" />Download Report</button>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-semibold"><Plus className="h-4 w-4" />Add Item</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm"><span className="grid h-7 w-7 place-items-center rounded-md text-primary-foreground" style={{ background: s.color }}><s.icon className="h-4 w-4" /></span>{s.label}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-success"><ArrowUp className="h-3 w-3" />{s.pct} <span className="text-muted-foreground">vs Yesterday</span></p>
            </div>
            <div className="h-12 w-20"><ResponsiveContainer><LineChart data={spark(i)}><Line dataKey="v" stroke={s.color} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <div className="flex items-center justify-between"><h3 className="font-semibold">Revenue & Orders Trend</h3>
            <div className="flex gap-3 text-xs"><span className="text-primary">— Revenue (Kz)</span><span className="text-success">— Orders</span></div></div>
          <div className="mt-3 flex gap-2">
            {(["today", "week", "month"] as Range[]).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-full border px-3 py-1 text-xs font-medium ${range === r ? "border-primary bg-accent text-primary" : ""}`}>
                {r === "today" ? "Today" : r === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-2)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area yAxisId="l" type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#r)" strokeWidth={2} />
                <Area yAxisId="r" type="monotone" dataKey="orders" stroke="var(--chart-2)" fill="url(#o)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-accent p-3 text-xs md:grid-cols-4">
            <div>Revenue<p className="text-sm font-bold">{kz(totals.rev)}</p></div>
            <div>Orders<p className="text-sm font-bold">{totals.ord}</p></div>
            <div>Peak Revenue<p className="text-sm font-bold">{kz(totals.peak.revenue)} @ {totals.peak.label}</p></div>
            <div>Peak Orders<p className="text-sm font-bold">{totals.peak.orders} @ {totals.peak.label}</p></div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <h3 className="font-semibold">Orders by Category</h3>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="relative h-52 w-52">
              <ResponsiveContainer><PieChart><Pie data={categories} dataKey="orders" innerRadius={60} outerRadius={95} startAngle={90} endAngle={-270}>{categories.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold">{totalCat}</p><p className="text-[10px] text-muted-foreground">TOTAL ORDERS</p></div></div>
            </div>
            <ul className="flex-1 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c.name} className="flex items-start gap-2"><span className="mt-1 h-3 w-3 rounded-full" style={{ background: c.color }} />
                  <div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.orders} Orders</p></div>
                  <span className="font-semibold">{Math.round((c.orders / totalCat) * 100)}%</span></li>
              ))}
            </ul>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-accent p-3 text-xs"><Crown className="h-6 w-6 text-primary" /><div><p className="font-semibold text-primary">Top Category</p><p><b>Main Course</b> is the most ordered category this week.</p></div></div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h3 className="mb-3 font-semibold">Top Selling Dishes</h3>
          <ul className="space-y-3">
            {shown.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-[10px] text-primary-foreground">{i + 1}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-lg">{d.emoji}</span>
                <div className="flex-1"><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.orders} Orders</p></div>
                <span className="font-semibold">{kz(d.orders * d.price)}</span>
              </li>
            ))}
            {!shown.length && <p className="text-sm text-muted-foreground">No dishes found.</p>}
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold">Order Status</h3>
          <div className="mx-auto mt-2 h-32 w-60">
            <ResponsiveContainer><PieChart><Pie data={status} dataKey="n" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={90}>{status.map((s) => <Cell key={s.l} fill={s.c} />)}</Pie></PieChart></ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {status.map((s) => (<div key={s.l} className="rounded-lg bg-accent p-2"><p className="text-xs font-semibold" style={{ color: s.c }}>{s.p}%</p><p className="font-bold">{s.n}</p><p className="text-[10px] text-muted-foreground">{s.l}</p></div>))}
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Lightbulb className="h-5 w-5 text-chart-4" />Business Insights</h3>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border text-sm">
            <div className="border-b border-r p-3"><p className="text-xs text-muted-foreground">Revenue</p><p className="font-bold text-success">↑ 8.2%</p><p className="text-xs">vs Yesterday</p></div>
            <div className="border-b p-3"><p className="text-xs text-muted-foreground">Top Item</p><p className="font-bold">{shown[0]?.name ?? "-"}</p></div>
            <div className="border-r p-3"><p className="text-xs text-muted-foreground">Best Seller</p><p className="font-bold">Muamba de Galinha</p></div>
            <div className="p-3"><p className="text-xs text-muted-foreground">Peak Hour</p><p className="font-bold">1:00 PM – 2:00 PM</p></div>
          </div>
          <p className="mt-3 rounded-lg bg-accent p-2 text-center text-xs">Keep going! You're performing great today. 🎉</p>
        </Card>
      </div>

      {adding && <AddItem onClose={() => setAdding(false)} onAdd={(d) => { setDishes((x) => [...x, d]); setAdding(false); }} />}
    </Shell>
  );
}

function AddItem({ onClose, onAdd }: { onClose: () => void; onAdd: (d: Dish) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [orders, setOrders] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); if (!name || !price) return; onAdd({ id: crypto.randomUUID(), name, price: +price, orders: +orders || 0, emoji: "🍽️", category: "Main Course" }); }}
        className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-center justify-between"><h3 className="font-semibold">Add Menu Item</h3><button type="button" onClick={onClose}><X className="h-4 w-4" /></button></div>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Dish name" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <input required type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (Kz)" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <input type="number" min={0} value={orders} onChange={(e) => setOrders(e.target.value)} placeholder="Orders so far" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <button className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground">Add Item</button>
      </form>
    </div>
  );
}
