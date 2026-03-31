/**
 * Build-time macros injected by Bun bundler via --define flags.
 * These are replaced with literal values at bundle time.
 */
declare const MACRO: {
  /** Semantic version string, e.g. "2.1.88" */
  VERSION: string;
  /** npm package name/URL, e.g. "@anthropic-ai/claude-code" */
  PACKAGE_URL: string;
  /** Native installer package name */
  NATIVE_PACKAGE_URL: string;
  /** ISO 8601 build timestamp */
  BUILD_TIME: string;
  /** Changelog/release notes content */
  VERSION_CHANGELOG: string;
  /** User-facing issues/bug report guidance text */
  ISSUES_EXPLAINER: string;
  /** Feedback channel description */
  FEEDBACK_CHANNEL: string;
};
