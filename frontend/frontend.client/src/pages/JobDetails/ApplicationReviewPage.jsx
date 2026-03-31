import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../../api/api";
import "../styles/JobDetailsPage.css"; // reuse existing styling

export default function ApplicationReviewPage() {
    const { applicationId } = useParams();
    const nav = useNavigate();

    const [data, setData] = useState(null);
    const [webcamConsent, setWebcamConsent] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/api/Application/${applicationId}`);
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="page">
                <main className="container">Loading…</main>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="page">
                <main className="container">Not found</main>
            </div>
        );
    }

    const hasAssessment = data.hasAssessment;

    const start = async () => {
        await api.post(`/api/Application/${applicationId}/assessment/start`, {
            webcamConsent,
        });

        nav(`/application/${applicationId}/assessment`);
    };

    return (
        <div className="page">
            <main className="container">
                <h1 className="sectionTitle">Review Application</h1>

                <div className="card" style={{ marginTop: 16 }}>
                    <div><b>Status:</b> {data.status}</div>
                    <div><b>Opportunity:</b> {data.opportunityTitle} — {data.companyName}</div>
                </div>

                {!hasAssessment ? (
                    <div className="card" style={{ marginTop: 16 }}>
                        <p>This opportunity has no assessment.</p>
                        <Link to="/" className="btnOutline">Back</Link>
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 className="subHeader">Assessment</h3>

                        <p>
                            You’ll answer MCQs + solve coding task(s). Time limit is enforced by the backend.
                        </p>

                        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                            <input
                                type="checkbox"
                                checked={webcamConsent}
                                onChange={(e) => setWebcamConsent(e.target.checked)}
                            />
                            I consent to webcam snapshots every 2–3 minutes (optional)
                        </label>

                        <button className="btnPrimary" onClick={start} style={{ marginTop: 12 }}>
                            Start Assessment →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}