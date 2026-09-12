"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useLang, useAuth, useToast } from "../providers";

export default function CartDrawer() {
  const { cart, setQty, cartOpen, setCartOpen } = useCart();
  const { t } = useLang();
  const { user, setLoginOpen } = useAuth();
  const [products, setProducts] = useState([]);
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", pincode: "", payment: "razorpay" });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);
  const toast = useToast();

  useEffect(() => { fetch("/api/products").then((r) => r.json()).then(setProducts); }, []);
  const items = Object.entries(cart).map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty })).filter((x) => x.product);
  const total = items.reduce((a, x) => a + x.product.price * x.qty, 0);

  const placeOrder = async () => {
    if (!form.name || !form.address || !form.pincode) return toast("Please fill all fields");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((x) => ({ id: x.product.id, name: x.product.name, price: x.product.price, qty: x.qty })),
          total, ...form,
        }),
      });
      const data = await res.json();
      if (res.status === 401) { setLoginOpen(true); setCartOpen(false); return; }
      if (!res.ok) throw new Error(data.error || "failed");
      if (data.razorpayOrder && !data.mock) {
        // load Razorpay checkout script
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve; s.onerror = reject;
          document.body.appendChild(s);
        });
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.razorpayOrder.amount,
          currency: "INR",
          name: "Sri Madhu Crackers",
          description: `Order ${data.order.id}`,
          order_id: data.razorpayOrder.id,
          prefill: { name: form.name, contact: user?.phone },
          theme: { color: "#e63946" },
          handler: async (resp) => {
            const v = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.order.id, ...resp }),
            }).then((r) => r.json());
            if (v.ok) { setPlaced(data.order); } else { toast("Payment verification failed"); }
          },
        });
        rzp.open();
      } else {
        setPlaced(data.order); // mock payment (dev)
      }
    } catch (e) {
      toast("Order failed: " + e.message);
    } finally { setPlacing(false); }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setCartOpen(false); setCheckout(false); setPlaced(null); }} />
          <motion.div className="fixed right-0 top-0 h-full w-full max-w-md z-[70] flex flex-col shadow-2xl"
            style={{ background: "var(--bg2)" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-black text-xl">🛒 {t("your_cart")}</h3>
              <button onClick={() => { setCartOpen(false); setCheckout(false); setPlaced(null); }} className="p-2 rounded-lg hover:bg-[#e63946]/10 text-xl">✕</button>
            </div>

            {placed ? (
              <div className="flex-1 grid place-items-center p-8 text-center">
                <div>
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-2xl font-black text-[#80ed99]">{t("order_placed")}</h3>
                  <p className="muted-text mt-2">{t("order_id")}: <b>{placed.id}</b></p>
                  <p className="muted-text">{t("total")}: ₹{placed.total?.toLocaleString("en-in")}</p>
                  <button onClick={() => { setCartOpen(false); setPlaced(null); location.href = "/orders"; }}
                    className="mt-6 px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00]">
                    {t("orders")}
                  </button>
                </div>
              </div>
            ) : checkout ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <h4 className="font-bold text-lg">📋 {t("order_summary")}</h4>
                {items.map((x) => (
                  <div key={x.product.id} className="flex justify-between text-sm muted-text">
                    <span>{x.product.name} × {x.qty}</span>
                    <span>₹{(x.product.price * x.qty).toLocaleString("en-in")}</span>
                  </div>
                ))}
                <div className="fire-divider" />
                <div className="flex justify-between font-black text-lg"><span>{t("total")}</span><span className="text-[#e63946]">₹{total.toLocaleString("en-in")}</span></div>
                <div className="space-y-3 pt-2">
                  <input className="w-full p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <textarea className="w-full p-3 rounded-xl border bg-transparent" rows={3} style={{ borderColor: "var(--border)" }} placeholder={t("address_ph")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  <input className="w-full p-3 rounded-xl border bg-transparent" style={{ borderColor: "var(--border)" }} placeholder={t("pincode")} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setForm({ ...form, payment: "razorpay" })}
                      className={`p-3 rounded-xl border text-sm font-bold transition ${form.payment === "razorpay" ? "border-[#e63946] text-[#e63946]" : ""}`}
                      style={form.payment !== "razorpay" ? { borderColor: "var(--border)" } : {}}>{t("online_pay")}</button>
                    <button onClick={() => setForm({ ...form, payment: "cod" })}
                      className={`p-3 rounded-xl border text-sm font-bold transition ${form.payment === "cod" ? "border-[#e63946] text-[#e63946]" : ""}`}
                      style={form.payment !== "cod" ? { borderColor: "var(--border)" } : {}}>{t("cod")}</button>
                  </div>
                  <button disabled={placing} onClick={placeOrder}
                    className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] hover:opacity-90 disabled:opacity-50">
                    {placing ? "..." : form.payment === "cod" ? t("place_order") : `${t("pay_now")} ₹${total.toLocaleString("en-in")}`}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {items.length === 0 && (
                    <div className="text-center py-20 muted-text">
                      <div className="text-5xl mb-4">🎆</div>{t("cart_empty")}
                    </div>
                  )}
                  {items.map(({ product, qty }) => (
                    <motion.div key={product.id} layout className="flex gap-3 items-center card-surface border rounded-2xl p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-contain rounded-xl bg-white/5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs line-clamp-2">{product.name}</div>
                        <div className="text-[#e63946] font-black text-sm">₹{(product.price * qty).toLocaleString("en-in")}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setQty(product.id, qty - 1)} className="w-7 h-7 rounded-full border font-bold" style={{ borderColor: "var(--border)" }}>−</button>
                        <span className="w-5 text-center font-bold text-sm">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} className="w-7 h-7 rounded-full bg-[#e63946] text-white font-bold">+</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {items.length > 0 && (
                  <div className="p-5 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="flex justify-between font-black text-lg mb-4">
                      <span>{t("total")}</span>
                      <span className="text-[#e63946] text-2xl">₹{total.toLocaleString("en-in")}</span>
                    </div>
                    <button onClick={() => setCheckout(true)} className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] hover:opacity-90">
                      {t("checkout")} →
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
