from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def test_denies_disallowed_tool():
    response = client.post(
        "/jobs",
        json={
            "agent_id": "agent-1",
            "tool": "github.write",
            "scopes": ["github.read"],
            "payload": {},
        },
    )
    assert response.status_code == 403


def test_allows_permitted_tool():
    response = client.post(
        "/jobs",
        json={
            "agent_id": "agent-1",
            "tool": "github.read",
            "scopes": ["github.read"],
            "payload": {},
        },
    )
    assert response.status_code == 200
    assert response.json()["accepted"] is True
