declare module 'bun:bundle' {
  /**
   * Build-time feature flag. Used by the Bun bundler for dead code elimination (DCE).
   * When a feature is disabled, the entire conditional block is removed from the bundle.
   *
   * In development, all features return true by default.
   * In production builds, features are controlled via --define flags.
   */
  export function feature(name: string): boolean;
}
