import { z } from "zod";

export const AgentStatusSchema = z.enum([
  "CREATED",
  "RUNNING",
  "IDLE",
  "TERMINATED",
]);

export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: AgentStatusSchema,
  scopes: z.array(z.string()),
  policy: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateAgentSchema = z.object({
  name: z.string(),
  scopes: z.array(z.string()).default([]),
  policy: z.record(z.string(), z.any()).optional(),
});

export const UpdateAgentSchema = z.object({
  name: z.string().optional(),
  status: AgentStatusSchema.optional(),
  scopes: z.array(z.string()).optional(),
  policy: z.record(z.string(), z.any()).optional(),
});

export const PermissionChangeSchema = z.object({
  scopes: z.array(z.string()),
  reason: z.string().optional(),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  agentId: z.string().nullable(),
  details: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
});

export type Agent = z.infer<typeof AgentSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type PermissionChangeInput = z.infer<typeof PermissionChangeSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
