import { buildTool } from '../../Tool.js'
import { z } from 'zod/v4'

export const SuggestBackgroundPRTool = buildTool({
  name: 'SuggestBackgroundPR',
  async description() {
    return 'Suggest background PR tool stub'
  },
  inputJSONSchema: {
    type: 'object' as const,
    properties: {},
  },
  inputSchema: z.strictObject({}),
  isEnabled() {
    return false
  },
  async call() {
    return { type: 'text' as const, text: '' }
  },
})
