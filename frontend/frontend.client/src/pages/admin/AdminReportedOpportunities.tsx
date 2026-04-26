import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { api } from "../../api/api";
import { useTheme } from "../../layout/useTheme";

interface Opportunity {
    id?: number;
    opportunityId: number;
    opportunityTitle: string;
    company: string;
    reportsCount?: number;
    reportCount?: number;
}

interface Report {
    reportId: number;
    studentId: string;
    reason: string;
    details: string | null;
    createdAt: string;
    isResolved: boolean;
}

export default function AdminReportedOpportunities() {
    const theme: any = useTheme();
    const darkMode = theme && theme.darkMode ? true : false;

    const pageBg = darkMode ? "#0f172a" : "#f9fafb";
    const cardBg = darkMode ? "#111827" : "#ffffff";
    const mainText = darkMode ? "#f8fafc" : "#111827";
    const mutedText = darkMode ? "#94a3b8" : "#6b7280";
    const border = darkMode ? "#334155" : "#e5e7eb";
    const softBg = darkMode ? "#1f2937" : "#f9fafb";
    const selectedBg = darkMode ? "#1e3a8a" : "#eff6ff";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const [opportunitiesState, setOpportunitiesState] = useState<Opportunity[]>([]);
    const [loadingOpportunities, setLoadingOpportunities] = useState(false);

    const [reports, setReports] = useState<Report[]>([]);
    const [loadingReports, setLoadingReports] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    async function fetchReportedOpportunities() {
        try {
            setLoadingOpportunities(true);
            const res = await api.get("/opportunities/admin/reported-opportunities");
            setOpportunitiesState(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error in Fetching Reported Opportunities.", error);
        } finally {
            setLoadingOpportunities(false);
        }
    }

    async function fetchOpportunityReports(opportunityId: number) {
        try {
            setLoadingReports(true);
            const res = await api.get(`/opportunities/admin/get-reports/${opportunityId}`);
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error in Fetching Opportunity Reports.", error);
        } finally {
            setLoadingReports(false);
        }
    }

    async function resolveReport(reportId: number) {
        try {
            await api.patch(`/opportunities/admin/resolve-report/${reportId}`);
        } catch (error) {
            console.error("Error in Resolving Report.", error);
        }
    }

    const handleResolveReport = async (reportId: number) => {
        await resolveReport(reportId);

        if (selectedOpportunity) {
            await fetchOpportunityReports(selectedOpportunity.opportunityId);
        }
    };

    useEffect(() => {
        fetchReportedOpportunities();
    }, []);

    const filteredOpportunities = opportunitiesState.filter((opp) => {
        const title = opp.opportunityTitle ?? "";
        const company = opp.company ?? "";

        return (
            title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div
            className="admin-page"
            style={{
                padding: "24px",
                backgroundColor: pageBg,
                minHeight: "100vh",
                color: mainText,
            }}
        >
            <div className="admin-header">
                <h1>Reported Opportunities</h1>
                <p>View and manage opportunities reported by students</p>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: selectedOpportunity ? "0 0 400px" : "1", minWidth: "320px" }}>
                    <div
                        style={{
                            backgroundColor: cardBg,
                            borderRadius: "12px",
                            padding: "24px",
                            border: `1px solid ${border}`,
                            boxShadow: darkMode
                                ? "0 12px 30px rgba(0,0,0,0.35)"
                                : "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "20px",
                                fontWeight: "700",
                                marginBottom: "20px",
                                color: mainText,
                            }}
                        >
                            Reported Opportunities
                        </h2>

                        <div style={{ position: "relative", marginBottom: "24px" }}>
                            <Search
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "16px",
                                    height: "16px",
                                    color: mutedText,
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px 10px 40px",
                                    border: `1px solid ${border}`,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    background: darkMode ? "#0f172a" : "#ffffff",
                                    color: mainText,
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {loadingOpportunities ? (
                                <div
                                    style={{
                                        padding: "48px 24px",
                                        textAlign: "center",
                                        color: mutedText,
                                        fontSize: "14px",
                                    }}
                                >
                                    Loading reported opportunities...
                                </div>
                            ) : filteredOpportunities.length === 0 ? (
                                <div
                                    style={{
                                        padding: "48px 24px",
                                        textAlign: "center",
                                        color: mutedText,
                                        fontSize: "14px",
                                    }}
                                >
                                    No reported opportunities found
                                </div>
                            ) : (
                                filteredOpportunities.map((opportunity) => {
                                    const key = opportunity.opportunityId ?? opportunity.id ?? 0;
                                    const isSelected =
                                        selectedOpportunity?.opportunityId === opportunity.opportunityId;
                                    const isHovered = hoveredRow === key;
                                    const count =
                                        opportunity.reportsCount ?? opportunity.reportCount ?? 0;

                                    return (
                                        <div
                                            key={key}
                                            onClick={async () => {
                                                setSelectedOpportunity(opportunity);
                                                setSelectedReport(null);
                                                await fetchOpportunityReports(opportunity.opportunityId);
                                            }}
                                            onMouseEnter={() => setHoveredRow(key)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{
                                                padding: "16px",
                                                border: `1px solid ${isSelected ? "#3b82f6" : border}`,
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                backgroundColor: isSelected
                                                    ? selectedBg
                                                    : isHovered
                                                    ? softBg
                                                    : cardBg,
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        fontSize: "16px",
                                                        fontWeight: "600",
                                                        color: mainText,
                                                    }}
                                                >
                                                    {opportunity.opportunityTitle}
                                                </h3>

                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
                                                        color: darkMode ? "#fecaca" : "#991b1b",
                                                        padding: "4px 8px",
                                                        borderRadius: "6px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        flexShrink: 0,
                                                        marginLeft: "8px",
                                                    }}
                                                >
                                                    <AlertCircle style={{ width: "12px", height: "12px" }} />
                                                    {count}
                                                </span>
                                            </div>

                                            <p style={{ fontSize: "14px", color: mutedText }}>
                                                {opportunity.company}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {selectedOpportunity && (
                    <div style={{ flex: 1, minWidth: "320px" }}>
                        <div
                            style={{
                                backgroundColor: cardBg,
                                borderRadius: "12px",
                                padding: "24px",
                                border: `1px solid ${border}`,
                                boxShadow: darkMode
                                    ? "0 12px 30px rgba(0,0,0,0.35)"
                                    : "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div style={{ marginBottom: "24px" }}>
                                <h2
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "700",
                                        marginBottom: "8px",
                                        color: mainText,
                                    }}
                                >
                                    {selectedOpportunity.opportunityTitle}
                                </h2>
                                <p style={{ fontSize: "14px", color: mutedText }}>
                                    {selectedOpportunity.company}
                                </p>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {loadingReports ? (
                                    <div
                                        style={{
                                            padding: "48px 24px",
                                            textAlign: "center",
                                            color: mutedText,
                                            fontSize: "14px",
                                            backgroundColor: softBg,
                                            borderRadius: "8px",
                                        }}
                                    >
                                        Loading reports...
                                    </div>
                                ) : reports.length === 0 ? (
                                    <div
                                        style={{
                                            padding: "48px 24px",
                                            textAlign: "center",
                                            color: mutedText,
                                            fontSize: "14px",
                                            backgroundColor: softBg,
                                            borderRadius: "8px",
                                        }}
                                    >
                                        No reports found
                                    </div>
                                ) : (
                                    reports.map((report) => (
                                        <div
                                            key={report.reportId}
                                            onClick={() =>
                                                setSelectedReport((prev) =>
                                                    prev?.reportId === report.reportId ? null : report
                                                )
                                            }
                                            style={{
                                                border: `1px solid ${border}`,
                                                borderRadius: "8px",
                                                padding: "20px",
                                                opacity: report.isResolved ? 0.6 : 1,
                                                transition: "opacity 0.3s",
                                                cursor: "pointer",
                                                backgroundColor: cardBg,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    gap: "16px",
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                            marginBottom: "8px",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <h3
                                                            style={{
                                                                fontSize: "16px",
                                                                fontWeight: "600",
                                                                color: mainText,
                                                            }}
                                                        >
                                                            {report.reason}
                                                        </h3>

                                                        <code
                                                            style={{
                                                                backgroundColor: softBg,
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                fontFamily: "monospace",
                                                                color: mutedText,
                                                            }}
                                                        >
                                                            {report.studentId}
                                                        </code>
                                                    </div>

                                                    <p
                                                        style={{
                                                            fontSize: "14px",
                                                            color: darkMode ? "#cbd5e1" : "#374151",
                                                            lineHeight: "1.6",
                                                            marginBottom: "8px",
                                                        }}
                                                    >
                                                        {report.details || "No details provided."}
                                                    </p>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "12px",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <p style={{ fontSize: "12px", color: mutedText }}>
                                                            Reported on{" "}
                                                            {new Date(report.createdAt).toLocaleString()}
                                                        </p>

                                                        {report.isResolved && (
                                                            <span
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    gap: "4px",
                                                                    backgroundColor: darkMode
                                                                        ? "#14532d"
                                                                        : "#dcfce7",
                                                                    color: darkMode ? "#bbf7d0" : "#166534",
                                                                    padding: "2px 8px",
                                                                    borderRadius: "4px",
                                                                    fontSize: "12px",
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                <CheckCircle
                                                                    style={{ width: "12px", height: "12px" }}
                                                                />
                                                                Resolved
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleResolveReport(report.reportId);
                                                    }}
                                                    disabled={report.isResolved}
                                                    style={{
                                                        padding: "8px 16px",
                                                        backgroundColor: report.isResolved
                                                            ? softBg
                                                            : "#3b82f6",
                                                        color: report.isResolved ? mutedText : "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                        cursor: report.isResolved ? "not-allowed" : "pointer",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {report.isResolved ? "Resolved" : "Resolve"}
                                                </button>
                                            </div>

                                            {selectedReport?.reportId === report.reportId && (
                                                <div
                                                    style={{
                                                        marginTop: "12px",
                                                        border: `1px solid ${border}`,
                                                        borderRadius: "10px",
                                                        padding: "12px",
                                                        backgroundColor: softBg,
                                                    }}
                                                >
                                                    <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                                        <strong>Reason:</strong> {report.reason}
                                                    </p>
                                                    <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                                        <strong>Student ID:</strong> {report.studentId}
                                                    </p>
                                                    <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                                                        <strong>Details:</strong>{" "}
                                                        {report.details || "No details provided."}
                                                    </p>
                                                    <p style={{ fontSize: "12px", color: mutedText }}>
                                                        Reported on{" "}
                                                        {new Date(report.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}