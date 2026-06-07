const path = require("node:path");
const { spawn } = require("node:child_process");

const eslintBin = path.join(
  __dirname,
  "..",
  "node_modules",
  "eslint",
  "bin",
  "eslint.js"
);

const args = [eslintBin, "."];

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
  shell: false,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(`Gagal menjalankan ESLint: ${error.message}`);
  process.exit(1);
});
