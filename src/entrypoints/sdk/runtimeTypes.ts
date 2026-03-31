import type { z } from 'zod/v4'
import type { SDKMessage, SDKResultMessage, SDKUserMessage, SDKSessionInfo } from './coreTypes.js'

export type AnyZodRawShape = Record<string, z.ZodType>
export type InferShape<T extends AnyZodRawShape> = {
  [K in keyof T]: z.infer<T[K]>
}

export interface Options {
  model?: string
  maxTurns?: number
  systemPrompt?: string
  cwd?: string
  permissionMode?: string
  abortController?: AbortController
}

export interface InternalOptions extends Options {
  _internal?: boolean
}

export interface Query {
  [Symbol.asyncIterator](): AsyncIterator<SDKMessage>
  result: Promise<SDKResultMessage>
  abort(): void
}

export type InternalQuery = Query

export interface SDKSessionOptions {
  model?: string
  cwd?: string
  permissionMode?: string
}

export interface SDKSession {
  id: string
  send(message: string | AsyncIterable<SDKUserMessage>): Query
  close(): Promise<void>
}

export interface SdkMcpToolDefinition<_Schema extends AnyZodRawShape = AnyZodRawShape> {
  name: string
  description: string
}

export interface McpSdkServerConfigWithInstance {
  name: string
  version?: string
}

export type SessionMessage = SDKMessage

export interface ListSessionsOptions {
  dir?: string
  limit?: number
  offset?: number
}

export interface GetSessionInfoOptions {
  dir?: string
}

export interface GetSessionMessagesOptions {
  dir?: string
  limit?: number
  offset?: number
  includeSystemMessages?: boolean
}

export interface SessionMutationOptions {
  dir?: string
}

export interface ForkSessionOptions {
  dir?: string
  upToMessageId?: string
  title?: string
}

export interface ForkSessionResult {
  sessionId: string
}
