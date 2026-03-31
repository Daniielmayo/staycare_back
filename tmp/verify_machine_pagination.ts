import { MachineService } from "../src/services/machine.service";

async function test() {
  try {
    console.log("1. Testing Machine pagination (limit 2, skip 0)...");
    const res1 = await MachineService.getAllMachines(2, 0);
    console.log("   Total machines:", res1.total);
    console.log("   Page 1 items:", res1.machines.length);

    if (res1.total > 2) {
      console.log("2. Testing Machine pagination (limit 2, skip 2)...");
      const res2 = await MachineService.getAllMachines(2, 2);
      console.log("   Page 2 items:", res2.machines.length);
      
      const firstPageIds = res1.machines.map(m => m.id);
      const secondPageIds = res2.machines.map(m => m.id);
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      
      if (overlap.length === 0) {
        console.log("   SUCCESS: No overlap between page 1 and page 2.");
      } else {
        console.log("   FAILURE: Overlap detected between pages!", overlap);
      }
    } else {
      console.log("   Not enough machines to test page 2 overlap.");
    }

    process.exit(0);
  } catch (e) {
    console.error("Verification FAILED:", e);
    process.exit(1);
  }
}

test();
