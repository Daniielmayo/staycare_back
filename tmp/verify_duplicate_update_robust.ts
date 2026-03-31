import { PropertyService } from "../src/services/property.service";
import pool from "../src/db/pool";

async function testUpdateRobust() {
  try {
    const clientId = 4;
    
    console.log("1. Creating Property A (12.34567, -45.67890)...");
    const p1 = await PropertyService.addPropertyForClientUser(clientId, {
        property_name: "Prop A",
        address: "Addr A",
        city: "City A",
        area: "Area A",
        lat: 12.34567,
        lng: -45.67890
    });
    
    console.log("2. Creating Property B (99.99999, 88.88888)...");
    const p2 = await PropertyService.addPropertyForClientUser(clientId, {
        property_name: "Prop B",
        address: "Addr B",
        city: "City B",
        area: "Area B",
        lat: 99.99999,
        lng: 88.88888
    });

    console.log("3. Attempting to update Property B to match A using NUMBERS in data object...");
    // We cast to 'any' to bypass TS check but simulate real runtime 'req.body' which might have numbers
    const updateData: any = { lat: 12.34567, lng: -45.67890 };
    
    try {
        await PropertyService.updateProperty(p2!.id!, updateData, clientId);
        console.log("   CRITICAL FAILURE: Update allowed duplicate coordinates!");
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

testUpdateRobust();
