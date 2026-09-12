import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function requireAdmin(req) {
  const payload = verifyToken(req.cookies.get("smc_token")?.value);
  return payload?.role === "admin" ? payload : null;
}

export async function GET() {
  const products = await db.getAllProducts();
  return NextResponse.json(products);
}

export async function POST(req) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const p = await req.json();
  if (!p.id || !p.name || !p.category) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  p.active = p.active ?? true;
  await db.putProduct(p);
  return NextResponse.json({ ok: true, product: p });
}

export async function PUT(req) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const p = await req.json();
  const existing = await db.getProduct(p.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.putProduct({ ...existing, ...p });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  await db.deleteProduct(id);
  return NextResponse.json({ ok: true });
}
