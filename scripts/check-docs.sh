#!/usr/bin/env bash

# Documentation checks that require no network access or package installation.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "error: run this script from inside a Git working tree." >&2
  exit 1
}
cd "$repo_root"

failures=0
fail() {
  echo "error: $*" >&2
  failures=$((failures + 1))
}

for required_command in git rg awk find; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    fail "required command is unavailable: $required_command"
  fi
done

if (( failures > 0 )); then
  exit 1
fi

for required_file in \
  README.md \
  AGENTS.md \
  CONTEXT.md \
  CHANGELOG.md \
  docs/README.md \
  docs/DOCUMENTATION.md; do
  if [[ ! -f "$required_file" ]]; then
    fail "required documentation entry is missing: $required_file"
  fi
done

while IFS= read -r candidate; do
  [[ -f "$candidate" ]] || continue
  basename_upper="$(basename "$candidate" | tr '[:lower:]' '[:upper:]')"
  case "$basename_upper" in
    BACKLOG.MD|ROADMAP.MD|TODO.MD|PLAN.MD)
      fail "retired planning document must not exist: $candidate"
      ;;
  esac
done < <(git ls-files --cached --others --exclude-standard)

for retired_directory in \
  .trae \
  docs/archive \
  docs/legacy \
  docs/designs \
  docs/superpowers \
  prompts \
  tests/unit \
  tests/integration; do
  if [[ -d "$retired_directory" ]]; then
    fail "retired documentation directory must not exist: $retired_directory"
  fi
done

for retired_file in scripts/README.md src/app/README.md src/server/README.md; do
  if [[ -e "$retired_file" ]]; then
    fail "retired duplicate documentation must not exist: $retired_file"
  fi
done

# Check inline Markdown links. External URLs, anchors, mail links, and absolute
# paths are intentionally outside this repository-local check.
while IFS= read -r markdown_file; do
  markdown_dir="$(dirname "$markdown_file")"
  [[ -f "$markdown_file" ]] || continue

  if rg -n '[[:blank:]]+$' "$markdown_file" >/dev/null; then
    fail "$markdown_file contains trailing whitespace."
  fi

  fence_count="$(rg -c '^```' "$markdown_file" || true)"
  if (( fence_count % 2 != 0 )); then
    fail "$markdown_file has an unbalanced fenced code block."
  fi

  while IFS= read -r target; do
    target="${target#](}"
    target="${target%)}"
    target="${target%%#*}"
    target="${target%%\?*}"
    target="${target#<}"
    target="${target%>}"

    [[ -z "$target" || "$target" == /* || "$target" == ~* ]] && continue
    [[ "$target" =~ ^[a-zA-Z][a-zA-Z0-9+.-]*: ]] && continue

    if [[ ! -e "$markdown_dir/$target" ]]; then
      fail "$markdown_file links to missing local path: $target"
    fi
  done < <(rg -o --no-filename '\]\(([^ )]+)( [^)]*)?\)' "$markdown_file" | awk '{ print $1 }')
done < <(git ls-files --cached --others --exclude-standard -- '*.md' | sort -u)

for directory in docs/adr docs/specs; do
  [[ -d "$directory" ]] || continue
  if [[ "$directory" == docs/adr ]]; then
    valid_statuses='^(Proposed|Accepted|Superseded|Rejected)$'
    allowed_statuses='Proposed, Accepted, Superseded, Rejected'
  else
    valid_statuses='^(Draft|Accepted|Implemented|Superseded)$'
    allowed_statuses='Draft, Accepted, Implemented, Superseded'
  fi
  while IFS= read -r document; do
    [[ "$(basename "$document")" == README.md ]] && continue
    status="$(awk '
      /^## 状态[[:space:]]*$/ { in_status = 1; next }
      in_status && /^## / { exit }
      in_status && NF { print; exit }
    ' "$document")"

    if [[ -z "$status" ]]; then
      fail "$document must have a non-empty status after '## 状态'."
    elif [[ ! "$status" =~ $valid_statuses ]]; then
      fail "$document has invalid status '$status' (allowed: $allowed_statuses)."
    fi
  done < <(find "$directory" -maxdepth 1 -type f -name '*.md' -print | sort)
done

if (( failures > 0 )); then
  echo "Documentation checks failed: $failures issue(s)." >&2
  exit 1
fi

echo "Documentation checks passed."
