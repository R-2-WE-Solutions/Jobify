import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { api } from "../../api/api";
import "../styles/JobDetailsPage.css";

export default function ApplicationResultPage() {
    const { applicationId } = useParams();
    const location = useLocation();

    const [data, setData] = useState(location.state || null);

    useEffect(() => {
        if (!data) {
            (async () => {
                const res = await api.get(`/api/Application/${applicationId}`);

                setData(
                    res.data?.attempt
                        ? {
                            finalScore: res.data.attempt.score,
                            flagged: res.data.attempt.flagged,
                            flagReason: res.data.attempt.flagReason,
                        }
                        : null
                );
            })();
        }
    }, [applicationId, data]);

    if (!data) {
        return (
            <div className="page">
                <main className="container">Loading…</main>
            </div>
        );
    }

    return (
        <div className="page">
            <main className="container">
                <h1 className="sectionTitle">Result</h1>

                <div className="card" style={{ marginTop: 16 }}>
                    <div><b>Final Score:</b> {data.finalScore ?? "—"}</div>
                    <div><b>Flagged:</b> {data.flagged ? "Yes" : "No"}</div>

                    {data.flagReason && (
                        <div><b>Reason:</b> {data.flagReason}</div>
                    )}
                </div>

                <div style={{ marginTop: 16 }}>
                    <Link to="/" className="btnOutline">
                        Back to opportunities
                    </Link>
                </div>
            </main>
        </div>
    );
}