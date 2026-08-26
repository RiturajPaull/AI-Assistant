function ProcessCard({ data }) {
  return (
    <div className="response-card">
      <div className="card-title">TOP PROCESSES</div>

      <div className="process-list">
        {(data?.list || []).slice(0, 5).map((process) => (
          <div className="process-row" key={process.pid || process.name}>
            <span className="process-name">{process.name}</span>

            <span className="process-cpu">
              {typeof process.cpu === 'number' ? process.cpu.toFixed(1) : '0.0'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProcessCard
