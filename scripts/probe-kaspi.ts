/**
 * Stage 0: test Kaspi API token and customer.cellPhone presence.
 *
 *   KASPI_API_TOKEN=... npx tsx scripts/probe-kaspi.ts
 */
import "dotenv/config";
import { probeKaspiApi } from "../src/lib/kaspi";

async function main() {
  if (!process.env.KASPI_API_TOKEN) {
    console.error("Set KASPI_API_TOKEN in .env first (ask PM for merchant token).");
    process.exit(1);
  }

  try {
    const result = await probeKaspiApi();
    console.log(JSON.stringify(result, null, 2));
    if (result.ordersSampled === 0) {
      console.log("\nNo orders returned — check filters / store has orders.");
    } else if (result.withCellPhone === 0) {
      console.log("\nWARNING: no cellPhone in sample — Variant A attribution at risk.");
    } else {
      console.log("\nOK: cellPhone present — Variant A (phone match) is viable.");
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
