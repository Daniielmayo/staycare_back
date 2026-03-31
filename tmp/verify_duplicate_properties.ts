import { PropertyService } from "../src/services/property.service";
import pool from "../src/db/pool";

async function test() {
  try {
    const clientId = 4; // Based on previous test client
    const lat = 12.345678;
    const lng = -98.765432;

    console.log(`1. Adding first property with lat:${lat}, lng:${lng} for client ${clientId}...`);
    const p1 = await PropertyService.addPropertyForClientUser(clientId, {
      property_name: "Test Prop 1",
      address: "Address 1",
      city: "City 1",
      area: "Area 1",
      lat,
      lng
    });
    console.log("   SUCCESS: First property added.");

    console.log(`2. Adding second property with same coordinates (should fail)...`);
    try {
      await PropertyService.addPropertyForClientUser(clientId, {
        property_name: "Test Prop 2",
        address: "Address 2",
        city: "City 2",
        area: "Area 2",
        lat,
        lng
      });
      console.log("   FAILURE: Second property was added but should have failed.");
    } catch (e: any) {
      if (e.message === "Ya existe una sede con estas coordenadas para este cliente") {
        console.log("   SUCCESS: Second property failed with correct message:", e.message);
      } else {
        console.log("   FAILURE: Second property failed but with unexpected message:", e.message);
      }
    }

    // Clean up p1? Usually we don't clean up in these scripts unless needed
    // But let's delete it to keep it clean
    if (p1?.id) {
       await PropertyService.deleteProperty(p1.id, clientId);
       console.log("   CLEANUP: First property deleted.");
    }

    process.exit(0);
  } catch (e) {
    console.error("Verification FAILED:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

test();
