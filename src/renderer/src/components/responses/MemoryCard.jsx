function MemoryCard({ data }) {
    return (
        <div className="response-card">

            <div className="card-title">
                MEMORY
            </div>

            <div className="cpu-value">
                {data.usedGB} GB
            </div>

            <div className="memory-total">
                of {data.totalGB} GB
            </div>

            <div className="cpu-bar">
                <div
                    className="cpu-progress"
                    style={{
                        width: `${data.usage}%`
                    }}
                />
            </div>

            <div className="cpu-status">
                {data.usage}% USED
            </div>

        </div>
    );
}

export default MemoryCard;
