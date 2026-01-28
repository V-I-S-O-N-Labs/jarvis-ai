import { Injectable } from "@nestjs/common";
import { AgentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { PolicyService } from "./agents/policy.service";

@Injectable()
export class OrchestrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async reconcile(workload: number) {
    const activeAgents = await this.prisma.agent.findMany({
      where: { status: { not: AgentStatus.TERMINATED } },
      orderBy: { createdAt: "asc" },
    });

    const decision = this.policy.decide(workload, activeAgents.length);

    if (decision.desiredCount > activeAgents.length) {
      const toCreate = decision.desiredCount - activeAgents.length;
      for (let i = 0; i < toCreate; i += 1) {
        await this.prisma.agent.create({
          data: {
            name: `AutoAgent-${Date.now()}-${i}`,
            policy: Prisma.JsonNull,
            status: AgentStatus.CREATED,
          },
        });
      }
    }

    if (decision.desiredCount < activeAgents.length) {
      const toTerminate = activeAgents.length - decision.desiredCount;
      const candidates = activeAgents.filter((agent) => agent.status === AgentStatus.IDLE);
      const fallback = activeAgents.filter((agent) => agent.status !== AgentStatus.TERMINATED);
      const selected = [...candidates, ...fallback].slice(0, toTerminate);

      for (const agent of selected) {
        await this.prisma.agent.update({
          where: { id: agent.id },
          data: { status: AgentStatus.TERMINATED },
        });
        await this.prisma.auditLog.create({
          data: {
            action: "agent_autoterminated",
            agentId: agent.id,
            details: { reason: decision.reason },
          },
        });
      }
    }

    return {
      decision,
      currentCount: activeAgents.length,
      desiredCount: decision.desiredCount,
    };
  }
}
