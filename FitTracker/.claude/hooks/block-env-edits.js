#!/usr/bin/env node
// PreToolUse hook: refuse Edit/Write calls that target .env files (except
// the committed .env.local.example template), since .env.local holds real
// Supabase credentials that should never be touched by an automated edit.
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path || "";
  const isEnvFile = /(^|\/)\.env(\.[^/]*)?$/.test(filePath);
  const isExampleFile = /\.example$/.test(filePath);

  if (isEnvFile && !isExampleFile) {
    console.error(
      `Blocked: ${filePath} looks like an env file. Edit it directly in your editor if you need to change it — Claude should not write secrets.`
    );
    process.exit(2);
  }

  process.exit(0);
});
