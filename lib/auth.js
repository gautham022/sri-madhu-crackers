import crypto from "crypto";

export const ADMIN_PHONES = (process.env.ADMIN_PHONES || "9600331523")
  .split(",").map((s) => s.trim());

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production";

export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig !== expect) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * SMS sender. Plug in a real provider later by setting env vars:
 *   SMS_PROVIDER=msg91  MSG91_KEY=...  MSG91_SENDER=...
 *   (or) SMS_PROVIDER=fast2sms  FAST2SMS_KEY=...
 * Without a provider configured, OTP is returned to the client (dev mode).
 */
export async function sendSms(phone, text) {
  const provider = process.env.SMS_PROVIDER;
  if (provider === "fast2sms" && process.env.FAST2SMS_KEY) {
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { authorization: process.env.FAST2SMS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "otp", variables_values: text, numbers: phone }),
    });
    return true;
  }
  if (provider === "msg91" && process.env.MSG91_KEY) {
    await fetch(`https://api.msg91.com/api/v5/flow/`, {
      method: "POST",
      headers: { authkey: process.env.MSG91_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE, mobiles: phone, OTP: text }),
    });
    return true;
  }
  // dev mode: no provider — log it and tell caller it wasn't really sent
  console.log(`[DEV SMS] to ${phone}: ${text}`);
  return false;
}
