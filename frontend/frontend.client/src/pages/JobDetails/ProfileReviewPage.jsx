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
    const { darkMode } = useTheme();

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
                    String(msg).includes("401") ||
                    String(msg).toLowerCase().includes("no token")
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

    const experienceText = useMemo(() => {
        if (!experience?.length) return p.experienceText || "";

        return experience
            .map((e) => {
                const role = e?.role || "Role";
                const company = e?.company ? ` @ ${e.company}` : "";
                const duration = e?.duration ? `\n${e.duration}` : "";
                const desc = e?.description ? `\n${e.description}` : "";

                return `${role}${company}${duration}${desc}`.trim();
            })
            .join("\n\n");
    }, [experience, p.experienceText]);

    const projectsText = useMemo(() => {
        if (!projects?.length) return p.projectsText || "";

        return projects
            .map((pr) => {
                const title = pr?.title || "Project";
                const desc = pr?.description ? `\n${pr.description}` : "";
                const tech =
                    Array.isArray(pr?.techStack) && pr.techStack.length
                        ? `\nTech: ${pr.techStack.join(", ")}`
                        : "";
                const links = pr?.links ? `\nLink: ${pr.links}` : "";

                return `${title}${desc}${tech}${links}`.trim();
            })
            .join("\n\n");
    }, [projects, p.projectsText]);

    const interestsText = useMemo(() => {
        if (!interests?.length) return p.interestsText || "";

        return interests
            .map((i) => i?.interest)
            .filter(Boolean)
            .join(", ");
    }, [interests, p.interestsText]);

    const startAssessment = () => {
        navigate(`/application/${applicationId}/assessment/rules`);
    };

    if (loading) {
        return (
            <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
                <div className="reviewShell">Loading…</div>
            </div>
        );
    }

    if (err) {
        return (
            <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
                <div className="reviewShell">{err}</div>
            </div>
        );
    }

    return (
        <div className={`reviewPage ${darkMode ? "review-dark" : ""}`}>
            <div className="reviewShell">
                <div className="reviewHeader">
                    <h1>Review Application</h1>
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
                            <KV label="FULL NAME" value={p.fullName} />
                            <KV label="EMAIL" value={email} />
                            <KV label="PHONE" value={p.phone || p.phoneNumber} />
                            <KV label="LOCATION" value={p.location} />
                        </div>
                    </div>
                </section>

                <section className="card">
                    <div className="cardTitle">Education & Skills</div>

                    <div className="k">SKILLS</div>
                    <div className="chips">
                        {skillChips.length ? (
                            skillChips.map((s, i) => (
                                <span key={`${s}-${i}`} className="chip">
                                    {s}
                                </span>
                            ))
                        ) : (
                            <span className="muted">No skills</span>
                        )}
                    </div>

                    <div className="detailGrid">
                        <Detail label="Experience" value={experienceText} />
                        <Detail label="Projects" value={projectsText} />
                        <Detail label="Interests" value={interestsText} />
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
                        subtitle={
                            p.universityProofName ||
                            (p.hasUniversityProof ? "Verified" : "Missing")
                        }
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

function Detail({ label, value }) {
    return (
        <div className="detail">
            <div className="k">{label.toUpperCase()}</div>
            <div className="v" style={{ whiteSpace: "pre-wrap" }}>
                {value?.trim() ? value : "Not set"}
            </div>
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

            <div className={`badge ${ok ? "badgeOk" : "badgeNo"}`}>
                {status}
            </div>
        </div>
    );
}
