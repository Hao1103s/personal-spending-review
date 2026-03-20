import fs from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const staticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const prismaDir = path.join(rootDir, "prisma");
const runtimeDir = path.join(rootDir, "desktop-runtime");

function assertExists(targetPath, description) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${description} 不存在: ${targetPath}`);
  }
}

async function prepareDesktopRuntime() {
  assertExists(path.join(standaloneDir, "server.js"), "Next standalone 输出");
  assertExists(path.join(prismaDir, "dev.db"), "SQLite 数据库");

  await rm(runtimeDir, { recursive: true, force: true });
  await cp(standaloneDir, runtimeDir, { recursive: true });

  await mkdir(path.join(runtimeDir, ".next"), { recursive: true });
  await cp(staticDir, path.join(runtimeDir, ".next", "static"), { recursive: true });

  if (fs.existsSync(publicDir)) {
    await cp(publicDir, path.join(runtimeDir, "public"), { recursive: true });
  }

  await mkdir(path.join(runtimeDir, "prisma"), { recursive: true });
  await cp(path.join(prismaDir, "dev.db"), path.join(runtimeDir, "prisma", "dev.db"));

  if (fs.existsSync(path.join(prismaDir, "schema.prisma"))) {
    await cp(
      path.join(prismaDir, "schema.prisma"),
      path.join(runtimeDir, "prisma", "schema.prisma"),
    );
  }

  console.log(`Desktop runtime prepared at ${path.relative(rootDir, runtimeDir)}`);
}

prepareDesktopRuntime().catch((error) => {
  console.error(error);
  process.exit(1);
});
