#!/bin/bash
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
REPO="$HOME/Documents/rez-risk-digest"
LOG="$HOME/Library/Logs/rez-autopush.log"
exec >> "$LOG" 2>&1
echo "----- $(date '+%Y-%m-%d %H:%M:%S') autopush -----"
cd "$REPO" || { echo "ERROR: repo not found at $REPO"; exit 1; }
[ -f .git/index.lock ] && { rm -f .git/index.lock .git/HEAD.lock && echo "cleared stale lock"; }
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "digest: $(date '+%Y-%m-%d') (auto)" && echo "committed"
fi
git push && echo "push OK (or already up to date)" || echo "ERROR: push failed"
