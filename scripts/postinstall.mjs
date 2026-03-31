import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';

// 1. Remove ink's nested react-reconciler (needs top-level 0.33.0 for React 19 useEffectEvent)
const nestedReconciler = 'node_modules/ink/node_modules/react-reconciler';
if (existsSync(nestedReconciler)) {
  rmSync(nestedReconciler, { recursive: true, force: true });
  console.log('Removed nested react-reconciler from ink');
}

// 2. Patch commander's splitOptionFlags to accept non-standard short flags
const optionJs = 'node_modules/commander/lib/option.js';
if (existsSync(optionJs)) {
  let code = readFileSync(optionJs, 'utf8');
  if (code.includes('invalid Option flags, short option is dash and single character') ||
      code.includes('a short flag is a single dash')) {
    const fnStart = code.indexOf('function splitOptionFlags(flags)');
    if (fnStart !== -1) {
      let braceDepth = 0, fnEnd = -1, inBody = false;
      for (let i = fnStart; i < code.length; i++) {
        if (code[i] === '{') { braceDepth++; inBody = true; }
        if (code[i] === '}') { braceDepth--; }
        if (inBody && braceDepth === 0) { fnEnd = i + 1; break; }
      }
      if (fnEnd !== -1) {
        const replacement = `function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  const parts = flags.split(/[ |,]+/);
  if (parts.length > 1 && !/^[[<]/.test(parts[1])) shortFlag = parts.shift();
  longFlag = parts.shift();
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}`;
        code = code.slice(0, fnStart) + replacement + code.slice(fnEnd);
        writeFileSync(optionJs, code);
        console.log('Patched commander splitOptionFlags');
      }
    }
  } else {
    console.log('commander already patched');
  }
}

// 3. Ensure internal stub packages exist (these are not on npm)
function ensureStub(dir, name, indexContent) {
  mkdirSync(dir, { recursive: true });
  const pj = dir + '/package.json';
  const ij = dir + '/index.js';
  if (!existsSync(ij)) {
    writeFileSync(pj, JSON.stringify({ name, version: '0.0.0', type: 'module', main: 'index.js' }, null, 2));
    writeFileSync(ij, indexContent);
    console.log(`Created stub: ${name}`);
  }
}

ensureStub('node_modules/color-diff-napi', 'color-diff-napi', `\
export class ColorDiff {
  constructor(oldText, newText, options) { this.oldText = oldText; this.newText = newText; }
  render(themeName, width, dim) { return []; }
}
export class ColorFile {
  constructor(code, filePath) { this.code = code; this.filePath = filePath; }
  render(themeName, width, dim) {
    if (!this.code) return [];
    return this.code.split('\\n').map((line, i) => \`\${String(i + 1).padStart(4)} \${line}\`);
  }
}
export function getSyntaxTheme(themeName) { return { theme: themeName || 'default', source: null }; }
`);

ensureStub('node_modules/modifiers-napi', 'modifiers-napi', `\
export function isModifierPressed(modifier) { return false; }
export function prewarm() {}
`);

ensureStub('node_modules/@ant/claude-for-chrome-mcp', '@ant/claude-for-chrome-mcp', `\
export const BROWSER_TOOLS = [];
export function createClaudeForChromeMcpServer() { return null; }
`);

ensureStub('node_modules/@anthropic-ai/mcpb', '@anthropic-ai/mcpb', `\
export async function getMcpConfigForManifest() { return {}; }
`);

// sandbox-runtime needs many static methods - write full stub
ensureStub('node_modules/@anthropic-ai/sandbox-runtime', '@anthropic-ai/sandbox-runtime', `\
const noop = () => {};
const asyncNoop = async () => {};
const returnFalse = () => false;
const returnTrue = () => true;
const returnNull = () => null;
const returnEmpty = () => ({});
const returnEmptyArray = () => [];
const returnZero = () => 0;

export class SandboxManager {
  constructor(config) { this.config = config; }
  async initialize() {}
  async dispose() {}
  checkFsRead() { return { allowed: true }; }
  checkFsWrite() { return { allowed: true }; }
  checkNetwork() { return { allowed: true }; }
  checkExec() { return { allowed: true }; }

  static isSupportedPlatform = returnFalse;
  static isPlatformInEnabledList = returnFalse;
  static isSandboxingEnabled = returnFalse;
  static isSandboxRequired = returnFalse;
  static isSandboxEnabledInSettings = returnFalse;
  static isAutoAllowBashIfSandboxedEnabled = returnFalse;
  static areUnsandboxedCommandsAllowed = returnTrue;
  static areSandboxSettingsLockedByPolicy = returnFalse;
  static getSandboxUnavailableReason = () => "Sandbox runtime stub";
  static getSandboxViolationStore = () => new SandboxViolationStore();
  static checkDependencies = () => ({ errors: [], warnings: [] });
  static getProxyPort = returnZero;
  static getSocksProxyPort = returnZero;
  static getFsReadConfig = returnEmpty;
  static getFsWriteConfig = returnEmpty;
  static getNetworkRestrictionConfig = returnEmpty;
  static getExcludedCommands = returnEmptyArray;
  static getIgnoreViolations = returnFalse;
  static getAllowLocalBinding = returnFalse;
  static getAllowUnixSockets = returnFalse;
  static getEnableWeakerNestedSandbox = returnFalse;
  static getLinuxGlobPatternWarnings = returnEmptyArray;
  static getLinuxHttpSocketPath = returnNull;
  static getLinuxSocksSocketPath = returnNull;
  static initialize = asyncNoop;
  static refreshConfig = noop;
  static reset = noop;
  static updateConfig = noop;
  static setSandboxSettings = asyncNoop;
  static waitForNetworkInitialization = asyncNoop;
  static cleanupAfterCommand = asyncNoop;
  static wrapWithSandbox = (cmd) => cmd;
  static annotateStderrWithSandboxFailures = (stderr) => stderr;
}

export class SandboxViolationStore {
  constructor() { this.violations = []; }
  add(v) { this.violations.push(v); }
  getAll() { return this.violations; }
  clear() { this.violations = []; }
}

export const SandboxRuntimeConfigSchema = { parse: v => v, safeParse: v => ({ success: true, data: v }) };
export function createSandbox() { return null; }
`);
