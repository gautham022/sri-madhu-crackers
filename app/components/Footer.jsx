"use client";
import Link from "next/link";
import { useLang } from "../providers";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer id="contact" className="border-t mt-20" style={{ borderColor: "var(--border)" }}>
      <div className="fire-divider max-w-7xl mx-auto mt-6" />
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" className="w-9 h-9 rounded-full" alt="logo" />
            <span className="font-black text-base grad-text">{t("shopName")}</span>
          </div>
          <p className="muted-text leading-relaxed">{t("tagline")}.<br />{t("safety_text")}</p>
          <div className="mt-4 text-xs muted-text">{t("hours")}</div>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("quick_links")}</h4>
          <ul className="space-y-2 muted-text">
            <li><Link className="hover:text-[#e63946] transition" href="/">{t("nav_home")}</Link></li>
            <li><Link className="hover:text-[#e63946] transition" href="/shop">{t("nav_shop")}</Link></li>
            <li><Link className="hover:text-[#e63946] transition" href="/#about">{t("nav_about")}</Link></li>
            <li><Link className="hover:text-[#e63946] transition" href="/orders">{t("orders")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("contact_title")}</h4>
          <ul className="space-y-2 muted-text">
            <li>📍 {t("address")}: D.No 3/203/D, Palammal Colony, Thayilpatti, Sivakasi, TN - 626131</li>
            <li>📞 <a href="tel:9600331523" className="hover:text-[#e63946]">9600331523</a></li>
            <li>✉️ <a href="mailto:mahendranramar80@gmail.com" className="hover:text-[#e63946]">mahendranramar80@gmail.com</a></li>
            <li>🌐 madhucrackers.com</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("follow_us")}</h4>
          <div className="flex gap-3 text-xl">
            <a href="#" className="hover:scale-125 transition">📘</a>
            <a href="#" className="hover:scale-125 transition">📸</a>
            <a href="#" className="hover:scale-125 transition">▶️</a>
            <a href="https://wa.me/919600331523" className="hover:scale-125 transition">💬</a>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-[#e63946]/10 text-xs leading-relaxed">
            ⚠️ <b>{t("safety_title")}</b><br />{t("safety_text")}
          </div>
        </div>
      </div>
      <div className="text-center text-xs muted-text py-5 border-t" style={{ borderColor: "var(--border)" }}>
        © 2026 {t("shopName")} · Sivakasi · 💥 Made with a bang
      </div>
    </footer>
  );
}
