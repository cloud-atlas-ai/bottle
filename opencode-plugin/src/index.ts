/**
 * Bottle - Cloud Atlas AI Core Stack for OpenCode
 *
 * Two things:
 * 1. npm meta-package - pulls in ba-opencode, wm-opencode, superego-opencode as dependencies
 * 2. OpenCode plugin - provides setup/orchestration tools (bottle:init, bottle:status)
 */

import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const Bottle: Plugin = async ({ directory }) => {
  return {
    tool: {
      "bottle-init": tool({
        description: "Initialize the full Cloud Atlas AI stack (ba, wm, superego) in one command",
        args: {},
        async execute() {
          const results: string[] = [];

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

          // Update AGENTS.md
          const agentsFile = join(directory, "AGENTS.md");
          if (!existsSync(agentsFile)) {
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

**When to use:**
- Superego evaluates automatically when sessions go idle
- If you receive SUPEREGO FEEDBACK: critically evaluate it and either incorporate or escalate to user

**Protocol:** Take superego feedback seriously. It catches premature commitment, scope creep, and misalignment.
`;
            writeFileSync(agentsFile, content);
            results.push("✓ AGENTS.md created");
          } else {
            results.push("✓ AGENTS.md already exists");
          }

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

          return `Cloud Atlas AI Stack Status:\n\nba: ${ba}\nwm: ${wm}\nsuperego: ${sg}\n\nUse 'bottle-init' to initialize all components.`;
        },
      }),
    },
  };
};

export default Bottle;
