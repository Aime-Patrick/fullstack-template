#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { spawn } from "node:child_process";
import degit from "degit";

const REPO = "Aime-Patrick/fullstack-template";

const askYesNo = async (rl, message, fallback = true) => {
  const hint = fallback ? "Y/n" : "y/N";
  const input = (await rl.question(`${message} (${hint}): `)).trim().toLowerCase();
  if (!input) return fallback;
  return input === "y" || input === "yes";
};

const setEnvValue = (content, key, value) => {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content.trimEnd()}\n${line}\n`;
};

const run = (command, args, cwd) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) return resolvePromise();
      rejectPromise(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });

const askTemplateMode = async (rl) => {
  console.log("\nChoose template mode:");
  console.log("  1) fullstack (backend + frontend)");
  console.log("  2) backend");
  console.log("  3) frontend");
  const choice = (await rl.question("Select mode [1]: ")).trim() || "1";

  if (choice === "2" || choice.toLowerCase() === "backend") return "backend";
  if (choice === "3" || choice.toLowerCase() === "frontend") return "frontend";
  return "fullstack";
};

const askPackageManager = async (rl) => {
  const value = (await rl.question("Package manager [pnpm/npm] (default: pnpm): "))
    .trim()
    .toLowerCase();
  if (value === "npm") return "npm";
  return "pnpm";
};

const main = async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const argName = process.argv[2];
    const projectName =
      argName || (await rl.question("Project name (folder): ")).trim();

    if (!projectName) {
      throw new Error("Project name is required.");
    }

    const targetDir = resolve(process.cwd(), projectName);
    if (existsSync(targetDir)) {
      const files = await readdir(targetDir);
      if (files.length > 0) {
        throw new Error(`Target folder is not empty: ${targetDir}`);
      }
    } else {
      await mkdir(targetDir, { recursive: true });
    }

    const mode = await askTemplateMode(rl);
    const packageManager = await askPackageManager(rl);
    const hasBackend = mode === "fullstack" || mode === "backend";
    const hasFrontend = mode === "fullstack" || mode === "frontend";

    const usePrisma = hasBackend
      ? await askYesNo(rl, "Use Prisma + PostgreSQL?", false)
      : false;
    const installDeps = await askYesNo(rl, "Install dependencies automatically?", true);
    const runPrisma = usePrisma
      ? await askYesNo(rl, "Run Prisma generate/migrate during setup?", true)
      : false;

    let databaseUrl =
      "postgresql://postgres:postgres@localhost:5432/fullstack_template?schema=public";
    if (usePrisma) {
      const provided = (
        await rl.question(
          `DATABASE_URL [${databaseUrl}]: `,
        )
      ).trim();
      if (provided) databaseUrl = provided;
    }

    const backendPort = hasBackend
      ? (await rl.question("Backend PORT [3000]: ")).trim() || "3000"
      : "3000";
    const frontendPort = hasFrontend
      ? (await rl.question("Frontend PORT [3001]: ")).trim() || "3001"
      : "3001";

    console.log(`\nScaffolding from ${REPO} ...`);
    const emitter = degit(REPO, { cache: false, force: true, verbose: true });
    await emitter.clone(targetDir);

    if (mode === "backend") {
      await rm(join(targetDir, "frontend"), { recursive: true, force: true });
    } else if (mode === "frontend") {
      await rm(join(targetDir, "backend"), { recursive: true, force: true });
    }

    if (packageManager === "npm") {
      if (hasBackend) {
        await rm(join(targetDir, "backend", "pnpm-lock.yaml"), {
          force: true,
        });
      }
      if (hasFrontend) {
        await rm(join(targetDir, "frontend", "pnpm-lock.yaml"), {
          force: true,
        });
      }
    } else {
      if (hasBackend) {
        await rm(join(targetDir, "backend", "package-lock.json"), {
          force: true,
        });
      }
      if (hasFrontend) {
        await rm(join(targetDir, "frontend", "package-lock.json"), {
          force: true,
        });
      }
    }

    const backendEnvExample = join(targetDir, "backend", ".env.example");
    const frontendEnvExample = join(targetDir, "frontend", ".env.example");
    const backendEnvPath = join(targetDir, "backend", ".env");
    const frontendEnvPath = join(targetDir, "frontend", ".env.local");

    if (hasBackend) {
      let backendEnv = await readFile(backendEnvExample, "utf8");
      backendEnv = setEnvValue(backendEnv, "PORT", backendPort);
      backendEnv = setEnvValue(
        backendEnv,
        "CORS_ORIGIN",
        `http://localhost:${frontendPort}`,
      );
      backendEnv = setEnvValue(
        backendEnv,
        "DB_PROVIDER",
        usePrisma ? "prisma" : "inmemory",
      );
      backendEnv = setEnvValue(
        backendEnv,
        "DATABASE_URL",
        usePrisma ? `"${databaseUrl}"` : '""',
      );
      backendEnv = setEnvValue(
        backendEnv,
        "JWT_SECRET",
        randomBytes(32).toString("hex"),
      );
      await writeFile(backendEnvPath, backendEnv, "utf8");
    }

    if (hasFrontend) {
      let frontendEnv = await readFile(frontendEnvExample, "utf8");
      frontendEnv = setEnvValue(
        frontendEnv,
        "NEXT_PUBLIC_API_URL",
        `http://localhost:${backendPort}`,
      );
      await writeFile(frontendEnvPath, frontendEnv, "utf8");
    }

    if (installDeps) {
      if (hasBackend) {
        console.log("\nInstalling backend dependencies...");
        await run(packageManager, ["install"], join(targetDir, "backend"));
      }
      if (hasFrontend) {
        console.log("\nInstalling frontend dependencies...");
        await run(packageManager, ["install"], join(targetDir, "frontend"));
      }
    }

    if (installDeps && hasBackend && usePrisma && runPrisma) {
      console.log("\nRunning Prisma setup...");
      await run(packageManager, ["run", "prisma:generate"], join(targetDir, "backend"));
      await run(packageManager, ["run", "prisma:migrate"], join(targetDir, "backend"));
    }

    console.log("\nSetup complete.");
    console.log(`\nNext steps:\n  cd ${projectName}`);
    if (hasBackend) {
      console.log(`  cd backend && ${packageManager} run start:dev`);
    }
    if (hasFrontend) {
      if (hasBackend) {
        console.log(
          `  cd ../frontend && ${packageManager} run dev -- --port ${frontendPort}`,
        );
      } else {
        console.log(
          `  cd frontend && ${packageManager} run dev -- --port ${frontendPort}`,
        );
      }
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
};

void main();
