import { Injectable, NotFoundException } from "@nestjs/common";
import { AgentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { PermissionChangeDto } from "./dto/permission-change.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { LifecycleService } from "./lifecycle.service";

type AgentWithScopes = Prisma.AgentGetPayload<{ include: { scopes: true } }>;

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: LifecycleService,
  ) {}

  async create(input: CreateAgentDto) {
    const scopes = Array.from(new Set(input.scopes ?? []));
    const agent = await this.prisma.agent.create({
      data: {
        name: input.name,
        scopes: {
          create: scopes.map((scope) => ({ scope })),
        },
        policy: input.policy ?? Prisma.JsonNull,
        status: AgentStatus.CREATED,
      },
      include: { scopes: true },
    });

    await this.createAudit("agent_created", agent.id, { name: agent.name });

    return this.serializeAgent(agent);
  }

  async findAll() {
    const agents = await this.prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      include: { scopes: true },
    });
    return agents.map((agent) => this.serializeAgent(agent));
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: { scopes: true },
    });
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }
    return this.serializeAgent(agent);
  }

  async update(id: string, input: UpdateAgentDto) {
    const agent = await this.findOne(id);
    if (input.status && agent.status !== input.status) {
      this.lifecycle.assertTransition(agent.status, input.status as AgentStatus);
    }

    const data: Prisma.AgentUpdateInput = {
      name: input.name ?? agent.name,
      status: (input.status as AgentStatus) ?? agent.status,
      policy: input.policy ?? agent.policy ?? Prisma.JsonNull,
    };

    if (input.scopes) {
      const scopes = Array.from(new Set(input.scopes));
      data.scopes = {
        deleteMany: {},
        create: scopes.map((scope) => ({ scope })),
      };
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data,
      include: { scopes: true },
    });

    await this.createAudit("agent_updated", id, { updates: input });

    return this.serializeAgent(updated);
  }

  async remove(id: string) {
    const agent = await this.findOne(id);
    const removed = await this.prisma.agent.update({
      where: { id: agent.id },
      data: { status: AgentStatus.TERMINATED },
    });
    await this.createAudit("agent_terminated", id, { previousStatus: agent.status });
    return removed;
  }

  async grantPermissions(id: string, input: PermissionChangeDto) {
    const agent = await this.findOne(id);
    const scopeSet = new Set(agent.scopes);
    input.scopes.forEach((scope) => scopeSet.add(scope));

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        scopes: {
          deleteMany: {},
          create: Array.from(scopeSet).map((scope) => ({ scope })),
        },
      },
      include: { scopes: true },
    });

    await this.prisma.permissionGrant.create({
      data: {
        agentId: id,
        scopes: {
          create: input.scopes.map((scope) => ({ scope })),
        },
        action: "grant",
        reason: input.reason,
      },
    });

    await this.createAudit("permissions_granted", id, {
      scopes: input.scopes,
      reason: input.reason,
    });

    return this.serializeAgent(updated);
  }

  async revokePermissions(id: string, input: PermissionChangeDto) {
    const agent = await this.findOne(id);
    const scopeSet = new Set(agent.scopes);
    input.scopes.forEach((scope) => scopeSet.delete(scope));

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        scopes: {
          deleteMany: {},
          create: Array.from(scopeSet).map((scope) => ({ scope })),
        },
      },
      include: { scopes: true },
    });

    await this.prisma.permissionGrant.create({
      data: {
        agentId: id,
        scopes: {
          create: input.scopes.map((scope) => ({ scope })),
        },
        action: "revoke",
        reason: input.reason,
      },
    });

    await this.createAudit("permissions_revoked", id, {
      scopes: input.scopes,
      reason: input.reason,
    });

    return this.serializeAgent(updated);
  }

  async listAuditLogs() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
  }

  private async createAudit(action: string, agentId: string, details?: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: {
        action,
        agentId,
        details: details ?? Prisma.JsonNull,
      },
    });
  }

  private serializeAgent(agent: AgentWithScopes) {
    return {
      ...agent,
      scopes: agent.scopes.map((scope) => scope.scope),
    };
  }
}
