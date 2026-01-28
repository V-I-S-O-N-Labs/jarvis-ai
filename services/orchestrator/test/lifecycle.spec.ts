import { BadRequestException } from "@nestjs/common";
import { AgentStatus } from "@prisma/client";
import { LifecycleService } from "../src/agents/lifecycle.service";

describe("LifecycleService", () => {
  it("allows valid transitions", () => {
    const service = new LifecycleService();
    expect(service.canTransition(AgentStatus.CREATED, AgentStatus.RUNNING)).toBe(true);
    expect(service.canTransition(AgentStatus.RUNNING, AgentStatus.IDLE)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    const service = new LifecycleService();
    expect(() =>
      service.assertTransition(AgentStatus.CREATED, AgentStatus.TERMINATED),
    ).toThrow(BadRequestException);
  });
});
