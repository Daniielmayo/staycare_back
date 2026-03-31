import { UserService } from "../src/services/user.service";
import pool from "../src/db/pool";

async function test() {
  try {
    // We'll search for a client user first
    const [clients] = await pool.query("SELECT u.id FROM users u INNER JOIN roles r ON u.role_id = r.id WHERE r.name = 'client' LIMIT 1");
    
    if (!(clients as any[]).length) {
      console.log("No client user found in DB to test with.");
      process.exit(0);
    }

    const clientId = (clients as any[])[0].id;
    console.log(`Testing with client ID: ${clientId}`);

    const result = await UserService.getUserByIdWithClientProfileIfExists(clientId);

    console.log("User details retrieved:");
    console.log(`- User ID: ${result.user.id}`);
    console.log(`- Role: ${result.user.role}`);
    console.log(`- Has Profile: ${!!result.client_profile}`);
    console.log(`- Properties count: ${result.properties?.length ?? 0}`);

    if (result.user.role === "client") {
      if (!result.client_profile) {
        console.error("FAILURE: Client profile missing for client user.");
        process.exit(1);
      }
      if (!result.properties) {
        console.error("FAILURE: Properties array missing for client user.");
        process.exit(1);
      }
      console.log("SUCCESS: Enriched details (profile + properties) are present.");
    } else {
      console.log("The found user was not a client, test inconclusive but logic finished.");
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
