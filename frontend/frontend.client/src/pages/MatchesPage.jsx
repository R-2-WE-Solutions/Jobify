import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ListChecks, Calendar, FileText } from "lucide-react";
import matches from "./data/MatchesData";
import { MatchesTabs } from "./components/matches/MatchesTabs";
import "./styles/matches.css";
import { api } from "../api/api";
import CvReviewPage from "./components/matches/CvReviewPage";

// Normalize backend status into student-facing pipeline status
function normalizeApplicationStatus(status) {
    switch (status) {
        case "Draft":
            return "Draft";

        case "Pending":
        case "Submitted":
            return "Pending";

        case "InReview":
        case "AssessmentSent":
        case "InAssessment":
        case "AssessmentSubmitted":
        case "InterviewScheduled":
            return "In Review";

        case "Shortlisted":
            return "Shortlisted";

        case "Accepted":
            return "Accepted";

        case "Rejected":
            return "Rejected";

        case "Withdrawn":
            return "Withdrawn";

        default:
            return "Pending";
    }
}

function getApplicationStep(status) {
    switch (status) {
        case "Draft":
            return 1;
        case "Pending":
            return 2;
        case "In Review":
            return 3;
        case "Shortlisted":
            return 4;
        case "Accepted":
        case "Rejected":
            return 5;
        default:
            return 2;
    }
}

function getFinalDecisionLabel(status) {
    if (status === "Accepted") return "Accepted";
    if (status === "Rejected") return "Rejected";
    return null;
}

function formatAppliedDate(createdAtUtc) {
    if (!createdAtUtc) return "Applied Recently";

    const date = new Date(createdAtUtc);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Applied Today";
    if (days === 1) return "Applied 1 Day ago";
    if (days < 7) return `Applied ${days} Days ago`;

    const weeks = Math.floor(days / 7);
    if (weeks === 1) return "Applied 1 Week ago";

    return `Applied ${weeks} Weeks ago`;
}

function formatDeadline(deadlineUtc) {
    if (!deadlineUtc) return "No Deadline";

    const deadline = new Date(deadlineUtc);
    const diff = deadline.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "Closed";
    if (days === 0) return "Closing Today";
    if (days === 1) return "1 Day Left";

    return `${days} Left`;
}

function formatLocation(opportunity) {
    if (opportunity.isRemote) return "Remote";
    if (opportunity.workMode === "Hybrid") return "Hybrid";

    let location = "On-site";

    if (opportunity.location) {
        location = `On-site at ${opportunity.location}`;
    }

    return location;
}

function getLogoColor(name) {
    const colors = [
        "blue",
        "green",
        "purple",
        "pink",
        "indigo",
        "magenta",
        "navy",
        "black",
    ];

    name = String(name || "").trim();
    if (!name) return "blue";

    const n = name.split("").reduce((total, c) => total + c.charCodeAt(0), 0);
    return colors[n % colors.length];
}

function canWithdrawApplication(rawStatus) {
    return !["Withdrawn", "Accepted", "Rejected"].includes(rawStatus);
}

function getWithdrawWarning(rawStatus) {
    if (rawStatus === "Draft") {
        return "Are you sure you want to withdraw this application? You will still be able to reapply to this opportunity later.";
    }

    return "Are you sure you want to withdraw this application? If you continue, you will not be able to reapply to this opportunity.";
}

export default function MatchesPage() {
    const navigate = useNavigate();

    const tabs = [
        { key: "opportunities", label: "Opportunities", icon: Briefcase },
        { key: "applications", label: "Applications", icon: ListChecks },
        { key: "interviews", label: "Interviews", icon: Calendar },
        { key: "cv-review", label: "CV Review", icon: FileText },
    ];

    const [activeTab, setActiveTab] = useState("opportunities");

    const [opportunities, setOpportunities] = useState([]);
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
    const [opportunitiesError, setOpportunitiesError] = useState("");

    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState("");
    const [withdrawingId, setWithdrawingId] = useState(null);

    async function fetchOpportunities() {
        try {
            setOpportunitiesLoading(true);
            setOpportunitiesError("");

            const res = await api.get("/opportunities", {
                params: {
                    sort: "newest",
                    page: 1,
                    pageSize: 12,
                },
            });

            const data = Array.isArray(res.data?.items) ? res.data.items : [];
            setOpportunities(data);
        } catch (error) {
            console.error("Failed to fetch opportunities.", error);
            setOpportunities([]);
            setOpportunitiesError(
                error?.message || "Failed to fetch opportunities."
            );
        } finally {
            setOpportunitiesLoading(false);
        }
    }

    async function fetchApplications() {
        try {
            setApplicationsLoading(true);
            setApplicationsError("");

            const res = await api.get("/application/me");
            const data = Array.isArray(res.data) ? res.data : [];
            setApplications(data);
        } catch (error) {
            console.error("Failed to load applications.", error);
            setApplications([]);
            setApplicationsError(
                error?.message || "Failed to load applications."
            );
        } finally {
            setApplicationsLoading(false);
        }
    }

    async function handleWithdrawApplication(application) {
        if (!application?.id || !application?.canWithdraw || withdrawingId === application.id) {
            return;
        }

        const confirmed = window.confirm(application.withdrawWarning);
        if (!confirmed) return;

        try {
            setWithdrawingId(application.id);

            const res = await api.post(`/application/${application.id}/withdraw`);
            const canReapply = res?.data?.canReapply;

            await fetchApplications();

            if (canReapply === true) {
                window.alert("Application withdrawn successfully. You may reapply to this opportunity later.");
            } else if (canReapply === false) {
                window.alert("Application withdrawn successfully. You will not be able to reapply to this opportunity.");
            } else {
                window.alert("Application withdrawn successfully.");
            }
        } catch (error) {
            console.error("Failed to withdraw application.", error);
            window.alert(
                error?.response?.data ||
                error?.message ||
                "Failed to withdraw application."
            );
        } finally {
            setWithdrawingId(null);
        }
    }

    useEffect(() => {
        fetchOpportunities();
        fetchApplications();
    }, []);

    const mappedApplications = useMemo(() => {
        const mapped = applications.map((application) => {
            const normalizedStatus = normalizeApplicationStatus(application.status);
            const isDraftStage = application.status === "Draft";
            const canWithdraw = canWithdrawApplication(application.status);

            return {
                id: application.applicationId,
                type: "application",
                opportunityId: application.opportunityId,
                company: application.companyName,
                jobTitle: application.opportunityTitle,
                status: normalizedStatus,
                step: getApplicationStep(normalizedStatus),
                finalDecision: getFinalDecisionLabel(normalizedStatus),
                logoColor: getLogoColor(application.companyName),
                deadline: application.hasAssessment
                    ? "Assessment Available"
                    : formatAppliedDate(application.createdAtUtc),
                rawStatus: application.status,
                hasAssessment: application.hasAssessment,
                createdAtUtc: application.createdAtUtc,
                updatedAtUtc: application.updatedAtUtc,
                note: application.note ?? null,

                canWithdraw,
                isDraftStage,
                withdrawWarning: getWithdrawWarning(application.status),
                isWithdrawing: withdrawingId === application.applicationId,
            };
        });

        const dedupedMap = new Map();

        for (const app of mapped) {
            const key =
                app.opportunityId ??
                `${app.company}-${app.jobTitle}`.toLowerCase();

            const existing = dedupedMap.get(key);

            if (!existing) {
                dedupedMap.set(key, app);
                continue;
            }

            if (
                new Date(app.createdAtUtc || 0) >
                new Date(existing.createdAtUtc || 0)
            ) {
                dedupedMap.set(key, app);
                continue;
            }

            if (
                (app.step ?? 0) === (existing.step ?? 0) &&
                new Date(app.createdAtUtc || 0) > new Date(existing.createdAtUtc || 0)
            ) {
                dedupedMap.set(key, app);
            }
        }

        return Array.from(dedupedMap.values());
    }, [applications, withdrawingId]);

    const mappedOpportunities = useMemo(() => {
        return opportunities.map((opportunity) => {
            const matchedSkills = Array.isArray(opportunity.matchedSkills)
                ? opportunity.matchedSkills.map((skill) =>
                    String(skill).toLowerCase()
                )
                : [];

            const skills = Array.isArray(opportunity.skills)
                ? opportunity.skills.map((skill) => ({
                    name: skill,
                    matched: matchedSkills.includes(
                        String(skill).toLowerCase()
                    ),
                }))
                : [];

            return {
                id: opportunity.id,
                type: "opportunity",
                company: opportunity.companyName,
                jobTitle: opportunity.title,
                location: formatLocation(opportunity),
                status: "Saved",
                matchPercentage: Math.round(opportunity.matchPercentage ?? 0),
                logoColor: getLogoColor(opportunity.companyName),
                deadline: formatDeadline(opportunity.deadlineUtc),
                skills,
            };
        });
    }, [opportunities]);

    const mappedInterviews = useMemo(() => {
        return matches
            .filter((item) => item.status === "Interview")
            .map((item) => ({
                ...item,
                type: "interview",
                onPrepare: () => navigate(`/interviews/${item.id}/prepare`),
            }));
    }, [navigate]);

    const mappedMatches = useMemo(() => {
        return [...mappedOpportunities, ...mappedApplications, ...mappedInterviews];
    }, [mappedOpportunities, mappedApplications, mappedInterviews]);

    console.log("RAW APPLICATIONS:", applications);
    console.log("MAPPED APPLICATIONS:", mappedApplications);

    return (
        <div className="matches-page">
            <div className="matches-header">
                <h1 className="matches-title">Matches</h1>
                <p className="matches-subtitle">
                    Manage your job search pipeline.
                </p>
            </div>

            <div className="matches-tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`matches-tab ${active ? "active" : ""}`}
                        >
                            <Icon className="matches-tab-icon" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="matches-content">
                {activeTab === "cv-review" ? (
                    <CvReviewPage />
                ) : opportunitiesLoading || applicationsLoading ? (
                    <div className="matches-empty">Loading...</div>
                ) : opportunitiesError || applicationsError ? (
                    <div className="matches-empty">
                        {opportunitiesError || applicationsError}
                    </div>
                ) : (
                    <MatchesTabs
                        activeTab={activeTab}
                        matches={mappedMatches}
                        onPrepare={(item) => {
                            navigate(`/interviews/${item.id}/prepare`);
                        }}
                        onWithdrawApplication={handleWithdrawApplication}
                    />
                )}
            </div>
        </div>
    );
}