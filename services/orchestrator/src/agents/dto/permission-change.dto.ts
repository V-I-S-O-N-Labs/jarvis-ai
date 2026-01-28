import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";

export class PermissionChangeDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  scopes: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
