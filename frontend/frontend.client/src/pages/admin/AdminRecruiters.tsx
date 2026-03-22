import { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Clock, Mail, Search } from "lucide-react";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
  lastUpdated: string;
  status: "pending_verification" | "pending_approval" | "verified" | "rejected";
}

// Recruiter Status Mapper 
function mapStatus(status: string) {
  switch(status) {
    case "EmailPending":
      return "pending_verification";
    case "Pending":
      return "pending_approval";
    case "Verified":
      return "verified";
    case "Rejected":
      return "rejected";
    default:
      return "pending_verification";
  }
};


export default function AdminRecruiters() {
  // Recruiters
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending_verification" | "pending_approval" | "verified" | "rejected">("pending_verification");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Recruiters Fetching
  async function fetchRecruiters() {
    try {
      setLoadingRecruiters(true);

      const token = localStorage.getItem("jobify_item");

      const res = await fetch("http://localhost:5159/api/users/by-role/recruiter" , {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      const mapped = data.map((r: any) => ({
        id: r.id,
        name: r.fullName,
        email: r.email,
        company: r.companyName,
        createdAt: r.createdAt.split("T")[0],
        lastUpdated: r.updatedAt.split("T")[0],
        status: r.status
      }));

      setRecruiters(mapped);
    }
    catch (err) {
      console.error("Error in Fetching Recruiters: ", err)
    }
    finally {
      setLoadingRecruiters(false);
    }
  }

  useEffect(() => {
    fetchRecruiters();
  }, []);

  // Approve handler
  const handleApprove = async (recruiterId: string) => {
    try {
      const token = localStorage.getItem("jobify_token");

      await fetch(`http://localhost:5159/api/auth/admin/approve-recruiter/${recruiterId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      fetchRecruiters();

      alert("Recruiter Approved Successfully!");
    }
    catch (err) {
      console.error("Error in Approving Recruiter: ", err);
    }
  };


  // Reject handler
  const handleReject = async (recruiterId: string) => {
    try {
      const token = localStorage.getItem("jobify_token");

      await fetch(`http://localhost:5159/api/auth/admin/reject-recruiter/${recruiterId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      fetchRecruiters();

      alert("Recruiter Rejected Successfully.");
    }
    catch (err) {
      console.error("Error in Rejecting Recruiter: ", err);
    }

  };


  // Filtered Recruiters
  const filteredRecruiters = recruiters.filter((recruiter) => {
    const matchesSearch =
      recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruiter.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = recruiter.status === activeTab;

    return matchesSearch && matchesTab;
  });


  // Status Counts
  const pendingVerificationCount = recruiters.filter((r) => r.status === "pending_verification").length;
  const pendingApprovalCount = recruiters.filter((r) => r.status === "pending_approval").length;
  const verifiedCount = recruiters.filter((r) => r.status === "verified").length;
  const rejectedCount = recruiters.filter((r) => r.status === "rejected").length;


  // Initials
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("");
  };


  // Tabs
  const tabs = [
    { value: "pending_verification", label: "Waiting for Email", icon: Mail, count: pendingVerificationCount, color: "#ea580c" },
    { value: "pending_approval", label: "Waiting for Approval", icon: Clock, count: pendingApprovalCount, color: "#3b82f6" },
    { value: "verified", label: "Verified", icon: CheckCircle, count: verifiedCount, color: "#16a34a" },
    { value: "rejected", label: "Rejected", icon: XCircle, count: rejectedCount, color: "#dc2626" }
  ];


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
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Recruiters</h1>
        <p style={{ fontSize: "16px", opacity: 0.9 }}>Manage recruiter accounts and approvals</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: "#ffedd5", padding: "12px", borderRadius: "8px" }}>
              <Mail style={{ width: "24px", height: "24px", color: "#ea580c" }} />
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Pending Verification</p>
              <p style={{ fontSize: "28px", fontWeight: "700" }}>{pendingVerificationCount}</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: "#dbeafe", padding: "12px", borderRadius: "8px" }}>
              <Clock style={{ width: "24px", height: "24px", color: "#3b82f6" }} />
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Pending Approval</p>
              <p style={{ fontSize: "28px", fontWeight: "700" }}>{pendingApprovalCount}</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: "#dcfce7", padding: "12px", borderRadius: "8px" }}>
              <CheckCircle style={{ width: "24px", height: "24px", color: "#16a34a" }} />
            </div>
            <div>
              <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Verified</p>
              <p style={{ fontSize: "28px", fontWeight: "700" }}>{verifiedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Management Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Recruiter Management</h2>

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
            placeholder="Search by name, email, or company..."
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "2px solid #f3f4f6" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "transparent",
                  color: isActive ? "#3b82f6" : "#6b7280",
                  border: "none",
                  borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                  marginBottom: "-2px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#6b7280";
                }}
              >
                <Icon style={{ width: "16px", height: "16px" }} />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      backgroundColor: isActive ? "#dbeafe" : "#f3f4f6",
                      color: isActive ? "#1e40af" : "#6b7280",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recruiters Table */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Recruiter
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Email
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Company
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Created At
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Last Updated
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    No recruiters found
                  </td>
                </tr>
              ) : (
                filteredRecruiters.map((recruiter) => (
                  <tr
                    key={recruiter.id}
                    onMouseEnter={() => setHoveredRow(recruiter.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: hoveredRow === recruiter.id ? "#f9fafb" : "white",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#16a34a",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          {getInitials(recruiter.name)}
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>{recruiter.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {recruiter.email}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6" }}>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        {recruiter.company}
                      </span>
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {recruiter.createdAt}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {recruiter.lastUpdated}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        {activeTab === "pending_verification" && (
                          <button
                            disabled
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#f3f4f6",
                              color: "#9ca3af",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              opacity: 0.6,
                            }}
                          >
                            <Mail style={{ width: "14px", height: "14px" }} />
                            Waiting
                          </button>
                        )}
                        {activeTab === "pending_approval" && (
                          <>
                            <button
                              onClick={() => handleReject(recruiter.id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "white",
                                color: "#dc2626",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#fee2e2";
                                e.currentTarget.style.borderColor = "#dc2626";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = "#d1d5db";
                              }}
                            >
                              <XCircle style={{ width: "14px", height: "14px" }} />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(recruiter.id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#16a34a",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
                            >
                              <CheckCircle style={{ width: "14px", height: "14px" }} />
                              Approve
                            </button>
                          </>
                        )}
                        {activeTab === "verified" && (
                          <button
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "white",
                              color: "#374151",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                          >
                            <Eye style={{ width: "14px", height: "14px" }} />
                            View Profile
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
