import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";

export enum AgentStatusDto {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  IDLE = "IDLE",
  TERMINATED = "TERMINATED",
}

export class UpdateAgentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, enum: AgentStatusDto })
  @IsOptional()
  @IsEnum(AgentStatusDto)
  status?: AgentStatusDto;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  policy?: Record<string, unknown>;
}
