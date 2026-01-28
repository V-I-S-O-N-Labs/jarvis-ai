import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AgentsService } from "./agents.service";
import { CreateAgentDto } from "./dto/create-agent.dto";
import { PermissionChangeDto } from "./dto/permission-change.dto";
import { UpdateAgentDto } from "./dto/update-agent.dto";

@ApiTags("agents")
@Controller("agents")
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body() body: CreateAgentDto) {
    return this.agentsService.create(body);
  }

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.agentsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateAgentDto) {
    return this.agentsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.agentsService.remove(id);
  }

  @Post(":id/permissions/grant")
  grant(@Param("id") id: string, @Body() body: PermissionChangeDto) {
    return this.agentsService.grantPermissions(id, body);
  }

  @Post(":id/permissions/revoke")
  revoke(@Param("id") id: string, @Body() body: PermissionChangeDto) {
    return this.agentsService.revokePermissions(id, body);
  }
}
