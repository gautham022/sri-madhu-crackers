import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req) {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected !== razorpay_signature) return NextResponse.json({ ok: false }, { status: 400 });

  const orders = await db.getAllOrders();
  const o = orders.find((x) => x.id === orderId);
  if (o) {
    o.paymentStatus = "paid";
    o.status = "paid";
    o.razorpayPaymentId = razorpay_payment_id;
    await db.putOrder(o);
  }
  return NextResponse.json({ ok: true });
}
