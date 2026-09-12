// Creates the 4 DynamoDB tables needed by the app.
// Run from the project folder (Git Bash), with your IAM keys:
//   AWS_REGION=ap-south-1 AWS_ACCESS_KEY_ID=AKIA... AWS_SECRET_ACCESS_KEY=... node scripts/create-tables.mjs
import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE_PREFIX = process.env.DYNAMO_TABLE || "sri-madhu-crackers";
const tables = [
  [`${TABLE_PREFIX}-products`, "id"],
  [`${TABLE_PREFIX}-users`, "phone"],
  [`${TABLE_PREFIX}-orders`, "id"],
  [`${TABLE_PREFIX}-otps`, "phone"],
];

for (const [name, key] of tables) {
  try {
    await client.send(new CreateTableCommand({
      TableName: name,
      AttributeDefinitions: [{ AttributeName: key, AttributeType: "S" }],
      KeySchema: [{ AttributeName: key, KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    }));
    console.log("✓ created:", name, `(key: ${key})`);
  } catch (e) {
    if (e.name === "ResourceInUseException") console.log("• already exists:", name);
    else { console.error("✗ failed:", name, e.message); process.exitCode = 1; }
  }
}
console.log("done.");
