import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { dataMode } from "@/lib/db";

export async function GET(req) {
  const token = req.cookies.get("smc_token")?.value;
  const payload = verifyToken(token);
  return NextResponse.json({
    user: payload ? { phone: payload.phone, role: payload.role } : null,
    mode: dataMode, // "full" or "static" (catalog-only)
  });
}
