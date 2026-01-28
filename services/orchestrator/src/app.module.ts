import { Module } from "@nestjs/common";
import { AuditController } from "./audit.controller";
import { AgentsController } from "./agents/agents.controller";
import { AgentsService } from "./agents/agents.service";
import { LifecycleService } from "./agents/lifecycle.service";
import { PolicyService } from "./agents/policy.service";
import { OrchestrationController } from "./orchestration.controller";
import { OrchestrationService } from "./orchestration.service";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [AgentsController, AuditController, OrchestrationController],
  providers: [
    AgentsService,
    LifecycleService,
    PolicyService,
    OrchestrationService,
    PrismaService,
  ],
})
export class AppModule {}
