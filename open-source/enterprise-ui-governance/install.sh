#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE_DIR="$SCRIPT_DIR/skills/enterprise-ui-governance"
CODEX_ROOT="${CODEX_HOME:-${HOME}/.codex}"
DESTINATION="${1:-$CODEX_ROOT/skills/enterprise-ui-governance}"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Skill source not found: $SOURCE_DIR" >&2
  exit 1
fi

if [ -e "$DESTINATION" ]; then
  echo "Destination already exists: $DESTINATION" >&2
  exit 1
fi

mkdir -p "$(dirname -- "$DESTINATION")"
cp -R "$SOURCE_DIR" "$DESTINATION"

echo "Installed enterprise-ui-governance to $DESTINATION"
echo 'Restart Codex, then invoke $enterprise-ui-governance.'
