// @ts-nocheck
// Dev entry - defines MACRO globals for running without bun build
globalThis.MACRO = {
  VERSION: "2.1.88-dev",
  PACKAGE_URL: "@anthropic-ai/claude-code",
  NATIVE_PACKAGE_URL: "claude-code-native",
  BUILD_TIME: new Date().toISOString(),
  VERSION_CHANGELOG: "",
  ISSUES_EXPLAINER: "",
  FEEDBACK_CHANNEL: "",
};

import("./cli.tsx");
