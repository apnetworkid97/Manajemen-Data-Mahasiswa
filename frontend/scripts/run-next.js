const path = require("node:path");
const { spawn } = require("node:child_process");

const command = process.argv[2] || "dev";
const extraArgs = process.argv.slice(3);
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

const args = [nextBin, command, ...extraArgs];

// Next.js 16 default ke Turbopack. Project ini masih pakai custom webpack config.
if ((command === "dev" || command === "build") && !args.includes("--webpack")) {
  args.push("--webpack");
}

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
  console.error(`Gagal menjalankan Next.js: ${error.message}`);
  process.exit(1);
});
