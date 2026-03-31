import { PropertyService } from "../src/services/property.service";
import pool from "../src/db/pool";

async function testUpdate() {
  try {
    const clientId = 4;
    
    console.log("1. Creating Property A (10.0, 10.0)...");
    const p1 = await PropertyService.addPropertyForClientUser(clientId, {
        property_name: "Prop A",
        address: "Addr A",
        city: "City A",
        area: "Area A",
        lat: 10.0,
        lng: 10.0
    });
    
    console.log("2. Creating Property B (20.0, 20.0)...");
    const p2 = await PropertyService.addPropertyForClientUser(clientId, {
        property_name: "Prop B",
        address: "Addr B",
        city: "City B",
        area: "Area B",
        lat: 20.0,
        lng: 20.0
    });

    console.log("3. Attempting to update Property B to have coordinates of A ('10.0000000', '10.0000000')...");
    try {
        await PropertyService.updateProperty(p2!.id!, { lat: "10.0000000", lng: "10.0000000" }, clientId);
        console.log("   FAILURE: Update allowed duplicate coordinates!");
    } catch (e: any) {
        if (e.message === "Ya existe una sede con estas coordenadas para este cliente") {
            console.log("   SUCCESS: Update blocked with correct message.");
        } else {
            console.log("   FAILURE: Update failed but with unexpected message:", e.message);
        }
    }

    // Clean up
    if (p1?.id) await PropertyService.deleteProperty(p1.id, clientId);
    if (p2?.id) await PropertyService.deleteProperty(p2.id, clientId);
    console.log("Cleanup done.");

    process.exit(0);
  } catch (e) {
    console.error("Verification FAILED:", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testUpdate();
