import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(thisFile), "..");
const lockPath = join(repoRoot, "skills-lock.json");
const vendorRoot = join(repoRoot, ".agents", "vendor");
const vendorDir = join(vendorRoot, "vercel-agent-skills");

const lock = JSON.parse(readFileSync(lockPath, "utf8"));

if (!existsSync(vendorRoot)) {
  mkdirSync(vendorRoot, { recursive: true });
}

if (!existsSync(vendorDir)) {
  execSync(`git clone --filter=blob:none ${lock.source} "${vendorDir}"`, {
    stdio: "inherit"
  });
}

execSync(`git -C "${vendorDir}" fetch --depth=1 origin ${lock.ref}`, { stdio: "inherit" });
execSync(`git -C "${vendorDir}" checkout --force ${lock.ref}`, { stdio: "inherit" });

console.log(`Synced Vercel skills to ${lock.ref}`);
