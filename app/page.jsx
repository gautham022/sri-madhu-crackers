import { db } from "@/lib/db";
import HomeContent from "./components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Page() {
  const products = await db.getAllProducts();
  return <HomeContent products={JSON.parse(JSON.stringify(products))} />;
}
