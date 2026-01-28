import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { OrchestrationService } from "./orchestration.service";

class ReconcileDto {
  @IsNumber()
  workload: number;
}

@ApiTags("orchestration")
@Controller("orchestration")
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}

  @Post("reconcile")
  reconcile(@Body() body: ReconcileDto) {
    return this.orchestrationService.reconcile(body.workload);
  }
}
