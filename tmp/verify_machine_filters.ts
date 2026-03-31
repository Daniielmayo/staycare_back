import { MachineService } from "../src/services/machine.service";

async function test() {
  try {
    console.log("1. Testing search filter (search: 'Washer #1')...");
    const res1 = await MachineService.getAllMachines(10, 0, { search: "Washer #1" });
    console.log(`   Found ${res1.machines.length} machine(s). Expected: 1`);
    if (res1.machines.length === 1 && res1.machines[0]?.name === "Washer #1") {
      console.log("   SUCCESS: Search filter works.");
    } else {
      console.log("   FAILURE: Search filter failed.");
    }

    console.log("\n2. Testing type filter (type: 'dryer')...");
    const res2 = await MachineService.getAllMachines(10, 0, { type: "dryer" });
    console.log(`   Found ${res2.machines.length} machine(s).`);
    const allDryers = res2.machines.every(m => m.type === "dryer");
    if (allDryers && res2.machines.length > 0) {
      console.log("   SUCCESS: Type filter works.");
    } else {
      console.log("   FAILURE: Type filter failed.");
    }

    console.log("\n3. Testing status filter (status: 'available')...");
    const res3 = await MachineService.getAllMachines(10, 0, { status: "available" });
    console.log(`   Found ${res3.machines.length} available machine(s).`);
    const allAvailable = res3.machines.every(m => m.status === "available");
    if (allAvailable) {
      console.log("   SUCCESS: Status filter works.");
    } else {
      console.log("   FAILURE: Status filter failed.");
    }

    process.exit(0);
  } catch (e) {
    console.error("Verification FAILED:", e);
    process.exit(1);
  }
}

test();
