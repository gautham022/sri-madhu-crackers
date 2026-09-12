// Storage layer with three modes:
//  - "dynamo": DynamoDB tables (set AWS_REGION + AWS_ACCESS_KEY_ID env vars) — full features
//  - "local":  JSON files in data/local/ (default on your PC) — full features
//  - "static": read-only catalog from data/seed-products.json (auto on Vercel without a DB) — storefront only
import fs from "fs";
import path from "path";
import seedJson from "@/data/seed-products.json";

const LOCAL_DIR = path.join(process.cwd(), "data", "local");

export const useDynamo = !!(
  process.env.AWS_REGION &&
  (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_SDK_LOAD_SYSTEM)
);

// deterministic mode for the UI: Vercel without a DB = catalog-only
export const dataMode = useDynamo ? "full" : process.env.VERCEL ? "static" : "full";

let docClient;
if (useDynamo) {
  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
  docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
}
const TABLE = process.env.DYNAMO_TABLE || "sri-madhu-crackers";

const seedProducts = () => seedJson.map((p) => ({ ...p, active: true, stock: 100 }));

let staticFallback = false;

function lfile(table) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  return path.join(LOCAL_DIR, `${table}.json`);
}
function lread(table) {
  try { return JSON.parse(fs.readFileSync(lfile(table), "utf8")); } catch { return {}; }
}
// throws EROFS on read-only filesystems (Vercel) -> callers flip staticFallback
function lwrite(table, obj) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(lfile(table), JSON.stringify(obj, null, 1));
}
function failStatic() {
  staticFallback = true;
  throw new Error("STATIC_MODE");
}

async function dget(table, key) {
  const { GetCommand } = require("@aws-sdk/lib-dynamodb");
  const res = await docClient.send(new GetCommand({ TableName: `${TABLE}-${table}`, Key: key }));
  return res.Item;
}
async function dput(table, item) {
  const { PutCommand } = require("@aws-sdk/lib-dynamodb");
  await docClient.send(new PutCommand({ TableName: `${TABLE}-${table}`, Item: item }));
}
async function dscan(table) {
  const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
  const res = await docClient.send(new ScanCommand({ TableName: `${TABLE}-${table}` }));
  return res.Items || [];
}
async function ddelete(table, key) {
  const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
  await docClient.send(new DeleteCommand({ TableName: `${TABLE}-${table}`, Key: key }));
}

let seeded = false;
async function ensureSeed() {
  if (seeded || useDynamo || staticFallback) return;
  seeded = true;
  const prods = lread("products");
  if (Object.keys(prods).length === 0) {
    for (const p of seedProducts()) prods[p.id] = p;
    lwrite("products", prods);
  }
}

export const db = {
  // catalog reads work in every mode
  async getAllProducts() {
    if (useDynamo) {
      try { return await dscan("products"); }
      catch (e) { console.error("[db] dynamo unavailable, serving static catalog:", e.message); staticFallback = true; return seedProducts(); }
    }
    try { await ensureSeed(); } catch { staticFallback = true; }
    if (staticFallback) return seedProducts();
    return Object.values(lread("products"));
  },
  async getProduct(id) {
    if (useDynamo) { try { return await dget("products", { id }); } catch { return seedProducts().find((p) => p.id === id); } }
    return lread("products")[id] || seedProducts().find((p) => p.id === id);
  },
  async putProduct(p) {
    if (useDynamo) return dput("products", p);
    if (staticFallback) failStatic();
    try { const t = lread("products"); t[p.id] = p; lwrite("products", t); }
    catch { failStatic(); }
  },
  async deleteProduct(id) {
    if (useDynamo) return ddelete("products", { id });
    if (staticFallback) failStatic();
    try { const t = lread("products"); delete t[id]; lwrite("products", t); }
    catch { failStatic(); }
  },
  async getUser(phone) {
    if (useDynamo) { try { return await dget("users", { phone }); } catch { return null; } }
    return lread("users")[phone];
  },
  async putUser(u) {
    if (useDynamo) return dput("users", u);
    if (staticFallback) failStatic();
    try { const t = lread("users"); t[u.phone] = u; lwrite("users", t); }
    catch { failStatic(); }
  },
  async putOtp(phone, code, expires) {
    const item = { phone, code, expires };
    if (useDynamo) return dput("otps", item);
    if (staticFallback) failStatic();
    try { const t = lread("otps"); t[phone] = item; lwrite("otps", t); }
    catch { failStatic(); }
  },
  async getOtp(phone) {
    if (useDynamo) { try { return await dget("otps", { phone }); } catch { return null; } }
    return lread("otps")[phone];
  },
  async putOrder(o) {
    if (useDynamo) return dput("orders", o);
    if (staticFallback) failStatic();
    try { const t = lread("orders"); t[o.id] = o; lwrite("orders", t); }
    catch { failStatic(); }
  },
  async getAllOrders() {
    if (useDynamo) { try { return await dscan("orders"); } catch { return []; } }
    return Object.values(lread("orders"));
  },
};
