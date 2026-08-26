function CpuCard({ data }) {
  const usage = data.usage

  return (
    <div className="response-card">
      <div className="card-title">CPU USAGE</div>

      <div className="cpu-value">{usage}%</div>

      <div className="cpu-bar">
        <div
          className="cpu-progress"
          style={{
            width: `${usage}%`
          }}
        />
      </div>

      <div className="cpu-status">{usage < 70 ? 'NORMAL' : 'HIGH USAGE'}</div>
    </div>
  )
}

export default CpuCard
