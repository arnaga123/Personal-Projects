#!/bin/bash
# PostToolUse hook: after any Edit/Write, re-run the type checker and linter
# so errors surface immediately instead of needing to be run manually.
cd "$CLAUDE_PROJECT_DIR" || exit 0

tsc_output=$(npx tsc --noEmit 2>&1)
tsc_status=$?

eslint_output=$(npx eslint . --quiet 2>&1)
eslint_status=$?

if [ $tsc_status -ne 0 ] || [ $eslint_status -ne 0 ]; then
  echo "--- tsc --noEmit ---" >&2
  echo "$tsc_output" >&2
  echo "--- eslint --quiet ---" >&2
  echo "$eslint_output" >&2
  exit 2
fi

exit 0
