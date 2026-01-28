import { Injectable, NotFoundException } from "@nestjs/common";
import { AgentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { PermissionChangeDto } from "./dto/permission-change.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";
import { LifecycleService } from "./lifecycle.service";

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: LifecycleService,
  ) {}

  async create(input: CreateAgentDto) {
    const agent = await this.prisma.agent.create({
      data: {
        name: input.name,
        scopes: input.scopes ?? [],
        policy: input.policy ?? Prisma.JsonNull,
        status: AgentStatus.CREATED,
      },
    });

    await this.createAudit("agent_created", agent.id, { name: agent.name });

    return agent;
  }

  async findAll() {
    return this.prisma.agent.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }
    return agent;
  }

  async update(id: string, input: UpdateAgentDto) {
    const agent = await this.findOne(id);
    if (input.status && agent.status !== input.status) {
      this.lifecycle.assertTransition(agent.status, input.status as AgentStatus);
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        name: input.name ?? agent.name,
        status: (input.status as AgentStatus) ?? agent.status,
        scopes: input.scopes ?? agent.scopes,
        policy: input.policy ?? agent.policy ?? Prisma.JsonNull,
      },
    });

    await this.createAudit("agent_updated", id, { updates: input });

    return updated;
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
      data: { scopes: Array.from(scopeSet) },
    });

    await this.prisma.permissionGrant.create({
      data: {
        agentId: id,
        scopes: input.scopes,
        action: "grant",
        reason: input.reason,
      },
    });

    await this.createAudit("permissions_granted", id, {
      scopes: input.scopes,
      reason: input.reason,
    });

    return updated;
  }

  async revokePermissions(id: string, input: PermissionChangeDto) {
    const agent = await this.findOne(id);
    const scopeSet = new Set(agent.scopes);
    input.scopes.forEach((scope) => scopeSet.delete(scope));

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { scopes: Array.from(scopeSet) },
    });

    await this.prisma.permissionGrant.create({
      data: {
        agentId: id,
        scopes: input.scopes,
        action: "revoke",
        reason: input.reason,
      },
    });

    await this.createAudit("permissions_revoked", id, {
      scopes: input.scopes,
      reason: input.reason,
    });

    return updated;
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
}
