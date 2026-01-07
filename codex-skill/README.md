# Bottle Codex Skill

Provides `$bottle` commands for installing and updating the Cloud Atlas AI core stack in Codex sessions.

## Installation

```bash
mkdir -p ~/.codex/skills/bottle
curl -fsSL -o ~/.codex/skills/bottle/SKILL.md \
  https://raw.githubusercontent.com/cloud-atlas-ai/bottle/master/codex-skill/SKILL.md
```

## Commands

- `$bottle init` - Install ba, wm, superego (binaries + plugins + skills)
- `$bottle update` - Update all tools

## What It Does

Clones the bottle repo locally and runs install/update scripts. This ensures Codex users get the complete stack including Codex skills for ba and superego.

## See Also

- [Main README](../README.md)
- [install.sh](../scripts/install.sh)
- [update.sh](../scripts/update.sh)
