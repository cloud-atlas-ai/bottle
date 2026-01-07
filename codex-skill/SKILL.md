---
name: bottle
description: Install and update the Cloud Atlas AI core stack (ba, wm, superego). Use "$bottle init" to install everything.
---

# Bottle - Cloud Atlas AI Stack Installer

## $bottle init

Install the complete Cloud Atlas AI development stack: ba, wm, superego (binaries + Claude plugins + Codex skills).

**Run:**
```bash
# Clone bottle repo
BOTTLE_DIR="$HOME/.local/share/bottle"
if [ ! -d "$BOTTLE_DIR" ]; then
  git clone https://github.com/cloud-atlas-ai/bottle "$BOTTLE_DIR"
else
  cd "$BOTTLE_DIR" && git pull
fi

# Run install script
"$BOTTLE_DIR/scripts/install.sh"
```

**What gets installed:**
- **ba** - Task tracking (binary + codex skill)
- **wm** - Working memory (binary + Claude plugin)
- **superego** - Metacognition (binary + Claude plugin + codex skill)

**After installation:**
Tell user: "Bottle installed successfully. The Cloud Atlas AI stack is ready. In your projects, run `ba init`, `wm init`, and `sg init` to set up per-project directories."

## $bottle update

Update all Cloud Atlas AI tools to their latest versions.

**Run:**
```bash
BOTTLE_DIR="$HOME/.local/share/bottle"
if [ -d "$BOTTLE_DIR" ]; then
  cd "$BOTTLE_DIR" && git pull
  "$BOTTLE_DIR/scripts/update.sh"
else
  echo "Bottle not installed. Run \$bottle init first."
fi
```

**After update:**
Tell user: "All tools updated. Restart Claude Code if you're using it."

## When to use

- **$bottle init**: First time setup, or reinstalling on a new machine
- **$bottle update**: Keep everything in sync with latest versions
