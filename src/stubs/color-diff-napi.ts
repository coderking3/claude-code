export type SyntaxTheme = Record<string, unknown>

export class ColorDiff {
  constructor(_oldText: string, _newText: string, _options?: unknown) {}
  render(): string {
    return ''
  }
}

export class ColorFile {
  constructor(_text: string, _options?: unknown) {}
  render(): string {
    return ''
  }
}

export function getSyntaxTheme(_themeName: string): SyntaxTheme | null {
  return null
}
