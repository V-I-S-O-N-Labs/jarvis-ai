import { Injectable } from "@nestjs/common";

export interface FleetPolicy {
  minAgents: number;
  maxAgents: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

export interface PolicyDecision {
  desiredCount: number;
  reason: string;
}

@Injectable()
export class PolicyService {
  getDefaultPolicy(): FleetPolicy {
    return {
      minAgents: 1,
      maxAgents: 10,
      scaleUpThreshold: 5,
      scaleDownThreshold: 1,
    };
  }

  decide(workload: number, currentCount: number, policy?: FleetPolicy): PolicyDecision {
    const activePolicy = policy ?? this.getDefaultPolicy();
    let desired = currentCount;
    let reason = "no_change";

    if (workload > activePolicy.scaleUpThreshold) {
      desired = Math.min(activePolicy.maxAgents, currentCount + 1);
      reason = "scale_up";
    }

    if (workload <= activePolicy.scaleDownThreshold) {
      desired = Math.max(activePolicy.minAgents, currentCount - 1);
      reason = desired < currentCount ? "scale_down" : reason;
    }

    return { desiredCount: desired, reason };
  }
}
