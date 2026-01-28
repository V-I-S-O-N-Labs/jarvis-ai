import { BadRequestException, Injectable } from "@nestjs/common";
import { AgentStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  CREATED: ["RUNNING"],
  RUNNING: ["IDLE", "TERMINATED"],
  IDLE: ["RUNNING", "TERMINATED"],
  TERMINATED: [],
};

@Injectable()
export class LifecycleService {
  canTransition(from: AgentStatus, to: AgentStatus): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
  }

  assertTransition(from: AgentStatus, to: AgentStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid lifecycle transition from ${from} to ${to}.`,
      );
    }
  }
}
