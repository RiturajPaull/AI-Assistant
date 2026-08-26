function BatteryCard({ data }) {
  const percent = data?.percent ?? data?.percentage ?? 100
  const isDesktop = data?.hasBattery === false

  return (
    <div className="response-card">
      <div className="card-title">BATTERY</div>

      <div className="cpu-value">{isDesktop ? 'AC' : `${percent}%`}</div>

      <div className="cpu-status">
        {isDesktop ? 'PLUGGED IN (NO BATTERY)' : data?.charging ? 'CHARGING' : 'ON BATTERY'}
      </div>
    </div>
  )
}

export default BatteryCard
