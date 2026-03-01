import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { api } from "../../api/api";

export default function ApplicationResultPage() {
    const { applicationId } = useParams();
    const location = useLocation();
    const [data, setData] = useState(location.state || null);

    useEffect(() => {
        if (!data) {
            (async () => {
                const res = await api.get(`/api/Application/${applicationId}`);
                setData(res.data?.attempt ? {
                    finalScore: res.data.attempt.score,
                    flagged: res.data.attempt.flagged,
                    flagReason: res.data.attempt.flagReason
                } : null);
            })();
        }
    }, [applicationId, data]);

    if (!data) return <div style={{ padding: 20 }}>Loading…</div>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
            <h1>Result</h1>
            <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
                <div><b>Final Score:</b> {data.finalScore ?? "—"}</div>
                <div><b>Flagged:</b> {data.flagged ? "Yes" : "No"}</div>
                {data.flagReason && <div><b>Reason:</b> {data.flagReason}</div>}
            </div>

            <div style={{ marginTop: 16 }}>
                <Link to="/">Back to opportunities</Link>
            </div>
        </div>
    );
}
