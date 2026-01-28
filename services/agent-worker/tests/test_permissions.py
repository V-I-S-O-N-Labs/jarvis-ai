import json

from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def test_denies_disallowed_tool(monkeypatch):
    monkeypatch.setenv(
        "AGENT_SCOPE_POLICY", json.dumps({"agent-1": ["github.read"]})
    )
    response = client.post(
        "/jobs",
        json={
            "agent_id": "agent-1",
            "tool": "github.write",
            "payload": {},
        },
    )
    assert response.status_code == 403


def test_allows_permitted_tool(monkeypatch):
    monkeypatch.setenv(
        "AGENT_SCOPE_POLICY", json.dumps({"agent-1": ["github.read"]})
    )
    response = client.post(
        "/jobs",
        json={
            "agent_id": "agent-1",
            "tool": "github.read",
            "payload": {},
        },
    )
    assert response.status_code == 200
    assert response.json()["accepted"] is True
