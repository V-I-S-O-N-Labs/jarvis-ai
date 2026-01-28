import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AgentsService } from "./agents/agents.service";

@ApiTags("audit")
@Controller("audit")
export class AuditController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  list() {
    return this.agentsService.listAuditLogs();
  }
}
