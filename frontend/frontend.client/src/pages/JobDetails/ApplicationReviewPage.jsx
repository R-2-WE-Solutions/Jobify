import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api/api";

export default function ApplicationReviewPage() {
    const { applicationId } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);
    const [webcamConsent, setWebcamConsent] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await api.get(`/api/Applications/${applicationId}`);
            setData(res.data);
            setLoading(false);
        })();
    }, [applicationId]);

    if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
    if (!data) return <div style={{ padding: 20 }}>Not found</div>;

    const hasAssessment = data.hasAssessment;

    const start = async () => {
        const res = await api.post(`/api/Applications/${applicationId}/assessment/start`, {
            webcamConsent,
        });
        nav(`/application/${applicationId}/assessment`);
    };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
            <h1>Review Application</h1>

            <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, marginTop: 12 }}>
                <div><b>Status:</b> {data.status}</div>
                <div><b>Opportunity:</b> {data.opportunityTitle} — {data.companyName}</div>
            </div>

            {!hasAssessment ? (
                <div style={{ marginTop: 16 }}>
                    <p>This opportunity has no assessment.</p>
                    <Link to="/">Back</Link>
                </div>
            ) : (
                <div style={{ marginTop: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
                    <h3>Assessment</h3>
                    <p>You’ll answer MCQs + solve coding task(s). Time limit is enforced by the backend.</p>

                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="checkbox"
                            checked={webcamConsent}
                            onChange={(e) => setWebcamConsent(e.target.checked)}
                        />
                        I consent to webcam snapshots every 2–3 minutes (optional)
                    </label>

                    <button onClick={start} style={{ marginTop: 12, padding: "10px 14px" }}>
                        Start Assessment
                    </button>
                </div>
            )}
        </div>
    );
}
