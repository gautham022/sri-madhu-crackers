"use client";
import { motion } from "framer-motion";
import { useLang, useCart, useToast } from "../providers";

export default function ProductCard({ product, adminMode, onEdit, onDelete }) {
  const { t } = useLang();
  const { addToCart } = useCart();
  const toast = useToast();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.35 }}
      className="p-card card-surface border rounded-2xl overflow-hidden relative group">
      {product.price >= 5000 && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#e63946] text-white">PREMIUM 🔥</div>
      )}
      <div className="aspect-square overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image || "/logo.png"} alt={product.name} loading="lazy"
          className="w-full h-full object-contain p-3 group-hover:scale-110 transition duration-500" />
      </div>
      <div className="p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[#ff9e00]">{product.category}</div>
        <h3 className="font-bold text-sm leading-snug mt-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="mt-2 text-lg font-black text-[#e63946]">
          {product.price ? `₹${product.price.toLocaleString("en-in")}` : <span className="text-sm muted-text">{t("price_on_req")}</span>}
        </div>
        {adminMode ? (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onEdit(product)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#7b2cbf] text-white hover:opacity-90">✏️ {t("edit")}</button>
            <button onClick={() => onDelete(product)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#e63946] text-white hover:opacity-90">🗑️ {t("delete")}</button>
          </div>
        ) : (
          <button disabled={!product.price}
            onClick={() => { addToCart(product.id); toast(t("added_to_cart")); }}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed">
            🛒 {product.price ? t("add_to_cart") : t("price_on_req")}
          </button>
        )}
      </div>
    </motion.div>
  );
}
