const { spawnSync } = require("node:child_process");

const delays = [0, 15000, 30000, 45000];
for (let attempt = 0; attempt < delays.length; attempt += 1) {
  if (delays[attempt]) {
    console.log(`Waiting ${delays[attempt] / 1000}s before retrying database migration...`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delays[attempt]);
  }

  const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", "deploy"], {
    encoding: "utf8",
    env: process.env,
  });
  const output = (result.stdout || "") + (result.stderr || "");
  process.stdout.write(output);

  if (result.status === 0) process.exit(0);

  const advisoryLockTimeout = output.includes("P1002") && output.includes("advisory lock");
  if (!advisoryLockTimeout) {
    console.error("Migration failed for a reason other than advisory-lock contention.");
    process.exit(result.status || 1);
  }
}

console.error("Migration failed after retrying PostgreSQL advisory-lock timeouts.");
process.exit(1);
