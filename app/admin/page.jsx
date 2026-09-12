"use client";
import { useEffect, useState } from "react";
import { useLang, useAuth, useToast } from "../providers";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";

const EMPTY_FORM = { id: "", name: "", category: "", price: "", image: "" };

export default function Admin() {
  const { t } = useLang();
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [allowed, setAllowed] = useState(null);

  const load = () => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || d));
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(Array.isArray(d.orders) ? d.orders : []));
  };
  useEffect(load, []);
  useEffect(() => { setAllowed(user ? user.role === "admin" : false); }, [user]);

  const saveProduct = async () => {
    if (!form.name || !form.category) return toast("Name & category required");
    const body = { ...form, price: form.price ? Number(form.price) : null, id: form.id || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
    const r = await fetch("/api/products", {
      method: body._edit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return toast(d.error || "Failed");
    toast(body._edit ? "Updated ✓" : t("add_product") + " ✓");
    setForm(EMPTY_FORM); setShowForm(false); load();
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch(`/api/products?id=${p.id}`, { method: "DELETE" });
    toast("Deleted"); load();
  };

  if (allowed === null) return <div className="max-w-6xl mx-auto px-4 py-10"><div className="shimmer h-40 rounded-2xl" /></div>;
  if (!allowed) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="font-black text-xl">{t("admin_panel")}</h2>
      <p className="muted-text mt-2">{t("login_required")} ({t("admin")})</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black">🛠️ {t("admin_panel")}</h1>
        <div className="flex gap-2">
          {[["products", t("all_products")], ["orders", t("all_orders")]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${tab === v ? "bg-[#7b2cbf] text-white border-[#7b2cbf]" : ""}`}
              style={tab !== v ? { borderColor: "var(--border)" } : {}}>{l}</button>
          ))}
        </div>
      </div>

      {tab === "products" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm muted-text">{products?.length || 0} {t("items")}</div>
            <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#7b2cbf] to-[#e63946] hover:opacity-90">
              + {t("add_product")}
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="card-surface border rounded-2xl p-5 mb-8 space-y-3 overflow-hidden">
              <h3 className="font-bold">{form._edit ? `✏️ ${t("edit")}` : `✨ ${t("add_product")}`}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input className="p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("product_name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("category")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} list="cats" />
                <input className="p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("price_rupees")} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })} inputMode="numeric" />
                <input className="p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("image_url")} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <datalist id="cats">{[...new Set((products || []).map((p) => p.category))].map((c) => <option key={c} value={c} />)}</datalist>
              {form.image && <img src={form.image} alt="preview" className="w-24 h-24 object-contain rounded-xl border" style={{ borderColor: "var(--border)" }} />}
              <div className="flex gap-2">
                <button onClick={saveProduct} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#80ed99] !text-black">💾 {t("save")}</button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="px-6 py-2.5 rounded-xl font-bold border" style={{ borderColor: "var(--border)" }}>✕</button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(products || []).map((p) => (
              <ProductCard key={p.id} product={p} adminMode
                onEdit={(pr) => { setForm({ ...pr, _edit: true }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                onDelete={del} />
            ))}
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders && orders.length === 0 && <div className="text-center py-16 muted-text">{t("no_orders")}</div>}
          {(orders || []).map((o) => (
            <div key={o.id} className="card-surface border rounded-2xl p-5">
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{o.id} · {o.name} · 📞 {o.phone}</div>
                  <div className="text-xs muted-text">{o.address} - {o.pincode} · {o.paymentMethod?.toUpperCase()} · {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#e63946]">₹{o.total?.toLocaleString("en-in")}</span>
                  <select value={o.status} onChange={async (e) => {
                    await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, status: e.target.value }) });
                    toast("Status updated"); load();
                  }} className="p-2 rounded-lg border bg-transparent text-xs font-bold" style={{ borderColor: "var(--border)" }}>
                    {["placed", "paid", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-2 text-xs muted-text">{o.items.map((x) => `${x.name} ×${x.qty}`).join(" · ")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
