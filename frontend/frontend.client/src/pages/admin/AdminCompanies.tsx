import { useState } from "react";
import { Building2, Users, Eye, Search } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  recruiterCount: number;
  recruiters: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    status: string;
  }[];
}

const companies: Company[] = [
  {
    id: "COM001",
    name: "TechCorp Inc.",
    logo: "TC",
    description: "Leading technology solutions provider specializing in cloud computing and AI.",
    recruiterCount: 5,
    recruiters: [
      { id: "REC001", name: "James Anderson", email: "james@techcorp.com", joinedAt: "2025-01-15", status: "Active" },
      { id: "REC002", name: "Emily Davis", email: "emily@techcorp.com", joinedAt: "2025-02-20", status: "Active" },
      { id: "REC003", name: "Michael Brown", email: "michael@techcorp.com", joinedAt: "2025-03-01", status: "Active" },
    ],
  },
  {
    id: "COM002",
    name: "StartupHub",
    logo: "SH",
    description: "Innovative startup accelerator connecting talent with emerging companies.",
    recruiterCount: 3,
    recruiters: [
      { id: "REC004", name: "Lisa Wang", email: "lisa@startupHub.com", joinedAt: "2025-02-10", status: "Active" },
      { id: "REC005", name: "John Martinez", email: "john@startupHub.com", joinedAt: "2025-02-25", status: "Active" },
    ],
  },
  {
    id: "COM003",
    name: "CloudTech",
    logo: "CT",
    description: "Cloud infrastructure and DevOps solutions for modern enterprises.",
    recruiterCount: 4,
    recruiters: [
      { id: "REC006", name: "Robert Smith", email: "robert@cloudtech.io", joinedAt: "2025-01-20", status: "Active" },
      { id: "REC007", name: "Jessica Lee", email: "jessica@cloudtech.io", joinedAt: "2025-02-15", status: "Active" },
    ],
  },
  {
    id: "COM004",
    name: "DesignCo",
    logo: "DC",
    description: "Creative design agency crafting beautiful digital experiences.",
    recruiterCount: 2,
    recruiters: [
      { id: "REC008", name: "Maria Garcia", email: "maria@designco.com", joinedAt: "2025-02-01", status: "Active" },
    ],
  },
  {
    id: "COM005",
    name: "AI Labs",
    logo: "AL",
    description: "Cutting-edge artificial intelligence research and development company.",
    recruiterCount: 6,
    recruiters: [
      { id: "REC009", name: "David Kim", email: "david@aiLabs.com", joinedAt: "2025-01-10", status: "Active" },
      { id: "REC010", name: "Sarah Chen", email: "sarah@aiLabs.com", joinedAt: "2025-01-25", status: "Active" },
      { id: "REC011", name: "Thomas Wilson", email: "thomas@aiLabs.com", joinedAt: "2025-02-10", status: "Active" },
    ],
  },
  {
    id: "COM006",
    name: "WebSolutions",
    logo: "WS",
    description: "Full-stack web development and digital transformation consultancy.",
    recruiterCount: 3,
    recruiters: [
      { id: "REC012", name: "Sarah Thompson", email: "sarah@webSolutions.com", joinedAt: "2025-01-05", status: "Active" },
    ],
  },
];

export default function AdminCompanies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showRecruiters, setShowRecruiters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("");
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
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Companies</h1>
        <p style={{ fontSize: "16px", opacity: 0.9 }}>Manage companies and their recruiters</p>
      </div>

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
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 40px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "white",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
        />
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "48px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            textAlign: "center",
          }}
        >
          <Building2 style={{ width: "48px", height: "48px", color: "#d1d5db", margin: "0 auto 16px" }} />
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>No companies found</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredCompanies.map((company) => {
            const isHovered = hoveredCard === company.id;
            return (
              <div
                key={company.id}
                onMouseEnter={() => setHoveredCard(company.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: isHovered
                    ? "0 10px 25px rgba(0, 0, 0, 0.15)"
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "8px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    {company.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {company.name}
                    </h3>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: "#f3f4f6",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      <Users style={{ width: "12px", height: "12px" }} />
                      {company.recruiterCount} {company.recruiterCount === 1 ? "Recruiter" : "Recruiters"}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "16px",
                    lineHeight: "1.6",
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {company.description}
                </p>
                <button
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowRecruiters(true);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    backgroundColor: "white",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.color = "#3b82f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  <Eye style={{ width: "16px", height: "16px" }} />
                  View Recruiters
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruiters Modal/Overlay */}
      {showRecruiters && selectedCompany && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowRecruiters(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "18px",
                }}
              >
                {selectedCompany.logo}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
                  {selectedCompany.name}
                </h2>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  {selectedCompany.recruiterCount} {selectedCompany.recruiterCount === 1 ? "Recruiter" : "Recruiters"}
                </p>
              </div>
              <button
                onClick={() => setShowRecruiters(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              >
                Close
              </button>
            </div>

            {/* Recruiters Table */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                      Name
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                      Email
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                      Joined At
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCompany.recruiters.map((recruiter, index) => {
                    const initials = recruiter.name.split(" ").map((n) => n[0]).join("");
                    return (
                      <tr key={recruiter.id}>
                        <td style={{ padding: "16px", borderTop: index > 0 ? "1px solid #f3f4f6" : "none" }}>
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
                              {initials}
                            </div>
                            <span style={{ fontWeight: "600", fontSize: "14px" }}>{recruiter.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px", borderTop: index > 0 ? "1px solid #f3f4f6" : "none", color: "#6b7280", fontSize: "14px" }}>
                          {recruiter.email}
                        </td>
                        <td style={{ padding: "16px", borderTop: index > 0 ? "1px solid #f3f4f6" : "none", color: "#6b7280", fontSize: "14px" }}>
                          {recruiter.joinedAt}
                        </td>
                        <td style={{ padding: "16px", borderTop: index > 0 ? "1px solid #f3f4f6" : "none" }}>
                          <span
                            style={{
                              display: "inline-block",
                              backgroundColor: "#dcfce7",
                              color: "#166534",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {recruiter.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
