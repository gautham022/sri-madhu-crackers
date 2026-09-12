"use client";
import { useEffect, useState } from "react";
import { useLang } from "../providers";
import { motion } from "framer-motion";

const STATUS_COLORS = { placed: "#ffd166", paid: "#80ed99", delivered: "#4cc9f0", cancelled: "#e63946" };

export default function Orders() {
  const { t } = useLang();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || d.error ? d.orders || [] : []));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-center mb-3">📦 {t("orders")}</h1>
      <div className="fire-divider w-40 mx-auto mb-10" />
      {!orders && <div className="shimmer rounded-2xl h-40" />}
      {orders && orders.length === 0 && <div className="text-center py-16 muted-text">{t("no_orders")}</div>}
      <div className="space-y-4">
        {orders && orders.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card-surface border rounded-2xl p-5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <div className="font-bold text-sm">{t("order_id")}: {o.id}</div>
                <div className="text-xs muted-text">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: STATUS_COLORS[o.status] + "25", color: STATUS_COLORS[o.status] }}>
                {o.status.toUpperCase()}
              </span>
              <div className="font-black text-[#e63946]">₹{o.total?.toLocaleString("en-in")}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {o.items.map((x) => (
                <span key={x.id} className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "var(--border)" }}>
                  {x.name} × {x.qty}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
