"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang, useCart, useToast } from "../providers";
import Fireworks from "./Fireworks";
import ProductCard from "./ProductCard";

const CATEGORY_IMGS = {
  "Sparklers": "/products/sparklers/30-cm-color-5pcsbox.png",
  "Flower Pots": "/products/flower-pot/flower-pots-big-10-pcs-box.png",
  "Ground Chakkers": "/products/ground-chakkers/ground-chakkar-big-10-pcs.png",
  "Twinkling Stars": "/products/twinkling/4-twinkling-star-10-pcs-box.png",
  "Rockets": "/products/rocket/whistling-rocket-10pcsbox.png",
  "Bombs": "/products/bomb/555-bomb-10pcsbox.png",
  "Garlands (Prime)": "/products/garlands-prime/5000-walaprime.png",
  "Garlands (Classic)": "/products/garlands-classic/2000-wala-classic.png",
  "Giant Crackers": "/products/giant-crackers/56-giant-crackers-1pcspkt.png",
  "Baby Variety Items": "/products/baby-variety-items/drone-5pcsbox.png",
  "Colour Rider Shots": "/products/colour-rider-shots/50-shot-color-rider-1pcs.png",
  "Multi Colour Shots": "/products/multi-colour-shot/60-shot-multi-color.png",
  "Mini Aerial Fancy": "/products/mini-aerial-shot/sky-king-5-pcsbox.png",
  "Mega Display": "/products/mega-display/4-fancy-6-design-available-1pcs.png",
  '2.25" Colour Fountains': "/products/2-q-color-fountain/tom-jerry-gold-1-pcsbox.png",
  '1.75" Colour Fountains': "/products/1-3q-color-fountain/orereo-red-5pcsbox.png",
  "Gift Boxes": "/products/gift-box/50-items-gift-box.png",
  "Matches": "/products/matches/dora-matches-3pcsbox.png",
  "Guns & Roll Caps": "/products/gun-roll-cap/gun-super-deluxe-1pcs.png",
  "One Sound Crackers": "/products/one-sound-creacker/6-jalli-kattu-5pcspkt.png",
  "Adiyal Paper Bombs": "/products/adiyal-paper-bomb/adiyal-paper-bomb-1kg.png",
  "Enjoy Pencil": "/products/enjoy-pencil/magic-feather-3pcsbox.png",
};

export default function HomeContent({ products }) {
  const { t } = useLang();
  const { addToCart } = useCart();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const categories = [...new Set(products.map((p) => p.category))];
  const featured = products.filter((p) => p.price && p.price >= 1000).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e63946]/15 via-transparent to-transparent" />
        <Fireworks />
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#ffd166]/20 text-[#ff9e00] mb-6">
              🎆 {t("tagline")}
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              {t("hero_title1")}<br />
              <span className="grad-text">{t("hero_title2")}</span> 🧨
            </h1>
            <p className="mt-6 max-w-2xl mx-auto muted-text text-lg">{t("hero_sub")}</p>
            <div className="mt-9 flex flex-wrap gap-4 justify-center">
              <a href="/shop" className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] shadow-xl shadow-[#e63946]/40 hover:scale-105 active:scale-95 transition">
                🛍️ {t("shop_now")}
              </a>
              <a href="#cats" className="px-8 py-3.5 rounded-full font-bold border-2 hover:border-[#7b2cbf] hover:text-[#7b2cbf] transition" style={{ borderColor: "var(--border)" }}>
                {t("view_offers")}
              </a>
            </div>
          </motion.div>
          {/* USP strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-sm font-semibold">
            {[
              ["🚚", t("free_ship")],
              ["✅", t("quality")],
              ["🛡️", t("safe_del")],
              ["📞", t("support") + ": 9600331523"],
            ].map(([e, txt]) => (
              <div key={txt} className="card-surface border rounded-2xl px-4 py-4 hover:-translate-y-1 transition">
                <div className="text-2xl mb-1">{e}</div>{txt}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="cats" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3">✨ {t("categories")}</h2>
        <div className="fire-divider w-48 mx-auto mb-12" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((c, i) => (
            <motion.a key={c} href={`/shop?cat=${encodeURIComponent(c)}`}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.4 }}
              className="card-surface border rounded-2xl p-5 text-center group cursor-pointer hover:shadow-xl">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-2 ring-[#e63946]/20 group-hover:ring-[#e63946] transition mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={CATEGORY_IMGS[c] || "/logo.png"} alt={c} className="w-full h-full object-cover group-hover:scale-110 transition" />
              </div>
              <div className="font-bold text-sm">{c}</div>
              <div className="text-xs muted-text mt-1">{products.filter((p) => p.category === c).length} {t("items")}</div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3">🔥 {t("featured")}</h2>
        <div className="fire-divider w-48 mx-auto mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="/shop" className="inline-block px-8 py-3.5 rounded-full font-bold border-2 hover:bg-[#e63946] hover:text-white hover:border-[#e63946] transition" style={{ borderColor: "var(--border)" }}>
            {t("all_products")} →
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-black mb-4">🎆 {t("about_title")}</h2>
          <div className="fire-divider w-32 mb-6" />
          <p className="muted-text text-lg leading-relaxed">{t("about_text")}</p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[["40+", "Years"], ["120+", "Products"], ["23", "Categories"]].map(([n, l]) => (
              <div key={l} className="card-surface border rounded-2xl py-4">
                <div className="text-2xl font-black grad-text">{n}</div>
                <div className="text-xs muted-text">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/products/gift-box/50-items-gift-box.png" alt="Gift box" className="w-full h-full object-cover hover:scale-105 transition duration-700" />
        </motion.div>
      </section>
    </div>
  );
}
