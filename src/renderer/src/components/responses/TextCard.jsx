function TextCard({ data }) {
    return (
        <div className="response-card">
            <div className="card-title">
                EV
            </div>

            <div className="text-response">
                {data}
            </div>
        </div>
    );
}

export default TextCard;