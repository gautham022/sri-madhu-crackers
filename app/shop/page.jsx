"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useLang } from "../providers";
import ProductCard from "../components/ProductCard";

function ShopInner() {
  const { t } = useLang();
  const params = useSearchParams();
  const [products, setProducts] = useState(null);
  const [cat, setCat] = useState(params.get("cat") || "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);
  useEffect(() => {
    const c = params.get("cat");
    if (c) setCat(c);
  }, [params]);

  if (!products) return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-5">
      {Array.from({ length: 12 }).map((_, i) => <div key={i} className="shimmer rounded-2xl aspect-[3/4]" />)}
    </div>
  );

  const categories = ["all", ...new Set(products.map((p) => p.category))];
  let list = products;
  if (cat !== "all") list = list.filter((p) => p.category === cat);
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === "low") list = [...list].sort((a, b) => (a.price || 1e9) - (b.price || 1e9));
  if (sort === "high") list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-black text-center mb-3">
        🧨 {t("all_products")}
      </motion.h1>
      <div className="fire-divider w-48 mx-auto mb-8" />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`🔍 ${t("search_ph")}`}
          className="flex-1 p-3.5 rounded-2xl border bg-transparent outline-none focus:border-[#e63946] transition" style={{ borderColor: "var(--border)" }} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="p-3.5 rounded-2xl border bg-transparent outline-none" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <option value="default">{t("filter_cat")}</option>
          <option value="low">₹ ↑</option>
          <option value="high">₹ ↓</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4" style={{ scrollbarWidth: "thin" }}>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition whitespace-nowrap ${cat === c ? "bg-[#e63946] text-white border-[#e63946]" : "hover:border-[#e63946]"}`}
            style={cat !== c ? { borderColor: "var(--border)" } : {}}>
            {c === "all" ? t("all_products") : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {list.length === 0 && <div className="text-center py-20 muted-text text-lg">🔍 0 {t("items")}</div>}
    </div>
  );
}

export default function Shop() {
  return <Suspense><ShopInner /></Suspense>;
}
