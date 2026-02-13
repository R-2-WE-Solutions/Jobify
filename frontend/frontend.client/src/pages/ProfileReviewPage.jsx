import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./styles/Reviewpage.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfileReviewPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null); // { role, profile }

    useEffect(() => {
        const token = localStorage.getItem("jobify_token");
        if (!token) {
            navigate("/login");
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(`${API_URL}/api/profile`, {
                    signal: controller.signal,
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const t = await res.text().catch(() => "");
                    throw new Error(t || `Failed to load profile (${res.status})`);
                }

                const json = await res.json();
                setData(json);
            } catch (e) {
                if (e?.name !== "AbortError") setErr(e?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [navigate]);

    if (loading) return <div className="page"><main className="container">Loading…</main></div>;
    if (err) return <div className="page"><main className="container">{err}</main></div>;

    const p = data?.profile || {};

    return (
        <div className="reviewPage">
            <div className="reviewContainer">
                <div className="reviewCard">
                    <h1 className="reviewTitle">Review Your Profile</h1>
                    <p className="reviewSubtitle">
                        Application #{applicationId} — confirm your details before starting the assessment.
                    </p>

                    {/* Basic Info */}
                    <div className="reviewSection">
                        <h3>Basic Information</h3>
                        <div className="reviewGrid">
                            <div>
                                <div className="reviewLabel">Full Name</div>
                                <div className="reviewValue">{p.fullName || "—"}</div>
                            </div>
                            <div>
                                <div className="reviewLabel">University</div>
                                <div className="reviewValue">{p.university || "—"}</div>
                            </div>
                            <div>
                                <div className="reviewLabel">Major</div>
                                <div className="reviewValue">{p.major || "—"}</div>
                            </div>
                            <div>
                                <div className="reviewLabel">Portfolio</div>
                                <div className="reviewValue">{p.portfolioUrl || "—"}</div>
                            </div>
                        </div>
                    </div>

                    <hr className="reviewDivider" />

                    {/* Professional Summary */}
                    <div className="reviewSection">
                        <h3>Professional Summary</h3>
                        <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                            {p.bio || "—"}
                        </div>
                    </div>

                    <hr className="reviewDivider" />

                    {/* Professional Details */}
                    <div className="reviewSection">
                        <h3>Professional Details</h3>

                        <div className="reviewGrid">
                            <div>
                                <div className="reviewLabel">Education</div>
                                <div className="reviewValue">{p.educationText || "Not set"}</div>
                            </div>

                            <div>
                                <div className="reviewLabel">Experience</div>
                                <div className="reviewValue">{p.experienceText || "Not set"}</div>
                            </div>

                            <div>
                                <div className="reviewLabel">Projects</div>
                                <div className="reviewValue">{p.projectsText || "Not set"}</div>
                            </div>

                            <div>
                                <div className="reviewLabel">Interests</div>
                                <div className="reviewValue">{p.interestsText || "Not set"}</div>
                            </div>

                            <div>
                                <div className="reviewLabel">Certifications</div>
                                <div className="reviewValue">{p.certificationsText || "Not set"}</div>
                            </div>

                            <div>
                                <div className="reviewLabel">Awards</div>
                                <div className="reviewValue">{p.awardsText || "Not set"}</div>
                            </div>
                        </div>
                    </div>


                    <hr className="reviewDivider" />

                    {/* Documents */}
                    <div className="reviewSection">
                        <h3>Documents</h3>
                        <div className="reviewDocs">
                            <span className={`docBadge ${p.hasResume ? "docYes" : "docNo"}`}>
                                Resume {p.hasResume ? "Uploaded" : "Missing"}
                            </span>
                            <span className={`docBadge ${p.hasUniversityProof ? "docYes" : "docNo"}`}>
                                University Proof {p.hasUniversityProof ? "Uploaded" : "Missing"}
                            </span>
                        </div>
                    </div>

                    <div className="reviewActions">
                        <button className="btnOutline" onClick={() => navigate("/profile")}>
                            Edit Profile
                        </button>

                        <button
                            className="btnPrimary"
                            onClick={() => navigate(`/apply/${applicationId}/consent`)}
                        >
                            Continue to Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
