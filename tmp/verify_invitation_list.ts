import { InvitationService } from "../src/services/invitation.service";
import pool from "../src/db/pool";

async function test() {
  try {
    console.log("1. Testing Invitation listing (all, limit 2, skip 0)...");
    const res1 = await InvitationService.listInvitations(2, 0);
    console.log(`   Total invitations: ${res1.total}`);
    console.log(`   Items in page 1: ${res1.invitations.length}`);

    console.log("\n2. Testing pending filter (status: 'pending')...");
    const res2 = await InvitationService.listInvitations(10, 0, { status: "pending" });
    console.log(`   Found ${res2.invitations.length} pending invitation(s).`);
    const allPending = res2.invitations.every(i => !i.used && new Date(i.expires_at) > new Date());
    if (allPending) {
      console.log("   SUCCESS: Pending filter works.");
    } else {
      console.log("   FAILURE: Pending filter included non-pending items.");
    }

    console.log("\n3. Testing used filter (status: 'used')...");
    const res3 = await InvitationService.listInvitations(10, 0, { status: "used" });
    console.log(`   Found ${res3.invitations.length} used invitation(s).`);
    const allUsed = res3.invitations.every(i => i.used);
    if (allUsed) {
      console.log("   SUCCESS: Used filter works.");
    } else {
      console.log("   FAILURE: Used filter included non-used items.");
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
