import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../layout/useTheme";
import "../styles/Reviewpage.css";

import { FileText, BadgeCheck, XCircle } from "lucide-react";

import { getProfile } from "../../api/profile";
import {
    getSkills,
    getEducation,
    getExperience,
    getProjects,
    getInterests,
} from "../../api/StudentData";

export default function ProfileReviewPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme(); // ✅ IMPORTANT

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [profileData, setProfileData] = useState(null);

    const [skills, setSkills] = useState([]);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);
    const [projects, setProjects] = useState([]);
    const [interests, setInterests] = useState([]);

    const [hasAssessment, setHasAssessment] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const [profRes, skillsRes, eduRes, expRes, projRes, intRes] =
                    await Promise.all([
                        getProfile(),
                        getSkills(),
                        getEducation(),
                        getExperience(),
                        getProjects(),
                        getInterests(),
                    ]);

                const token = localStorage.getItem("jobify_token");

                const appRes = await fetch(
                    `${import.meta.env.VITE_API_URL}/Application/${applicationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const appData = await appRes.json();

                if (!mounted) return;

                setProfileData(profRes);
                setSkills(Array.isArray(skillsRes) ? skillsRes : []);
                setEducation(Array.isArray(eduRes) ? eduRes : []);
                setExperience(Array.isArray(expRes) ? expRes : []);
                setProjects(Array.isArray(projRes) ? projRes : []);
                setInterests(Array.isArray(intRes) ? intRes : []);

                setHasAssessment(appData?.hasAssessment === true);
            } catch (e) {
                const msg =
                    e?.response?.data ||
                    e?.message ||
                    "Failed to load review data";

                if (mounted) setErr(String(msg));

                if (
                    String(msg).toLowerCase().includes("unauthorized") ||
                    String(msg).includes("401")
                ) {
                    navigate("/login");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [navigate, applicationId]);

    const p = profileData?.profile || {};
    const email = profileData?.email || p.email || "";

    const skillChips = useMemo(() => {
        return (skills || [])
            .map((s) => (typeof s === "string" ? s : s?.name))
            .filter(Boolean);
    }, [skills]);

    const startAssessment = () => {
        navigate(`/application/${applicationId}/assessment/rules`);
    };

    // ✅ LOADING
    if (loading) {
        return (
            <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
                <div className="reviewShell">Loading…</div>
            </div>
        );
    }

    // ✅ ERROR
    if (err) {
        return (
            <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
                <div className="reviewShell">{err}</div>
            </div>
        );
    }

    // ✅ MAIN
    return (
        <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
            <div className="reviewShell">

                <div className="reviewHeader">
                    <h1>Review Application</h1>
                </div>

                <section className="card">
                    <div className="cardTitle">Personal Information</div>

                    <div className="personalRow">
                        <div className="avatarWrap">
                            <div className="avatar">
                                {(p.fullName || "U")[0].toUpperCase()}
                            </div>
                        </div>

                        <div className="kvGrid">
                            <KV label="FULL NAME" value={p.fullName} />
                            <KV label="EMAIL" value={email} />
                            <KV label="PHONE" value={p.phone} />
                            <KV label="LOCATION" value={p.location} />
                        </div>
                    </div>
                </section>

                <section className="card">
                    <div className="cardTitle">Skills</div>

                    <div className="chips">
                        {skillChips.length ? (
                            skillChips.map((s, i) => (
                                <span key={i} className="chip">{s}</span>
                            ))
                        ) : (
                            <span className="muted">No skills</span>
                        )}
                    </div>
                </section>

                <section className="card">
                    <div className="cardTitle">Documents</div>

                    <DocRow
                        title="Resume"
                        subtitle={p.resumeFileName || "Missing"}
                        ok={!!p.hasResume}
                    />
                </section>

                <div className="bottomBar">
                    <div className="bottomInner">
                        <button className="btnOutline" onClick={() => navigate("/profile")}>
                            Edit Profile
                        </button>

                        <button className="btnPrimary" onClick={startAssessment}>
                            Continue →
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function KV({ label, value }) {
    return (
        <div className="kv">
            <div className="k">{label}</div>
            <div className="v">{value || "—"}</div>
        </div>
    );
}

function DocRow({ title, subtitle, ok }) {
    return (
        <div className="docRow">
            <div className="docLeft">
                <div className={`docIcon ${ok ? "ok" : "no"}`}>
                    {ok ? <BadgeCheck size={18} /> : <XCircle size={18} />}
                </div>

                <div>
                    <div className="docTitle">{title}</div>
                    <div className="docSub">{subtitle}</div>
                </div>
            </div>

            <div className={`badge ${ok ? "badgeOk" : "badgeNo"}`}>
                {ok ? "UPLOADED" : "MISSING"}
            </div>
        </div>
    );
}