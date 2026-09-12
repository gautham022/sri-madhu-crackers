import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateOtp, sendSms, ADMIN_PHONES } from "@/lib/auth";

export async function POST(req) {
  const { phone, role } = await req.json();
  if (!phone || !/^\+91\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  // admin login only allowed for admin phones
  const isAdminPhone = ADMIN_PHONES.includes(phone.slice(3));

  const otp = generateOtp();
  try {
    await db.putOtp(phone, otp, Date.now() + 5 * 60 * 1000);
  } catch {
    return NextResponse.json({ error: "Login is not available yet on this deployment" }, { status: 503 });
  }
  const sent = await sendSms(phone, otp);

  return NextResponse.json({
    ok: true,
    sent, // false = dev mode
    ...(sent ? {} : { devOtp: otp, note: "Set SMS_PROVIDER env to send real SMS" }),
    role: role === "admin" && !isAdminPhone ? "user" : role,
  });
}
