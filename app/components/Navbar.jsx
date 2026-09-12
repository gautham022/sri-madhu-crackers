"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme, useLang, useCart, useAuth } from "../providers";
import { LANGS } from "@/lib/i18n";

export default function Navbar() {
  const { dark, setDark } = useTheme();
  const { lang, setLang, t } = useLang();
  const { cartCount, setCartOpen } = useCart();
  const { user, setLoginOpen, logout, mode } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 82%, transparent)" }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#e63946]/50" />
          <div className="leading-tight hidden sm:block">
            <div className="font-black text-lg grad-text">{t("shopName")}</div>
            <div className="text-[10px] muted-text tracking-wide">{t("since")}</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-auto text-sm font-semibold">
          <Link className="px-3 py-2 rounded-lg hover:bg-[#e63946]/10 hover:text-[#e63946] transition" href="/">{t("nav_home")}</Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[#e63946]/10 hover:text-[#e63946] transition" href="/shop">{t("nav_shop")}</Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[#e63946]/10 hover:text-[#e63946] transition" href="/#about">{t("nav_about")}</Link>
          <Link className="px-3 py-2 rounded-lg hover:bg-[#e63946]/10 hover:text-[#e63946] transition" href="/#contact">{t("nav_contact")}</Link>
        </nav>

        <div className="flex items-center gap-1.5 ml-auto md:ml-0" ref={ref}>
          {/* language picker */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg border text-sm font-semibold hover:border-[#e63946] transition"
              style={{ borderColor: "var(--border)" }}>
              <span>{LANGS.find((l) => l.code === lang)?.flag}</span>
              <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)?.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-xl border card-surface border-solid z-50">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#e63946]/10 transition ${lang === l.code ? "text-[#e63946] font-bold" : ""}`}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* theme toggle */}
          <button onClick={() => setDark(!dark)} title={dark ? t("light_mode") : t("dark_mode")}
            className="p-2.5 rounded-lg border hover:border-[#ffd166] transition relative"
            style={{ borderColor: "var(--border)" }}>
            <span className="text-base">{dark ? "☀️" : "🌙"}</span>
          </button>

          {/* cart */}
          <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-lg border hover:border-[#e63946] transition" style={{ borderColor: "var(--border)" }}>
            <span className="text-base">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#e63946] text-white text-[10px] font-bold w-5 h-5 rounded-full grid place-items-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* auth (hidden in catalog-only mode) */}
          {mode !== "static" && (user ? (
            <div className="flex items-center gap-1.5">
              {user.role === "admin" && (
                <Link href="/admin" className="hidden sm:block px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7b2cbf] to-[#e63946] text-white">
                  {t("admin_panel")}
                </Link>
              )}
              <Link href="/orders" className="hidden sm:block px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#e63946]/10">{t("orders")}</Link>
              <button onClick={logout} className="px-3 py-2 rounded-lg text-sm font-semibold border hover:border-[#e63946] transition" style={{ borderColor: "var(--border)" }}>
                {t("logout")}
              </button>
            </div>
          ) : (
            <button onClick={() => setLoginOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] hover:opacity-90 active:scale-95 transition shadow-md shadow-[#e63946]/30">
              {t("login")}
            </button>
          ))}

          <button className="md:hidden p-2 rounded-lg border" style={{ borderColor: "var(--border)" }} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-1 text-sm font-semibold border-t" style={{ borderColor: "var(--border)" }}>
          <Link href="/" onClick={() => setMenuOpen(false)} className="py-2">{t("nav_home")}</Link>
          <Link href="/shop" onClick={() => setMenuOpen(false)} className="py-2">{t("nav_shop")}</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="py-2">{t("nav_about")}</Link>
          <Link href="/#contact" onClick={() => setMenuOpen(false)} className="py-2">{t("nav_contact")}</Link>
          {user?.role === "admin" && <Link href="/admin" onClick={() => setMenuOpen(false)} className="py-2 text-[#7b2cbf] font-bold">{t("admin_panel")}</Link>}
          {user && <Link href="/orders" onClick={() => setMenuOpen(false)} className="py-2">{t("orders")}</Link>}
        </div>
      )}
    </header>
  );
}
