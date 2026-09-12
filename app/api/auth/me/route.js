import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = req.cookies.get("smc_token")?.value;
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { phone: payload.phone, role: payload.role } });
}
