import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = join(dirname(thisFile), "..");

const lock = JSON.parse(readFileSync(join(repoRoot, "skills-lock.json"), "utf8"));
const localSkill = join(repoRoot, ".agents", "skills", "backend-governance", "SKILL.md");
const vendorDir = join(repoRoot, ".agents", "vendor", "vercel-agent-skills");

const missing = [];

if (!existsSync(localSkill)) {
  missing.push(".agents/skills/backend-governance/SKILL.md");
}

for (const skillPath of lock.requiredSkills) {
  const fullPath = join(vendorDir, skillPath);
  if (!existsSync(fullPath)) {
    missing.push(`.agents/vendor/vercel-agent-skills/${skillPath}`);
  }
}

if (missing.length > 0) {
  console.error("Missing required skills:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  console.error("Run: npm run skills:sync");
  process.exit(1);
}

console.log("Skill verification passed.");
