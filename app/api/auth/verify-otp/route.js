import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, ADMIN_PHONES } from "@/lib/auth";

export async function POST(req) {
  const { phone, otp, role } = await req.json();
  const rec = await db.getOtp(phone);
  if (!rec) return NextResponse.json({ error: "OTP expired - resend" }, { status: 400 });
  if (Date.now() > rec.expires) return NextResponse.json({ error: "OTP expired - resend" }, { status: 400 });
  if (rec.code !== otp) return NextResponse.json({ error: "Wrong OTP" }, { status: 400 });

  const isAdmin = role === "admin" && ADMIN_PHONES.includes(phone.slice(3));
  let user = await db.getUser(phone);
  if (!user) {
    user = { phone, role: isAdmin ? "admin" : "user", createdAt: Date.now() };
    await db.putUser(user);
  }

  const token = signToken({ phone, role: user.role, exp: Date.now() + 30 * 24 * 3600 * 1000 });
  const res = NextResponse.json({ ok: true, user });
  res.cookies.set("smc_token", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 30 * 24 * 3600, path: "/",
  });
  return res;
}
