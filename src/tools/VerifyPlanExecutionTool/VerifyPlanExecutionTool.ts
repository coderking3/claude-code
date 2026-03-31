import { buildTool } from '../../Tool.js'
import { z } from 'zod/v4'

export const VerifyPlanExecutionTool = buildTool({
  name: 'VerifyPlanExecution',
  async description() {
    return 'Verify plan execution tool stub'
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
