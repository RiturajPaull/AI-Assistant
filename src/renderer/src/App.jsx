import { useEffect, useState } from "react";
import {
  Cpu,
  HardDrive,
  Battery,
  BatteryCharging,
  Wifi,
  Activity,
  Layers,
  RefreshCw,
  Server
} from "lucide-react";

function App() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchSystemData = async () => {
    try {
      if (window.ev?.getStatus) {
        const evStatus = await window.ev.getStatus();
        setStatus(evStatus);
      }

      if (window.system?.getSystemStats) {
        const systemStats = await window.system.getSystemStats();
        setStats(systemStats);
        setError(null);
      } else {
        setError("window.system is not available. Please restart the Electron app.");
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
      setError(err.message || "Failed to fetch system metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const poll = async () => {
      await fetchSystemData();
      if (isMounted && isAutoRefresh) {
        timerId = setTimeout(poll, 2500);
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isAutoRefresh]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        padding: "32px 20px 60px 20px",
        color: "#f3f4f6",
        fontFamily: "Inter, sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px", margin: 0 }}>
            EV System Monitor
          </h1>
          {status && (
            <span
              style={{
                fontSize: "12px",
                padding: "3px 10px",
                borderRadius: "9999px",
                backgroundColor: status.status === "online" ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                color: status.status === "online" ? "#4ade80" : "#facc15",
                border: "1px solid currentColor",
                fontWeight: "600"
              }}
            >
              {status.status.toUpperCase()}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: isAutoRefresh ? "#2563eb" : "#374151",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600"
            }}
          >
            {isAutoRefresh ? "● Live (2s)" : "Paused"}
          </button>
          <button
            onClick={fetchSystemData}
            title="Refresh now"
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            color: "#fca5a5",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "18px",
            fontSize: "14px"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !stats && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
          <Activity size={28} style={{ animation: "spin 1s linear infinite", marginBottom: "8px" }} />
          <p>Fetching system telemetry...</p>
        </div>
      )}

      {/* Grid of System Cards */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
          }}
        >
          {/* CPU Card */}
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#60a5fa" />
                <span style={{ fontWeight: "700", fontSize: "15px" }}>Processor</span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800", color: stats.cpu?.usage > 80 ? "#f87171" : "#60a5fa" }}>
                {stats.cpu?.usage}%
              </span>
            </div>

            {/* Usage Bar */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
              <div
                style={{
                  width: `${Math.min(stats.cpu?.usage || 0, 100)}%`,
                  height: "100%",
                  backgroundColor: stats.cpu?.usage > 80 ? "#ef4444" : "#3b82f6",
                  transition: "width 0.3s ease"
                }}
              />
            </div>

            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
              <strong>Model:</strong> {stats.cpu?.brand || stats.cpu?.manufacturer || "N/A"}
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
              <strong>Cores:</strong> {stats.cpu?.cores} ({stats.cpu?.physicalCores} Physical) • {stats.cpu?.speed} GHz
            </p>
          </div>

          {/* Memory Card */}
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <HardDrive size={18} color="#a78bfa" />
                <span style={{ fontWeight: "700", fontSize: "15px" }}>RAM Memory</span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800", color: stats.memory?.usage > 85 ? "#f87171" : "#a78bfa" }}>
                {stats.memory?.usage}%
              </span>
            </div>

            {/* Usage Bar */}
            <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
              <div
                style={{
                  width: `${Math.min(stats.memory?.usage || 0, 100)}%`,
                  height: "100%",
                  backgroundColor: stats.memory?.usage > 85 ? "#ef4444" : "#8b5cf6",
                  transition: "width 0.3s ease"
                }}
              />
            </div>

            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
              <strong>Used:</strong> {stats.memory?.usedGB} GB / {stats.memory?.totalGB} GB
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
              <strong>Available:</strong> {stats.memory?.freeGB} GB
            </p>
          </div>

          {/* Battery / GPU Card */}
          <div
            style={{
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {stats.battery?.charging ? <BatteryCharging size={18} color="#34d399" /> : <Battery size={18} color="#34d399" />}
                <span style={{ fontWeight: "700", fontSize: "15px" }}>Battery & Power</span>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#34d399" }}>
                {stats.battery?.hasBattery ? `${stats.battery.percent}%` : "AC Power"}
              </span>
            </div>

            {stats.battery?.hasBattery ? (
              <>
                <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: `${stats.battery.percent}%`,
                      height: "100%",
                      backgroundColor: stats.battery.percent < 20 ? "#ef4444" : "#10b981",
                      transition: "width 0.3s ease"
                    }}
                  />
                </div>
                <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
                  <strong>State:</strong> {stats.battery?.charging ? "⚡ Charging" : "🔋 Discharging"}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
                Desktop / No Battery Detected
              </p>
            )}

            {stats.gpu?.controllers?.length > 0 && (
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0" }}>
                <strong>GPU:</strong> {stats.gpu.controllers[0].model || "Integrated"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Processes Section */}
      {stats?.processes?.list && (
        <div
          style={{
            backgroundColor: "rgba(30, 41, 59, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={18} color="#f59e0b" />
              <span style={{ fontWeight: "700", fontSize: "15px" }}>Top Active Processes</span>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Total: {stats.processes.total} ({stats.processes.running} Running)
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", fontSize: "13px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding: "8px 4px" }}>PID</th>
                  <th style={{ padding: "8px 4px" }}>Name</th>
                  <th style={{ padding: "8px 4px" }}>CPU %</th>
                  <th style={{ padding: "8px 4px" }}>Memory %</th>
                </tr>
              </thead>
              <tbody>
                {stats.processes.list.slice(0, 8).map((proc) => (
                  <tr key={proc.pid} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 4px", color: "#64748b" }}>{proc.pid}</td>
                    <td style={{ padding: "8px 4px", fontWeight: "500" }}>{proc.name}</td>
                    <td style={{ padding: "8px 4px", color: proc.cpu > 20 ? "#f87171" : "#e2e8f0" }}>
                      {proc.cpu?.toFixed(1)}%
                    </td>
                    <td style={{ padding: "8px 4px", color: "#94a3b8" }}>{proc.memory?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
