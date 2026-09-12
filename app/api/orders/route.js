import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function GET(req) {
  const user = verifyToken(req.cookies.get("smc_token")?.value);
  const orders = await db.getAllOrders();
  if (user?.role === "admin") return NextResponse.json({ orders: orders.sort((a, b) => b.createdAt - a.createdAt) });
  if (!user) return NextResponse.json({ orders: [] });
  return NextResponse.json({ orders: orders.filter((o) => o.phone === user.phone).sort((a, b) => b.createdAt - a.createdAt) });
}

export async function POST(req) {
  const user = verifyToken(req.cookies.get("smc_token")?.value);
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { items, total, name, address, pincode, payment } = await req.json();
  if (!items?.length || !name || !address) return NextResponse.json({ error: "Missing order data" }, { status: 400 });

  const id = `SMC-${Date.now().toString(36).toUpperCase()}`;
  const order = {
    id, items, total, name, address, pincode, phone: user.phone,
    paymentMethod: payment, status: "placed", createdAt: Date.now(),
    paymentStatus: "pending",
  };
  await db.putOrder(order);

  // create Razorpay order if online payment & keys configured; otherwise mock in dev
  if (payment === "razorpay" && RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const rzp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: id }),
    }).then((r) => r.json());
    if (rzp.id) {
      order.razorpayOrderId = rzp.id;
      await db.putOrder(order);
      return NextResponse.json({ ok: true, order, razorpayOrder: rzp, keyId: RAZORPAY_KEY_ID });
    }
    return NextResponse.json({ error: "Razorpay order failed" }, { status: 500 });
  }

  // dev mode: no keys -> mock successful payment
  if (payment === "razorpay") {
    order.paymentStatus = "mock-paid";
    order.status = "paid";
    await db.putOrder(order);
    return NextResponse.json({ ok: true, order, mock: true });
  }
  return NextResponse.json({ ok: true, order });
}

export async function PUT(req) {
  const user = verifyToken(req.cookies.get("smc_token")?.value);
  if (user?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id, status } = await req.json();
  const orders = await db.getAllOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  o.status = status;
  await db.putOrder(o);
  return NextResponse.json({ ok: true });
}
