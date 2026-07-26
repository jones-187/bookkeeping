#!/usr/bin/env bash

set -euo pipefail

tracker_repo="${1:-jones-187/bookkeeping}"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: GitHub CLI (gh) is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: authenticate GitHub CLI with 'gh auth login' first." >&2
  exit 1
fi

ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  gh label create "$name" \
    --repo "$tracker_repo" \
    --color "$color" \
    --description "$description" \
    --force
}

ensure_label "wayfinder:map" "5319E7" "Wayfinder decision map"
ensure_label "wayfinder:research" "0E8A16" "External facts needed for a decision"
ensure_label "wayfinder:prototype" "FBCA04" "Concrete prototype used to resolve a decision"
ensure_label "wayfinder:grilling" "D93F0B" "Human-in-the-loop decision conversation"
ensure_label "wayfinder:task" "1D76DB" "Prerequisite work needed before a decision"

echo "Wayfinder labels are configured for $tracker_repo."
