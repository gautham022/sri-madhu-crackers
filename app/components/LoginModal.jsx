"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang, useAuth, useToast } from "../providers";

export default function LoginModal() {
  const { loginOpen, setLoginOpen, refreshUser } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (phone.length !== 10) return toast("Enter a valid 10-digit number");
    setBusy(true);
    const r = await fetch("/api/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `+91${phone}`, role }),
    }).then((x) => x.json());
    setBusy(false);
    if (r.devOtp) setDevOtp(r.devOtp);
    toast(t("otp_sent"));
    setStep("otp");
  };

  const verify = async () => {
    setBusy(true);
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `+91${phone}`, otp, role }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { toast(d.error || "Invalid OTP"); return; }
    await refreshUser();
    setLoginOpen(false);
    setStep("phone"); setOtp(""); setDevOtp(null);
    toast(`${t("welcome")}, ${d.user.phone}!`);
    if (d.user.role === "admin") location.href = "/admin";
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-[80] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLoginOpen(false)} />
          <motion.div className="fixed inset-0 z-[90] grid place-items-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <div className="pointer-events-auto w-full max-w-sm rounded-3xl p-7 shadow-2xl border" style={{ background: "var(--bg2)", borderColor: "var(--border)" }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎆</div>
                <h3 className="font-black text-xl">{t("login")}</h3>
                <p className="text-xs muted-text mt-1">{t("shopName")}</p>
              </div>

              {step === "phone" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[["user", "👤 " + t("user")], ["admin", "🛠️ " + t("admin")]].map(([v, label]) => (
                      <button key={v} onClick={() => setRole(v)}
                        className={`py-2.5 rounded-xl text-sm font-bold border transition ${role === v ? "border-[#e63946] text-[#e63946] bg-[#e63946]/10" : ""}`}
                        style={role !== v ? { borderColor: "var(--border)" } : {}}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <span className="px-3 py-3 text-sm font-bold muted-text border-r" style={{ borderColor: "var(--border)" }}>+91</span>
                    <input className="flex-1 p-3 bg-transparent outline-none" placeholder={t("phone_number")} value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" />
                  </div>
                  <button disabled={busy} onClick={sendOtp} className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#e63946] to-[#ff9e00] hover:opacity-90 disabled:opacity-50">
                    {busy ? "..." : t("send_otp")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {devOtp && (
                    <div className="p-3 rounded-xl bg-[#ffd166]/15 text-[10px] text-center leading-relaxed border border-[#ffd166]/40">
                      ⚠️ {t("otp_dev_note")}: <b className="text-lg tracking-[0.3em]">{devOtp}</b>
                    </div>
                  )}
                  <input className="w-full p-3 rounded-xl border bg-transparent text-center text-2xl tracking-[0.5em] font-black outline-none"
                    style={{ borderColor: "var(--border)" }} placeholder="••••••" maxLength={6} value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" />
                  <button disabled={busy || otp.length !== 6} onClick={verify} className="w-full py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-[#7b2cbf] to-[#e63946] hover:opacity-90 disabled:opacity-50">
                    {busy ? "..." : t("verify_otp")}
                  </button>
                  <button onClick={() => setStep("phone")} className="w-full text-xs muted-text hover:underline">← {t("phone_number")}</button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
