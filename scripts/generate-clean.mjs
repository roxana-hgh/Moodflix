import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const folders = [
  path.join(root, "lib", "generated"),
  path.join(root, ".next"),
];

for (const folder of folders) {
  fs.rmSync(folder, {
    recursive: true,
    force: true,
  });

  console.log(`Removed: ${folder}`);
}

console.log("Running Prisma generate...");

execSync("npx prisma generate", {
  stdio: "inherit",
});