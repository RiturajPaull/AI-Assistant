import { useEffect, useState } from "react";
import {
  Cpu,
  HardDrive,
  Battery,
  BatteryCharging,
  Zap,
  Layers,
  RefreshCw,
  Minus,
  Square,
  X,
  Radio,
  Flame,
  Activity
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
        setError("EV telemetry link offline. Please restart EV.");
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
      setError(err.message || "EV neural link interrupted");
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
        timerId = setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [isAutoRefresh]);

  const handleMinimize = () => window.windowControls?.minimize();
  const handleMaximize = () => window.windowControls?.maximize();
  const handleClose = () => window.windowControls?.close();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        padding: "12px",
        boxSizing: "border-box"
      }}
    >
      {/* EV HUD Main Container */}
      <div
        className="hud-panel"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: "1px solid rgba(255, 136, 0, 0.45)",
          background: "linear-gradient(135deg, rgba(28, 12, 3, 0.85) 0%, rgba(16, 6, 2, 0.78) 100%)",
          boxShadow: "0 0 35px rgba(255, 119, 0, 0.22), inset 0 0 25px rgba(255, 119, 0, 0.08)",
          position: "relative"
        }}
      >
        {/* Corner Hologram Accents */}
        <div className="hud-corner hud-corner-tl" style={{ width: "16px", height: "16px", borderWidth: "3px 0 0 3px", borderColor: "#ff7700" }} />
        <div className="hud-corner hud-corner-tr" style={{ width: "16px", height: "16px", borderWidth: "3px 3px 0 0", borderColor: "#ff7700" }} />
        <div className="hud-corner hud-corner-bl" style={{ width: "16px", height: "16px", borderWidth: "0 0 3px 3px", borderColor: "#ff7700" }} />
        <div className="hud-corner hud-corner-br" style={{ width: "16px", height: "16px", borderWidth: "0 3px 3px 0", borderColor: "#ff7700" }} />

        {/* Top Draggable HUD Window Bar */}
        <div
          className="titlebar-drag"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            borderBottom: "1px solid rgba(255, 136, 0, 0.25)",
            background: "rgba(255, 119, 0, 0.05)"
          }}
        >
          {/* EV Brand Logo & System State */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Pulsing Orange Arc Reactor Icon */}
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "2px solid #ff7700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px #ff7700, inset 0 0 8px #ff7700",
                animation: "arcPulseOrange 4s infinite linear"
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ff9900",
                  boxShadow: "0 0 10px #ffa600"
                }}
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  className="hud-text-glow"
                  style={{
                    fontSize: "17px",
                    fontWeight: "900",
                    letterSpacing: "3px",
                    color: "#ff8c00"
                  }}
                >
                  E.V
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "1.5px",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: "rgba(255, 119, 0, 0.2)",
                    border: "1px solid rgba(255, 140, 0, 0.5)",
                    color: "#ffa600",
                    fontWeight: "800"
                  }}
                >
                  AI NEURAL OS
                </span>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  letterSpacing: "1.5px",
                  color: "rgba(255, 170, 80, 0.75)",
                  margin: 0,
                  textTransform: "uppercase"
                }}
              >
                TACTICAL HUD TELEMETRY // CORE STATUS {status?.status === "online" ? "ONLINE" : "STANDBY"}
              </p>
            </div>
          </div>

          {/* Central Subsystem Live Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              borderRadius: "20px",
              background: "rgba(255, 119, 0, 0.1)",
              border: "1px solid rgba(255, 140, 0, 0.35)",
              boxShadow: "0 0 10px rgba(255, 119, 0, 0.15)"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 8px #22c55e"
              }}
            />
            <span style={{ fontSize: "11px", letterSpacing: "1.5px", color: "#fed7aa", fontWeight: "700" }}>
              ALL SYSTEMS NOMINAL
            </span>
          </div>

          {/* Controls & Window Action Buttons */}
          <div className="no-drag" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background: isAutoRefresh ? "rgba(255, 119, 0, 0.25)" : "rgba(255, 255, 255, 0.05)",
                color: isAutoRefresh ? "#ff9900" : "#94a3b8",
                border: isAutoRefresh ? "1px solid #ff7700" : "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Radio size={12} color={isAutoRefresh ? "#ff9900" : "#94a3b8"} />
              {isAutoRefresh ? "SYNC 3s" : "PAUSED"}
            </button>

            <button
              onClick={fetchSystemData}
              title="Manual Telemetry Scan"
              style={{
                padding: "6px",
                borderRadius: "6px",
                background: "rgba(255, 119, 0, 0.12)",
                border: "1px solid rgba(255, 140, 0, 0.35)",
                color: "#ff9900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <RefreshCw size={13} />
            </button>

            <div style={{ width: "1px", height: "16px", background: "rgba(255, 136, 0, 0.3)", margin: "0 4px" }} />

            {/* Minimize Button */}
            <button
              onClick={handleMinimize}
              title="Minimize"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fdba74",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Minus size={13} />
            </button>

            {/* Maximize Button */}
            <button
              onClick={handleMaximize}
              title="Maximize"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fdba74",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Square size={11} />
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              title="Close HUD"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "rgba(255, 51, 68, 0.18)",
                border: "1px solid rgba(255, 51, 68, 0.45)",
                color: "#ff3344",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Scrollable Telemetry Viewport */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: "rgba(255, 51, 68, 0.18)",
                border: "1px solid #ff3344",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "#fca5a5",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Zap size={16} color="#ff3344" />
              <span>{error}</span>
            </div>
          )}

          {/* Hologram Telemetry Grid */}
          {stats ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px"
                }}
              >
                {/* CPU Core Card */}
                <div
                  className="hud-panel"
                  style={{
                    padding: "18px",
                    background: "rgba(32, 14, 4, 0.65)",
                    border: "1px solid rgba(255, 136, 0, 0.4)",
                    boxShadow: "0 0 20px rgba(255, 119, 0, 0.12)"
                  }}
                >
                  <div className="hud-corner hud-corner-tl" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-br" style={{ borderColor: "#ff7700" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Cpu size={18} color="#ff8c00" />
                      <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "1.5px", color: "#ffa600" }}>
                        CPU NEURAL MATRIX
                      </span>
                    </div>
                    <span
                      className="hud-text-glow"
                      style={{
                        fontSize: "22px",
                        fontWeight: "900",
                        color: stats.cpu?.usage > 80 ? "#ff3344" : "#ff8c00"
                      }}
                    >
                      {stats.cpu?.usage}%
                    </span>
                  </div>

                  {/* Holographic Glowing Gauge */}
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(255, 119, 0, 0.15)",
                      borderRadius: "3px",
                      overflow: "hidden",
                      marginBottom: "14px",
                      boxShadow: "inset 0 0 6px rgba(255, 119, 0, 0.25)"
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(stats.cpu?.usage || 0, 100)}%`,
                        height: "100%",
                        background: stats.cpu?.usage > 80
                          ? "linear-gradient(90deg, #ff3344, #ff6b7d)"
                          : "linear-gradient(90deg, #ff5500, #ffa600)",
                        boxShadow: "0 0 10px #ff7700",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>

                  <div style={{ fontSize: "12px", color: "#fed7aa", lineHeight: "1.7" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#fb923c" }}>PROCESSOR:</strong> {stats.cpu?.brand || stats.cpu?.manufacturer || "ARCH-64"}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#fb923c" }}>CORES:</strong> {stats.cpu?.cores} Logical ({stats.cpu?.physicalCores} Physical) • {stats.cpu?.speed} GHz
                    </p>
                  </div>
                </div>

                {/* RAM Matrix Card */}
                <div
                  className="hud-panel"
                  style={{
                    padding: "18px",
                    background: "rgba(32, 14, 4, 0.65)",
                    border: "1px solid rgba(255, 136, 0, 0.4)",
                    boxShadow: "0 0 20px rgba(255, 119, 0, 0.12)"
                  }}
                >
                  <div className="hud-corner hud-corner-tl" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-br" style={{ borderColor: "#ff7700" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <HardDrive size={18} color="#f59e0b" />
                      <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "1.5px", color: "#f59e0b" }}>
                        MEMORY ALLOCATION
                      </span>
                    </div>
                    <span
                      className="hud-text-glow"
                      style={{
                        fontSize: "22px",
                        fontWeight: "900",
                        color: stats.memory?.usage > 85 ? "#ff3344" : "#f59e0b"
                      }}
                    >
                      {stats.memory?.usage}%
                    </span>
                  </div>

                  {/* Gauge */}
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "rgba(245, 158, 11, 0.15)",
                      borderRadius: "3px",
                      overflow: "hidden",
                      marginBottom: "14px",
                      boxShadow: "inset 0 0 6px rgba(245, 158, 11, 0.25)"
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(stats.memory?.usage || 0, 100)}%`,
                        height: "100%",
                        background: stats.memory?.usage > 85
                          ? "linear-gradient(90deg, #ff3344, #ff6b7d)"
                          : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                        boxShadow: "0 0 10px #f59e0b",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>

                  <div style={{ fontSize: "12px", color: "#fed7aa", lineHeight: "1.7" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#fb923c" }}>CONSUMED:</strong> {stats.memory?.usedGB} GB / {stats.memory?.totalGB} GB
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#fb923c" }}>AVAILABLE:</strong> {stats.memory?.freeGB} GB
                    </p>
                  </div>
                </div>

                {/* Arc Power / GPU Card */}
                <div
                  className="hud-panel"
                  style={{
                    padding: "18px",
                    background: "rgba(32, 14, 4, 0.65)",
                    border: "1px solid rgba(255, 136, 0, 0.4)",
                    boxShadow: "0 0 20px rgba(255, 119, 0, 0.12)"
                  }}
                >
                  <div className="hud-corner hud-corner-tl" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-br" style={{ borderColor: "#ff7700" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {stats.battery?.charging ? <BatteryCharging size={18} color="#22c55e" /> : <Battery size={18} color="#22c55e" />}
                      <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "1.5px", color: "#22c55e" }}>
                        ARC POWER & GPU
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#22c55e",
                        textShadow: "0 0 10px rgba(34, 197, 94, 0.6)"
                      }}
                    >
                      {stats.battery?.hasBattery ? `${stats.battery.percent}%` : "AC ACTIVE"}
                    </span>
                  </div>

                  {/* Battery Bar */}
                  {stats.battery?.hasBattery && (
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        background: "rgba(34, 197, 94, 0.15)",
                        borderRadius: "3px",
                        overflow: "hidden",
                        marginBottom: "14px"
                      }}
                    >
                      <div
                        style={{
                          width: `${stats.battery.percent}%`,
                          height: "100%",
                          background: stats.battery.percent < 20
                            ? "#ff3344"
                            : "linear-gradient(90deg, #22c55e, #86efac)",
                          boxShadow: "0 0 10px #22c55e",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                  )}

                  <div style={{ fontSize: "12px", color: "#fed7aa", lineHeight: "1.7" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#fb923c" }}>STATE:</strong>{" "}
                      {stats.battery?.hasBattery
                        ? (stats.battery.charging ? "⚡ ARC INJECTION (CHARGING)" : "🔋 DISCHARGING")
                        : "DIRECT GRID POWER FEED"}
                    </p>
                    {stats.gpu?.controllers?.length > 0 && (
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: "#fb923c" }}>GPU:</strong> {stats.gpu.controllers[0].model || "Radeon Core"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tactical Process Stream Table */}
              {stats.processes?.list && (
                <div
                  className="hud-panel"
                  style={{
                    padding: "18px",
                    background: "rgba(32, 14, 4, 0.65)",
                    border: "1px solid rgba(255, 136, 0, 0.4)",
                    boxShadow: "0 0 20px rgba(255, 119, 0, 0.12)"
                  }}
                >
                  <div className="hud-corner hud-corner-tl" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-tr" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-bl" style={{ borderColor: "#ff7700" }} />
                  <div className="hud-corner hud-corner-br" style={{ borderColor: "#ff7700" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                      borderBottom: "1px solid rgba(255, 136, 0, 0.25)",
                      paddingBottom: "8px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Layers size={17} color="#fbbf24" />
                      <span
                        className="hud-gold-glow"
                        style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "1.5px", color: "#fbbf24" }}
                      >
                        TACTICAL PROCESS THREADS
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "rgba(255, 170, 80, 0.8)", letterSpacing: "1px" }}>
                      ACTIVE THREADS: {stats.processes.total} // RUNNING: {stats.processes.running}
                    </span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        textAlign: "left",
                        fontSize: "12px",
                        borderCollapse: "collapse",
                        letterSpacing: "0.5px"
                      }}
                    >
                      <thead>
                        <tr style={{ color: "rgba(255, 170, 80, 0.75)", borderBottom: "1px solid rgba(255, 136, 0, 0.2)" }}>
                          <th style={{ padding: "8px 6px" }}>PID</th>
                          <th style={{ padding: "8px 6px" }}>MODULE NAME</th>
                          <th style={{ padding: "8px 6px" }}>CPU ALLOCATION</th>
                          <th style={{ padding: "8px 6px" }}>RAM FOOTPRINT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.processes.list.slice(0, 6).map((proc) => (
                          <tr
                            key={proc.pid}
                            style={{
                              borderBottom: "1px solid rgba(255, 136, 0, 0.08)",
                              transition: "background 0.2s ease"
                            }}
                          >
                            <td style={{ padding: "8px 6px", color: "#fb923c", fontFamily: "Consolas, monospace" }}>
                              #{proc.pid}
                            </td>
                            <td style={{ padding: "8px 6px", fontWeight: "600", color: "#ffedd5" }}>
                              {proc.name}
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              <span
                                style={{
                                  color: proc.cpu > 20 ? "#ff3344" : "#ff9900",
                                  fontWeight: "700"
                                }}
                              >
                                {proc.cpu?.toFixed(1)}%
                              </span>
                            </td>
                            <td style={{ padding: "8px 6px", color: "#fed7aa" }}>
                              {proc.memory?.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#ff8c00" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 16px auto",
                  borderRadius: "50%",
                  border: "2px dashed #ff7700",
                  animation: "arcPulseOrange 2s infinite linear"
                }}
              />
              <p style={{ letterSpacing: "2px", fontSize: "14px", fontWeight: "700" }}>
                INITIALIZING E.V NEURAL CORE...
              </p>
            </div>
          )}
        </div>

        {/* HUD Bottom Status Ticker */}
        <div
          style={{
            padding: "8px 18px",
            borderTop: "1px solid rgba(255, 136, 0, 0.2)",
            background: "rgba(255, 119, 0, 0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "10px",
            letterSpacing: "1px",
            color: "rgba(255, 170, 80, 0.7)"
          }}
        >
          <span>E.V TACTICAL INTELLIGENCE // READY</span>
          <span>LATENCY: &lt;1ms // NEURAL LINK STABLE</span>
        </div>
      </div>
    </div>
  );
}

export default App;
