import "dotenv/config";
import { syncKaspiOrders } from "../src/lib/kaspi-sync";

async function main() {
  if (!process.env.KASPI_API_TOKEN) {
    console.error("KASPI_API_TOKEN is empty");
    process.exit(1);
  }
  const result = await syncKaspiOrders({ pages: 5, size: 20 });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
