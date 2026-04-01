import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { api } from "../../api/api";


interface Report {
  id: string;
  studentName: string;
  studentId: string;
  comment: string;
  date: string;
  resolved: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  reportCount: number;
  reports: Report[];
}


export default function AdminReportedOpportunities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Opportunities
  const [opportunitiesState, setOpportunitiesState] = useState<any[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);

  // Reports
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);


  // Reported Opportunities Fetching
  async function fetchReportedOpportunities() {
    try {
        setLoadingOpportunities(true);

        const res = await api.get("api/opportunities/admin/reported-opportunities");

        setOpportunitiesState(res.data);
    }
    catch (error) {
        console.error("Error in Fetching Reported Opportunities.")
    }
    finally {
        setLoadingOpportunities(false);
    }
  }

  // Opportunity Reports Fetching
  async function fetchOpportunityReports(opportunityId: number) {
    try {
        setLoadingReports(true);

        const res = await api.get(`api/opportunities/admin/get-reports/${opportunityId}`);

        setReports(res.data);
    }
    catch (error) {
        console.error("Error in Fetching Opportunity Reports.")
    }
    finally {
        setLoadingReports(false);
    }
  }

  // Resolve Report
  async function resolveReport(reportId: number) {
    try {
        await api.patch(`api/opportunities/admin/resolve-report/${reportId}`);
    }
    catch (error) {
        console.error("Error in Resolving Report.")
    }
  }

  useEffect(() => {
    fetchReportedOpportunities();
  }, []);

  const filteredOpportunities = opportunitiesState.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResolveReport = (opportunityId: string, reportId: string) => {
    setOpportunitiesState((prev) =>
      prev.map((opp) => {
        if (opp.id === opportunityId) {
          return {
            ...opp,
            reports: opp.reports.map((report) =>
              report.id === reportId ? { ...report, resolved: true } : report
            ),
          };
        }
        return opp;
      })
    );

    if (selectedOpportunity && selectedOpportunity.id === opportunityId) {
      setSelectedOpportunity((prev) =>
        prev
          ? {
              ...prev,
              reports: prev.reports.map((report) =>
                report.id === reportId ? { ...report, resolved: true } : report
              ),
            }
          : null
      );
    }
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Blue Gradient Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Reported Opportunities</h1>
        <p style={{ fontSize: "16px", opacity: 0.9 }}>View and manage opportunities reported by students</p>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Opportunities List */}
        <div style={{ flex: selectedOpportunity ? "0 0 400px" : "1" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
              Reported Opportunities
            </h2>

            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "24px" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "16px",
                  color: "#9ca3af",
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
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
            </div>

            {/* Opportunities List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredOpportunities.length === 0 ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "14px",
                  }}
                >
                  No reported opportunities found
                </div>
              ) : (
                filteredOpportunities.map((opportunity) => {
                  const isSelected = selectedOpportunity?.id === opportunity.id;
                  const isHovered = hoveredRow === opportunity.id;
                  return (
                    <div
                      key={opportunity.id}
                      onClick={() => setSelectedOpportunity(opportunity)}
                      onMouseEnter={() => setHoveredRow(opportunity.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        padding: "16px",
                        border: `1px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#eff6ff" : isHovered ? "#f9fafb" : "white",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "600" }}>{opportunity.title}</h3>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            flexShrink: 0,
                            marginLeft: "8px",
                          }}
                        >
                          <AlertCircle style={{ width: "12px", height: "12px" }} />
                          {opportunity.reportCount}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#6b7280" }}>{opportunity.company}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Reports Section */}
        {selectedOpportunity && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                  {selectedOpportunity.title}
                </h2>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  {selectedOpportunity.company}
                </p>
              </div>

              {/* Reports List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {selectedOpportunity.reports.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "14px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    No reports found
                  </div>
                ) : (
                  selectedOpportunity.reports.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "20px",
                        opacity: report.resolved ? 0.5 : 1,
                        transition: "opacity 0.3s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                              {report.studentName}
                            </h3>
                            <code
                              style={{
                                backgroundColor: "#f3f4f6",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                color: "#6b7280",
                              }}
                            >
                              {report.studentId}
                            </code>
                          </div>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#374151",
                              lineHeight: "1.6",
                              marginBottom: "8px",
                            }}
                          >
                            {report.comment}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                              Reported on {report.date}
                            </p>
                            {report.resolved && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  backgroundColor: "#dcfce7",
                                  color: "#166534",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                <CheckCircle style={{ width: "12px", height: "12px" }} />
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveReport(selectedOpportunity.id, report.id)}
                          disabled={report.resolved}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: report.resolved ? "#f3f4f6" : "#3b82f6",
                            color: report.resolved ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: report.resolved ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            flexShrink: 0,
                            marginLeft: "16px",
                          }}
                          onMouseEnter={(e) => {
                            if (!report.resolved) {
                              e.currentTarget.style.backgroundColor = "#2563eb";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!report.resolved) {
                              e.currentTarget.style.backgroundColor = "#3b82f6";
                            }
                          }}
                        >
                          {report.resolved ? "Resolved" : "Resolve"}
                        </button>
                      </div>
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