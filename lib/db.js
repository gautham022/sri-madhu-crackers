// Storage layer: DynamoDB when configured (AWS), local JSON files otherwise (dev).
// Tables: products, users, orders, otps
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DIR = path.join(DATA_DIR, "local");

export const useDynamo = !!(
  process.env.AWS_REGION &&
  (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_SDK_LOAD_SYSTEM)
);

let docClient;
if (useDynamo) {
  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
  docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
}
const TABLE = process.env.DYNAMO_TABLE || "sri-madhu-crackers";

function lfile(table) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  return path.join(LOCAL_DIR, `${table}.json`);
}
function lread(table) {
  try { return JSON.parse(fs.readFileSync(lfile(table), "utf8")); } catch { return {}; }
}
function lwrite(table, obj) {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(lfile(table), JSON.stringify(obj, null, 1));
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

// ---- seed products on first run (local files AND empty dynamodb tables) ----
let seeded = false;
export async function ensureSeed() {
  if (seeded) return;
  seeded = true;
  const seed = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "seed-products.json"), "utf8"));
  if (useDynamo) {
    const existing = await dscan("products");
    if (existing.length === 0) {
      for (const p of seed) await dput("products", { ...p, active: true, stock: 100 });
    }
    return;
  }
  const prods = lread("products");
  if (Object.keys(prods).length === 0) {
    for (const p of seed) prods[p.id] = { ...p, active: true, stock: 100 };
    lwrite("products", prods);
  }
}

export const db = {
  async getAllProducts() {
    await ensureSeed();
    if (useDynamo) return await dscan("products");
    return Object.values(lread("products"));
  },
  async getProduct(id) {
    if (useDynamo) return await dget("products", { id });
    return lread("products")[id];
  },
  async putProduct(p) {
    if (useDynamo) return await dput("products", p);
    const t = lread("products"); t[p.id] = p; lwrite("products", t);
  },
  async deleteProduct(id) {
    if (useDynamo) return await ddelete("products", { id });
    const t = lread("products"); delete t[id]; lwrite("products", t);
  },
  async getUser(phone) {
    if (useDynamo) return await dget("users", { phone });
    return lread("users")[phone];
  },
  async putUser(u) {
    if (useDynamo) return await dput("users", u);
    const t = lread("users"); t[u.phone] = u; lwrite("users", t);
  },
  async putOtp(phone, code, expires) {
    const item = { phone, code, expires };
    if (useDynamo) return await dput("otps", item);
    const t = lread("otps"); t[phone] = item; lwrite("otps", t);
  },
  async getOtp(phone) {
    if (useDynamo) return await dget("otps", { phone });
    return lread("otps")[phone];
  },
  async putOrder(o) {
    if (useDynamo) return await dput("orders", o);
    const t = lread("orders"); t[o.id] = o; lwrite("orders", t);
  },
  async getAllOrders() {
    if (useDynamo) return await dscan("orders");
    return Object.values(lread("orders"));
  },
};
