/**
 * Bottle - Cloud Atlas AI Core Stack for OpenCode
 *
 * Two things:
 * 1. npm meta-package - pulls in ba-opencode, wm-opencode, superego-opencode as dependencies
 * 2. OpenCode plugin - provides setup/orchestration tools (bottle-init, bottle-install, bottle-status)
 */

import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

// Helper: Check if a binary is available
function checkBinary(name: string): boolean {
  try {
    const result = spawnSync("command", ["-v", name], { encoding: "utf-8" });
    return result.status === 0;
  } catch {
    return false;
  }
}

// Helper: Detect available package managers
function detectPackageManagers(): { homebrew: boolean; cargo: boolean } {
  return {
    homebrew: checkBinary("brew"),
    cargo: checkBinary("cargo") || existsSync(`${process.env.HOME}/.cargo/bin/cargo`),
  };
}

const Bottle: Plugin = async ({ directory }) => {
  return {
    tool: {
      "bottle-init": tool({
        description: "Initialize the full Cloud Atlas AI stack (ba, wm, superego). Detects missing binaries and guides installation.",
        args: {},
        async execute() {
          const results: string[] = [];

          // Check which binaries are available
          const binaries = {
            ba: checkBinary("ba"),
            wm: checkBinary("wm"),
            sg: checkBinary("sg"),
          };

          // Detect missing binaries (regardless of project initialization state)
          const missing: string[] = [];
          if (!binaries.ba) missing.push("ba");
          if (!binaries.wm) missing.push("wm");
          if (!binaries.sg) missing.push("sg");

          // If binaries are missing, guide installation
          if (missing.length > 0) {
            const pkgManagers = detectPackageManagers();
            const available: string[] = [];
            if (pkgManagers.homebrew) available.push("homebrew");
            if (pkgManagers.cargo) available.push("cargo");

            results.push(`⚠️  Missing binaries: ${missing.join(", ")}`);
            results.push("");

            if (available.length > 0) {
              results.push(`Available installation methods: ${available.join(", ")}`);
              results.push("");
              results.push("To install, use the bottle-install tool:");
              results.push(`  bottle-install --binary=<name> --method=<${available.join("|")}>`);
              results.push("");
              results.push("Example:");
              missing.forEach((bin) => {
                results.push(`  bottle-install --binary=${bin} --method=${available[0]}`);
              });
              results.push("");
              results.push("After installation, run bottle-init again to complete setup.");
            } else {
              results.push("⚠️  No package manager found (homebrew or cargo).");
              results.push("");
              results.push("Install options:");
              results.push("1. Homebrew (macOS):");
              results.push('   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
              results.push("2. Rust/Cargo (cross-platform):");
              results.push("   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh");
            }

            return results.join("\n");
          }

          // All binaries available - initialize projects
          // Initialize ba
          if (!existsSync(join(directory, ".ba"))) {
            try {
              const ba = spawnSync("ba", ["init"], { cwd: directory, encoding: "utf-8" });
              results.push(ba.status === 0 ? "✓ ba initialized" : `✗ ba init failed: ${ba.stderr}`);
            } catch (e) {
              results.push(`✗ ba init failed: ${e}`);
            }
          } else {
            results.push("✓ ba already initialized");
          }

          // Initialize wm
          if (!existsSync(join(directory, ".wm"))) {
            try {
              const wm = spawnSync("wm", ["init"], { cwd: directory, encoding: "utf-8" });
              results.push(wm.status === 0 ? "✓ wm initialized" : `✗ wm init failed: ${wm.stderr}`);
            } catch (e) {
              results.push(`✗ wm init failed: ${e}`);
            }
          } else {
            results.push("✓ wm already initialized");
          }

          // Initialize superego
          if (!existsSync(join(directory, ".superego"))) {
            try {
              const sg = spawnSync("sg", ["init"], { cwd: directory, encoding: "utf-8" });
              results.push(sg.status === 0 ? "✓ superego initialized" : `✗ superego init failed: ${sg.stderr}`);
            } catch (e) {
              results.push(`✗ superego init failed: ${e}`);
            }
          } else {
            results.push("✓ superego already initialized");
          }

          // Create/update AGENTS.md
          const agentsFile = join(directory, "AGENTS.md");
          const content = `# Cloud Atlas AI Stack

This project uses Cloud Atlas AI tools. Follow these protocols:

## Task Tracking (ba)

**When to use:**
- At session start: Use \`ba-status\` to see active tasks
- Before starting work: Use \`ba list\` to check what's ready
- When creating tasks: Use \`ba create\` for each distinct piece of work
- During work: Use \`ba claim\` to take ownership, \`ba finish\` when done
- For dependencies: Use \`ba block\` to mark blockers

**Protocol:** Always track non-trivial work in ba. If a task has multiple steps or will take >5 minutes, create a task.

## Working Memory (wm)

**When to use:**
- When you need context: Use \`wm compile\` to get relevant knowledge for current work
- If you don't know why/how something works: Check \`wm show state\` or encourage user to prep a dive pack
- After completing work: Use \`wm distill\` to extract learnings from the session
- Before answering questions about past work: Check \`wm compile\` first

**Protocol:** Treat wm as your external memory. Don't guess at past decisions - check wm first.

## Metacognition (superego)

**Mode:** Pull mode - evaluates only when explicitly requested, not automatically.

**When to use:**
- Before committing significant work: Proactively request evaluation
- When uncertain about approach: Ask for feedback
- If you receive SUPEREGO FEEDBACK: critically evaluate it and either incorporate or escalate to user

**Protocol:** Superego is opt-in. Use it for high-stakes decisions, architectural choices, or when you want a second opinion. It catches premature commitment, scope creep, and misalignment.
`;
          writeFileSync(agentsFile, content);
          results.push("✓ AGENTS.md created/updated");

          return results.join("\n");
        },
      }),

      "bottle-install": tool({
        description: "Install a Cloud Atlas AI binary (ba, wm, or sg) via homebrew or cargo",
        args: {
          binary: tool.schema.enum(["ba", "wm", "sg"]).describe("Which binary to install"),
          method: tool.schema.enum(["homebrew", "cargo"]).describe("Installation method"),
        },
        async execute({ binary, method }) {
          const results: string[] = [];

          // Package names for each method
          const packages = {
            homebrew: {
              ba: "cloud-atlas-ai/ba/ba",
              wm: "cloud-atlas-ai/wm/wm",
              sg: "cloud-atlas-ai/superego/superego",
            },
            cargo: {
              ba: "ba",
              wm: "wm",
              sg: "superego",
            },
          };

          const pkg = packages[method][binary];

          results.push(`Installing ${binary} via ${method}...`);
          results.push("");

          try {
            if (method === "homebrew") {
              const install = spawnSync("brew", ["install", pkg], { encoding: "utf-8", timeout: 120000 });
              if (install.status === 0) {
                results.push(`✓ ${binary} installed successfully`);
                if (install.stdout) results.push(install.stdout);
              } else {
                results.push(`✗ Installation failed`);
                if (install.stderr) results.push(install.stderr);
              }
            } else if (method === "cargo") {
              const install = spawnSync("cargo", ["install", pkg], { encoding: "utf-8", timeout: 300000 });
              if (install.status === 0) {
                results.push(`✓ ${binary} installed successfully`);
                if (install.stdout) results.push(install.stdout);
              } else {
                results.push(`✗ Installation failed`);
                if (install.stderr) results.push(install.stderr);
              }
            }
          } catch (e) {
            results.push(`✗ Installation failed: ${e}`);
          }

          results.push("");
          results.push("After installation completes, run 'bottle-init' again to initialize.");

          return results.join("\n");
        },
      }),

      "bottle-status": tool({
        description: "Check initialization status of all Cloud Atlas AI components",
        args: {},
        async execute() {
          const ba = existsSync(join(directory, ".ba")) ? "✓ initialized" : "✗ not initialized";
          const wm = existsSync(join(directory, ".wm")) ? "✓ initialized" : "✗ not initialized";
          const sg = existsSync(join(directory, ".superego")) ? "✓ initialized" : "✗ not initialized";

          const binaries = {
            ba: checkBinary("ba") ? "✓ installed" : "✗ not installed",
            wm: checkBinary("wm") ? "✓ installed" : "✗ not installed",
            sg: checkBinary("sg") ? "✓ installed" : "✗ not installed",
          };

          return `Cloud Atlas AI Stack Status:

Binaries:
  ba: ${binaries.ba}
  wm: ${binaries.wm}
  sg: ${binaries.sg}

Projects:
  ba: ${ba}
  wm: ${wm}
  superego: ${sg}

Use 'bottle-init' to initialize all components.`;
        },
      }),
    },
  };
};

export default Bottle;
