import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutGrid, UtensilsCrossed, Tags, ClipboardList, Users, Package, TrendingUp, FileText,
  Megaphone, Star, Settings, Search, Bell, ChevronDown, Menu, X, ChefHat,
} from "lucide-react";
import bowl from "@/assets/bowl.png";

export const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/menu-items", label: "Menu Items", icon: UtensilsCrossed },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const notes = ["New order #ORD-1063 received", "Chicken stock is running low", "Diya left a 5★ review"];

export function Shell({ title, children, search, onSearch }: { title: string; children: ReactNode; search?: string; onSearch?: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [unread, setUnread] = useState(3);
  const [pro, setPro] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r bg-card p-4 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><ChefHat className="h-5 w-5" /></div>
          <div>
            <p className="font-bold leading-tight">Food<span className="text-primary">Analytics</span></p>
            <p className="text-[11px] text-muted-foreground">Smart Food Insights</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent"
              activeProps={{ className: "!bg-primary !text-primary-foreground shadow-glow" }}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 rounded-xl bg-accent p-4 text-center">
          <img src={bowl} alt="Food bowl" loading="lazy" width={816} height={816} className="mx-auto -mt-2 h-24 w-24 object-contain" />
          <p className="mt-2 font-bold">{pro ? "You're Pro! 🎉" : "Upgrade to Pro"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Unlock advanced insights and grow your food business.</p>
          <button onClick={() => setPro(true)} disabled={pro} className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {pro ? "Activated" : "Upgrade Now"}
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 md:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <h2 className="font-semibold">{title}</h2>
          <div className="mx-auto hidden w-full max-w-sm items-center gap-2 rounded-full border bg-background px-4 py-2 md:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search ?? ""} onChange={(e) => onSearch?.(e.target.value)} placeholder="Search food, orders, customers..." className="w-full bg-transparent text-sm outline-none" />
          </div>
          <div className="relative ml-auto flex items-center gap-4 md:ml-0">
            <button className="relative" onClick={() => { setBell(!bell); setUnread(0); }}>
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{unread}</span>}
            </button>
            {bell && (
              <div className="absolute right-0 top-8 z-50 w-64 rounded-xl border bg-popover p-2 shadow-card">
                {notes.map((n) => <p key={n} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{n}</p>)}
              </div>
            )}
            <Link to="/settings"><Settings className="h-5 w-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-primary">CR</div>
              <div className="hidden text-sm sm:block"><p className="font-semibold leading-tight">Chef Rohan</p><p className="text-xs text-muted-foreground">Owner</p></div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>{children}</div>;
}
