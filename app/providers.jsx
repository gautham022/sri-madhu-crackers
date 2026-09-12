"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { dict as dictionaries } from "@/lib/i18n";

// ---------- Theme ----------
const ThemeCtx = createContext(null);
export function useTheme() { return useContext(ThemeCtx); }

// ---------- Language (with smooth crossfade) ----------
const LangCtx = createContext(null);
export function useLang() { return useContext(LangCtx); }

// ---------- Cart ----------
const CartCtx = createContext(null);
export function useCart() { return useContext(CartCtx); }

// ---------- Auth ----------
const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

// ---------- Toast ----------
const ToastCtx = createContext(null);
export function useToast() { return useContext(ToastCtx); }

export function Providers({ children }) {
  // theme
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("smc-theme");
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(saved ? saved === "dark" : !!prefers);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("smc-theme", dark ? "dark" : "light");
  }, [dark]);

  // language
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    setLangState(localStorage.getItem("smc-lang") || "en");
  }, []);
  const [switching, setSwitching] = useState(false);
  const setLang = useCallback((code) => {
    if (code === lang) return;
    setSwitching(true);
    document.body.classList.add("lang-fade-out");
    setTimeout(() => {
      setLangState(code);
      localStorage.setItem("smc-lang", code);
      document.body.classList.remove("lang-fade-out");
      document.body.classList.add("lang-fade-in");
      setTimeout(() => document.body.classList.remove("lang-fade-in"), 350);
      setSwitching(false);
    }, 220);
  }, [lang]);
  const t = (k) => dictionaries[lang]?.[k] ?? dictionaries.en[k] ?? k;

  // cart
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("smc-cart") || "{}")); } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("smc-cart", JSON.stringify(cart));
  }, [cart]);
  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const setQty = (id, q) => setCart((c) => {
    const n = { ...c };
    if (q <= 0) delete n[id]; else n[id] = q;
    return n;
  });
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // auth
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me");
      const d = await r.json();
      setUser(d.user || null);
    } catch { setUser(null); }
  }, []);
  useEffect(() => { refreshUser(); }, [refreshUser]);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    location.href = "/";
  };

  // toast
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg) => {
    const id = Math.random();
    setToasts((ts) => [...ts, { id, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 2200);
  }, []);

  return (
    <ThemeCtx.Provider value={{ dark, setDark }}>
      <LangCtx.Provider value={{ lang, setLang, t, switching }}>
        <CartCtx.Provider value={{ cart, addToCart, setQty, cartCount, cartOpen, setCartOpen }}>
          <AuthCtx.Provider value={{ user, refreshUser, logout, loginOpen, setLoginOpen }}>
            <ToastCtx.Provider value={toast}>
              {children}
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
                {toasts.map((x) => (
                  <div key={x.id} className="toast px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e63946] to-[#ff9e00] text-white font-semibold shadow-lg">
                    {x.msg}
                  </div>
                ))}
              </div>
            </ToastCtx.Provider>
          </AuthCtx.Provider>
        </CartCtx.Provider>
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
