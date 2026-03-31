import { InvitationService } from "../src/services/invitation.service";
import pool from "../src/db/pool";

async function test() {
  const testEmail = "duplicate_test_" + Date.now() + "@example.com";
  try {
    console.log(`1. Sending first invitation to ${testEmail}...`);
    const res1 = await InvitationService.createInvitation(testEmail, "staff", 1);
    console.log("   SUCCESS: First invitation sent.");

    console.log(`2. Sending second invitation to ${testEmail} (should fail)...`);
    try {
      await InvitationService.createInvitation(testEmail, "staff", 1);
      console.log("   FAILURE: Second invitation was sent but should have failed.");
    } catch (e: any) {
      if (e.message === "Ya existe una invitación pendiente y activa para este correo electrónico") {
        console.log("   SUCCESS: Second invitation failed with correct message:", e.message);
      } else {
        console.log("   FAILURE: Second invitation failed but with unexpected message:", e.message);
      }
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
