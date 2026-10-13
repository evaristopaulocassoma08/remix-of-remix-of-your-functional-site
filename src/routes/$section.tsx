import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Card, nav } from "@/components/Shell";
import { orders, dishes, customers, inventory, reviews, categories, trend, inr, type OrderStatus } from "@/lib/data";

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
    ] };
  },
  component: Section,
});

const th = "px-3 py-2 text-left text-xs font-semibold text-muted-foreground";
const td = "px-3 py-2 border-t text-sm";

function Section() {
  const { section } = Route.useParams();
  const label = nav.find((n) => n.to === "/" + section)!.label;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [saved, setSaved] = useState(false);
  const m = (s: string) => s.toLowerCase().includes(q.toLowerCase());

  let body;
  switch (section) {
    case "orders":
      body = (<>
        <div className="mb-3 flex flex-wrap gap-2">{(["All", "Completed", "Preparing", "Pending", "Cancelled"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs ${filter === f ? "border-primary bg-accent text-primary" : ""}`}>{f}</button>))}</div>
        <table className="w-full"><thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Dish</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>Time</th></tr></thead>
          <tbody>{orders.filter((o) => (filter === "All" || o.status === filter) && (m(o.dish) || m(o.customer) || m(o.id))).map((o) => (
            <tr key={o.id}><td className={td}>{o.id}</td><td className={td}>{o.customer}</td><td className={td}>{o.dish}</td><td className={td}>{inr(o.amount)}</td><td className={td}><span className="rounded-full bg-accent px-2 py-0.5 text-xs">{o.status}</span></td><td className={td}>{o.time}</td></tr>))}</tbody></table>
      </>);
      break;
    case "menu-items":
      body = <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{dishes.filter((d) => m(d.name)).map((d) => (
        <div key={d.id} className="flex items-center gap-3 rounded-xl border p-3"><span className="text-3xl">{d.emoji}</span><div className="flex-1"><p className="font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{d.category}</p></div><b>{inr(d.price)}</b></div>))}</div>;
      break;
    case "categories":
      body = <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((c) => (
        <div key={c.name} className="rounded-xl border p-4"><span className="block h-2 w-10 rounded-full" style={{ background: c.color }} /><p className="mt-3 font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.orders} orders</p></div>))}</div>;
      break;
    case "customers":
      body = <table className="w-full"><thead><tr><th className={th}>Name</th><th className={th}>Orders</th><th className={th}>Spent</th><th className={th}>Joined</th></tr></thead>
        <tbody>{customers.filter((c) => m(c.name)).map((c) => <tr key={c.name}><td className={td}>{c.name}</td><td className={td}>{c.orders}</td><td className={td}>{inr(c.spent)}</td><td className={td}>{c.joined}</td></tr>)}</tbody></table>;
      break;
    case "inventory":
      body = <table className="w-full"><thead><tr><th className={th}>Item</th><th className={th}>Stock</th><th className={th}>Min</th><th className={th}>Status</th></tr></thead>
        <tbody>{inventory.filter((i) => m(i.item)).map((i) => <tr key={i.item}><td className={td}>{i.item}</td><td className={td}>{i.stock} {i.unit}</td><td className={td}>{i.min} {i.unit}</td>
          <td className={td}><span className={`rounded-full px-2 py-0.5 text-xs ${i.stock < i.min ? "bg-destructive text-destructive-foreground" : "bg-accent"}`}>{i.stock < i.min ? "Low stock" : "OK"}</span></td></tr>)}</tbody></table>;
      break;
    case "reviews":
      body = <div className="grid gap-3 sm:grid-cols-2">{reviews.map((r) => <div key={r.name} className="rounded-xl border p-4"><p className="text-chart-4">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p><p className="mt-2 text-sm">"{r.text}"</p><p className="mt-2 text-xs text-muted-foreground">— {r.name}</p></div>)}</div>;
      break;
    case "settings":
      body = <form onSubmit={(e) => { e.preventDefault(); setSaved(true); }} className="max-w-md space-y-3">
        <input defaultValue="Chef Rohan" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <input defaultValue="Rohan's Kitchen" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Email notifications</label>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
        {saved && <p className="text-sm text-success">Settings saved!</p>}
      </form>;
      break;
    default:
      body = <table className="w-full"><thead><tr><th className={th}>Period</th><th className={th}>Revenue</th><th className={th}>Orders</th><th className={th}>Avg Order</th></tr></thead>
        <tbody>{trend.week.map((d) => <tr key={d.label}><td className={td}>{d.label}</td><td className={td}>{inr(d.revenue)}</td><td className={td}>{d.orders}</td><td className={td}>{inr(Math.round(d.revenue / d.orders))}</td></tr>)}</tbody></table>;
  }

  return (
    <Shell title={label} search={q} onSearch={setQ}>
      <h1 className="mb-4 text-2xl font-bold">{label}</h1>
      <Card className="overflow-x-auto">{body}</Card>
    </Shell>
  );
}
