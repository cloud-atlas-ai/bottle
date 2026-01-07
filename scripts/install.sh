#!/bin/bash
# Bottle installer - Cloud Atlas AI core stack
# Installs: ba, wm, superego (binaries + plugins + codex skills)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[bottle]${NC} $1"; }
warn() { echo -e "${YELLOW}[bottle]${NC} $1"; }
error() { echo -e "${RED}[bottle]${NC} $1" >&2; exit 1; }
info() { echo -e "${BLUE}[bottle]${NC} $1"; }

# Check if command exists
has_command() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prereqs() {
    log "Checking prerequisites..."

    if ! has_command cargo; then
        error "cargo not found. Install Rust: https://rustup.rs"
    fi

    if ! has_command claude; then
        warn "Claude CLI not found. Skipping Claude plugin installation..."
        SKIP_PLUGINS=1
    fi

    # Check for codex (optional)
    if has_command codex; then
        INSTALL_CODEX_SKILLS=1
    fi
}

# Install a cargo binary
install_cargo_bin() {
    local name="$1"
    log "Installing $name..."

    if cargo install "$name"; then
        info "✓ $name installed successfully"
    else
        error "Failed to install $name"
    fi
}

# Install Claude Code plugin
install_plugin() {
    local name="$1"

    if [ "$SKIP_PLUGINS" = "1" ]; then
        return 0
    fi

    log "Installing $name plugin..."

    # Check if plugin is already installed
    if claude plugin list 2>/dev/null | grep -q "^$name"; then
        info "✓ $name plugin already installed"
        return 0
    fi

    # Try to install from marketplace
    if claude plugin marketplace list 2>/dev/null | grep -q "$name"; then
        if claude plugin install "$name@$name"; then
            info "✓ $name plugin installed"
        else
            warn "Failed to install $name plugin from marketplace"
        fi
    else
        warn "$name plugin not found in marketplace"
        info "You can install it manually from: https://github.com/cloud-atlas-ai/$name"
    fi
}

# Install Codex skill for a tool
install_codex_skill() {
    local name="$1"

    if [ "$INSTALL_CODEX_SKILLS" != "1" ]; then
        return 0
    fi

    log "Installing $name Codex skill..."

    local skill_dir="$HOME/.codex/skills/$name"
    mkdir -p "$skill_dir"

    # Download skill files from GitHub (try main, then master branch)
    if curl -fsSL -o "$skill_dir/SKILL.md" \
        "https://raw.githubusercontent.com/cloud-atlas-ai/$name/main/codex-skill/SKILL.md" 2>/dev/null || \
       curl -fsSL -o "$skill_dir/SKILL.md" \
        "https://raw.githubusercontent.com/cloud-atlas-ai/$name/master/codex-skill/SKILL.md" 2>/dev/null; then
        info "✓ $name Codex skill installed"
    else
        warn "Failed to download $name Codex skill (not published yet)"
    fi
}

# Main installation
main() {
    echo ""
    log "Cloud Atlas AI Bottle Installer"
    log "Installing core stack: ba, wm, superego"
    echo ""

    check_prereqs

    # Install binaries in dependency order
    install_cargo_bin "ba"
    install_cargo_bin "wm"
    install_cargo_bin "superego"

    echo ""
    log "Binaries installed. Installing Claude Code plugins..."
    echo ""

    # Install plugins
    install_plugin "superego"
    install_plugin "wm"

    echo ""
    log "Installing Codex skills..."
    echo ""

    # Install Codex skills (ba and superego have them, wm doesn't)
    install_codex_skill "ba"
    install_codex_skill "superego"

    echo ""
    log "Installation complete!"
    echo ""
    info "Next steps:"
    info "  1. cd /your/project"
    info "  2. ba init       # Initialize task tracking"
    info "  3. wm init       # Initialize working memory"
    info "  4. sg init       # Initialize superego"
    echo ""
    info "Or use Claude Code commands:"
    info "  /superego:init"
    echo ""
    if [ "$INSTALL_CODEX_SKILLS" = "1" ]; then
        info "Codex users can use: \$ba, \$superego skills"
        echo ""
    fi
    info "To update: ./scripts/update.sh"
    info "Learn more: https://github.com/cloud-atlas-ai/bottle"
    echo ""
}

main "$@"
