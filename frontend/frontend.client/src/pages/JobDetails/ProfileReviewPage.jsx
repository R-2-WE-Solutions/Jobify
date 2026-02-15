import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Reviewpage.css";

import { FileText, BadgeCheck, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfileReviewPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);

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

    const p = data?.profile || {};

    const chips = useMemo(() => {
        if (Array.isArray(p.skills) && p.skills.length) return p.skills;
        const guess = [];
        if (p.major) guess.push(p.major);
        if (p.university) guess.push(p.university);
        if (p.portfolioUrl) guess.push("Portfolio");
        return guess;
    }, [p.skills, p.major, p.university, p.portfolioUrl]);

    const startAssessment = () => {
        navigate(`/application/${applicationId}/assessment/rules`);
    };

    if (loading) return <div className="reviewPage"><div className="reviewShell">Loading…</div></div>;
    if (err) return <div className="reviewPage"><div className="reviewShell">{err}</div></div>;

    return (
        <div className="reviewPage">
            <div className="reviewShell">
                <div className="reviewHeader">
                    <h1>Review Application</h1>
                    <p></p>
                </div>

                <section className="card">
                    <div className="cardTitle">Personal Information</div>

                    <div className="personalRow">
                        <div className="avatarWrap" aria-hidden="true">
                            <div className="avatar">
                                {(p.fullName || "U").slice(0, 1).toUpperCase()}
                            </div>
                        </div>

                        <div className="kvGrid">
                            <div className="kv">
                                <div className="k">FULL NAME</div>
                                <div className="v">{p.fullName || "—"}</div>
                            </div>

                            <div className="kv">
                                <div className="k">EMAIL</div>
                                <div className="v">{p.email || p.userEmail || "—"}</div>
                            </div>

                            <div className="kv">
                                <div className="k">PHONE</div>
                                <div className="v">{p.phone || "—"}</div>
                            </div>

                            <div className="kv">
                                <div className="k">LOCATION</div>
                                <div className="v">{p.location || "—"}</div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="card">
                    <div className="cardTitle">Education & Skills</div>

                    <div className="eduBlock">
                        <div className="k">UNIVERSITY</div>
                        <div className="vBig">{p.university || "—"}</div>
                        <div className="muted">
                            {p.major ? `${p.major}` : "—"}
                            {p.gradYear ? ` • Graduated ${p.gradYear}` : ""}
                        </div>
                    </div>

                    <div className="spacer16" />

                    <div className="k">SKILLS</div>
                    <div className="chips">
                        {chips?.length ? (
                            chips.map((s, idx) => (
                                <span className="chip" key={`${s}-${idx}`}>{s}</span>
                            ))
                        ) : (
                            <span className="muted">—</span>
                        )}
                    </div>

                    <div className="detailGrid">
                        <Detail label="Education" value={p.educationText} />
                        <Detail label="Experience" value={p.experienceText} />
                        <Detail label="Projects" value={p.projectsText} />
                        <Detail label="Interests" value={p.interestsText} />
                        <Detail label="Certifications" value={p.certificationsText} />
                        <Detail label="Awards" value={p.awardsText} />
                    </div>
                </section>

                <section className="card">
                    <div className="cardTitle">Professional Summary</div>
                    <div className="summary">
                        {p.bio ? (
                            <div style={{ whiteSpace: "pre-wrap" }}>{p.bio}</div>
                        ) : (
                            <span className="muted">—</span>
                        )}
                    </div>
                </section>

                <section className="card">
                    <div className="cardTitle">Documents</div>

                    <DocRow
                        title="Resume/CV"
                        subtitle={p.resumeFileName || (p.hasResume ? "Uploaded" : "Missing")}
                        status={p.hasResume ? "UPLOADED" : "MISSING"}
                        ok={!!p.hasResume}
                    />

                    <DocRow
                        title="University Proof"
                        subtitle={p.universityProofName || (p.hasUniversityProof ? "Verified" : "Missing")}
                        status={p.hasUniversityProof ? "VERIFIED" : "MISSING"}
                        ok={!!p.hasUniversityProof}
                    />
                </section>

                <div className="bottomBar">
                    <div className="bottomInner">
                        <button className="btnOutline" onClick={() => navigate("/profile")}>
                            Edit Profile
                        </button>

                        <button className="btnPrimary" onClick={startAssessment}>
                            Continue to Assessment →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="detail">
            <div className="k">{label.toUpperCase()}</div>
            <div className="v">{value?.trim() ? value : "Not set"}</div>
        </div>
    );
}

function DocRow({ title, subtitle, status, ok }) {
    return (
        <div className="docRow">
            <div className="docLeft">
                <div className={`docIcon ${ok ? "ok" : "no"}`} aria-hidden="true">
                    {title.toLowerCase().includes("resume") ? (
                        <FileText size={18} />
                    ) : ok ? (
                        <BadgeCheck size={18} />
                    ) : (
                        <XCircle size={18} />
                    )}
                </div>

                <div>
                    <div className="docTitle">{title}</div>
                    <div className="docSub">{subtitle}</div>
                </div>
            </div>

            <div className={`badge ${ok ? "badgeOk" : "badgeNo"}`}>{status}</div>
        </div>
    );
}
