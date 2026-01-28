from datetime import datetime
import json
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Jarvis Agent Worker", version="0.1")


class Heartbeat(BaseModel):
    agent_id: str
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JobRequest(BaseModel):
    agent_id: str
    tool: str
    payload: dict


class JobResult(BaseModel):
    accepted: bool
    message: str
    executed_at: datetime = Field(default_factory=datetime.utcnow)


def is_tool_allowed(tool: str, scopes: List[str]) -> bool:
    return tool in scopes


def get_agent_scopes(agent_id: str) -> List[str]:
    policy_raw = os.getenv("AGENT_SCOPE_POLICY", "{}")
    try:
        policy = json.loads(policy_raw)
    except json.JSONDecodeError:
        policy = {}
    if not isinstance(policy, dict):
        return []
    scopes = policy.get(agent_id, [])
    if not isinstance(scopes, list):
        return []
    return [str(scope) for scope in scopes]


@app.post("/heartbeat")
def heartbeat(payload: Heartbeat):
    return {"status": "ok", "received_at": datetime.utcnow().isoformat()}


@app.post("/jobs", response_model=JobResult)
def run_job(job: JobRequest):
    scopes = get_agent_scopes(job.agent_id)
    if not is_tool_allowed(job.tool, scopes):
        raise HTTPException(status_code=403, detail="Tool not permitted for agent")
    return JobResult(accepted=True, message="Job accepted")


@app.get("/health")
def healthcheck():
    return {"status": "healthy"}
