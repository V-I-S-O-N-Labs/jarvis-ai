import { useEffect, useState } from "react";

interface Agent {
  id: string;
  name: string;
  status: string;
  scopes: string[];
}

interface AuditLog {
  id: string;
  action: string;
  agentId?: string;
  createdAt: string;
}

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [scopes, setScopes] = useState<string>("");

  const loadAgents = async () => {
    const response = await fetch("/api/agents");
    if (response.ok) {
      setAgents(await response.json());
    }
  };

  const loadAudit = async () => {
    const response = await fetch("/api/audit");
    if (response.ok) {
      setAuditLogs(await response.json());
    }
  };

  useEffect(() => {
    void loadAgents();
    void loadAudit();
  }, []);

  const handlePermissionChange = async (action: "grant" | "revoke") => {
    if (!selectedAgent || !scopes.trim()) {
      return;
    }
    await fetch(`/api/agents/${selectedAgent}/permissions/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scopes: scopes.split(",").map((s) => s.trim()) }),
    });
    setScopes("");
    await loadAgents();
    await loadAudit();
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Jarvis Mission Control</p>
          <h1>Agent Orchestration Control Plane</h1>
          <p className="subtitle">
            Monitor agents, manage permissions, and review audit trails in real time.
          </p>
        </div>
        <button className="primary" onClick={loadAgents}>
          Refresh data
        </button>
      </header>

      <section className="panel">
        <h2>Agents</h2>
        <div className="grid">
          {agents.map((agent) => (
            <button
              key={agent.id}
              className={`card ${selectedAgent === agent.id ? "active" : ""}`}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <div className="card-header">
                <h3>{agent.name}</h3>
                <span className={`status status-${agent.status.toLowerCase()}`}>
                  {agent.status}
                </span>
              </div>
              <p className="meta">{agent.id}</p>
              <div className="scopes">
                {agent.scopes.length === 0 ? (
                  <span className="empty">No scopes</span>
                ) : (
                  agent.scopes.map((scope) => (
                    <span key={scope} className="pill">
                      {scope}
                    </span>
                  ))
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Permission management</h2>
        <div className="permission-grid">
          <div>
            <label htmlFor="agent">Selected agent</label>
            <select
              id="agent"
              value={selectedAgent}
              onChange={(event) => setSelectedAgent(event.target.value)}
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="scopes">Scopes (comma separated)</label>
            <input
              id="scopes"
              value={scopes}
              onChange={(event) => setScopes(event.target.value)}
              placeholder="github.read, slack.send"
            />
          </div>
          <div className="button-row">
            <button className="secondary" onClick={() => handlePermissionChange("grant")}
              disabled={!selectedAgent}
            >
              Grant
            </button>
            <button className="ghost" onClick={() => handlePermissionChange("revoke")}
              disabled={!selectedAgent}
            >
              Revoke
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Audit log</h2>
        <div className="audit-list">
          {auditLogs.map((log) => (
            <div key={log.id} className="audit-item">
              <div>
                <strong>{log.action}</strong>
                <p className="meta">Agent: {log.agentId ?? "system"}</p>
              </div>
              <span className="meta">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
