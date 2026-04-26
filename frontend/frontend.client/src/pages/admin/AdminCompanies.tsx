import { useEffect, useState } from "react";
import { Building2, Users, Eye, Search } from "lucide-react";
import { useTheme } from "../../layout/useTheme";
import "../styles/admin.css";

type Company = {
    id: string;
    name: string;
    email: string;
    website?: string;
    linkedin?: string;
    instagram?: string;
    recruiterCount: number;
    status: string;
    recruiters: {
        id: string;
        email: string;
        joinedAt: string;
        status: string;
    }[];
};

export default function AdminCompanies() {
    const API_URL = import.meta.env.VITE_API_URL;

    const theme: any = useTheme();
    const darkMode = theme && theme.darkMode ? true : false;

    const pageBg = darkMode ? "#0f172a" : "#f9fafb";
    const cardBg = darkMode ? "#111827" : "#ffffff";
    const mainText = darkMode ? "#f8fafc" : "#111827";
    const mutedText = darkMode ? "#94a3b8" : "#6b7280";
    const border = darkMode ? "#334155" : "#e5e7eb";
    const inputBg = darkMode ? "#0f172a" : "#ffffff";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [showRecruiters, setShowRecruiters] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    async function fetchCompanies() {
        try {
            setLoadingCompanies(true);

            const token = localStorage.getItem("jobify_token");

            const res = await fetch(`${API_URL}/users/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error in Fetching Companies: ", err);
        } finally {
            setLoadingCompanies(false);
        }
    }

    useEffect(() => {
        fetchCompanies();
    }, []);

    const filteredCompanies = companies.filter((company) =>
        company.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLogo = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const getStatusStyle = (status: string) => {
        if (status === "Verified") {
            return {
                backgroundColor: darkMode ? "#14532d" : "#dcfce7",
                color: darkMode ? "#bbf7d0" : "#166534",
            };
        }

        if (status === "Pending") {
            return {
                backgroundColor: darkMode ? "#78350f" : "#fef3c7",
                color: darkMode ? "#fde68a" : "#92400e",
            };
        }

        return {
            backgroundColor: darkMode ? "#7f1d1d" : "#fee2e2",
            color: darkMode ? "#fecaca" : "#991b1b",
        };
    };

    if (loadingCompanies) {
        return (
            <div
                className="admin-page"
                style={{ background: pageBg, color: mainText }}
            >
                <p style={{ padding: "24px" }}>Loading companies...</p>
            </div>
        );
    }

    return (
        <div
            className="admin-page"
            style={{ background: pageBg, color: mainText }}
        >
            <div className="admin-header">
                <h1>Companies</h1>
                <p>Manage companies and their recruiters</p>
            </div>

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
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px 12px 10px 40px",
                        border: `1px solid ${border}`,
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: inputBg,
                        color: mainText,
                    }}
                />
            </div>

            {filteredCompanies.length === 0 ? (
                <div
                    style={{
                        backgroundColor: cardBg,
                        borderRadius: "12px",
                        padding: "48px",
                        border: `1px solid ${border}`,
                        boxShadow: darkMode
                            ? "0 12px 30px rgba(0,0,0,0.35)"
                            : "0 2px 8px rgba(0,0,0,0.08)",
                        textAlign: "center",
                    }}
                >
                    <Building2
                        style={{
                            width: "48px",
                            height: "48px",
                            color: mutedText,
                            margin: "0 auto 16px",
                        }}
                    />
                    <p style={{ color: mutedText, fontSize: "14px" }}>
                        No companies found
                    </p>
                </div>
            ) : (
                <div className="admin-companies-grid">
                    {filteredCompanies.map((company) => {
                        const isHovered = hoveredCard === company.id;

                        return (
                            <div
                                key={company.id}
                                onMouseEnter={() => setHoveredCard(company.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className="admin-company-card"
                                style={{
                                    backgroundColor: cardBg,
                                    color: mainText,
                                    border: `1px solid ${border}`,
                                    boxShadow: isHovered
                                        ? darkMode
                                            ? "0 18px 36px rgba(0,0,0,0.45)"
                                            : "0 10px 25px rgba(0,0,0,0.15)"
                                        : darkMode
                                            ? "0 12px 30px rgba(0,0,0,0.35)"
                                            : "0 2px 8px rgba(0,0,0,0.08)",
                                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                                }}
                            >
                                <div className="admin-company-top">
                                    <div className="admin-company-logo">
                                        {getLogo(company.name)}
                                    </div>

                                    <div className="admin-company-main">
                                        <h3
                                            className="admin-company-name"
                                            style={{ color: mainText }}
                                        >
                                            {company.name}
                                        </h3>

                                        <span
                                            className="admin-company-count"
                                            style={{ color: mutedText }}
                                        >
                                            <Users style={{ width: "12px", height: "12px" }} />
                                            {company.recruiterCount}{" "}
                                            {company.recruiterCount === 1
                                                ? "Recruiter"
                                                : "Recruiters"}
                                        </span>

                                        <span
                                            className="admin-company-status"
                                            style={getStatusStyle(company.status)}
                                        >
                                            {company.status}
                                        </span>
                                    </div>
                                </div>

                                <p
                                    className="admin-company-email"
                                    style={{ color: mutedText }}
                                >
                                    {company.email}
                                </p>

                                <div className="admin-company-links">
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noreferrer">
                                            🌐
                                        </a>
                                    )}
                                    {company.linkedin && (
                                        <a href={company.linkedin} target="_blank" rel="noreferrer">
                                            💼
                                        </a>
                                    )}
                                    {company.instagram && (
                                        <a href={company.instagram} target="_blank" rel="noreferrer">
                                            📷
                                        </a>
                                    )}
                                </div>

                                <button className="admin-company-btn"
                                    onClick={() => {
                                        setSelectedCompany(company);
                                        setShowRecruiters(true);
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

            {showRecruiters && selectedCompany && (
                <div
                    className="admin-company-modal-overlay"
                    onClick={() => setShowRecruiters(false)}
                >
                    <div
                        className="admin-company-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: cardBg,
                            color: mainText,
                            border: `1px solid ${border}`,
                        }}
                    >
                        <div className="admin-company-modal-header">
                            <div className="admin-company-modal-brand">
                                <div className="admin-company-modal-logo">
                                    {getLogo(selectedCompany.name)}
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <h2
                                        className="admin-company-modal-title"
                                        style={{ color: mainText }}
                                    >
                                        {selectedCompany.name}
                                    </h2>
                                    <p
                                        className="admin-company-modal-subtitle"
                                        style={{ color: mutedText }}
                                    >
                                        {selectedCompany.recruiterCount}{" "}
                                        {selectedCompany.recruiterCount === 1
                                            ? "Recruiter"
                                            : "Recruiters"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowRecruiters(false)}
                                className="admin-company-modal-close"
                            >
                                Close
                            </button>
                        </div>

                        {selectedCompany.recruiters.length === 0 ? (
                            <div
                                className="admin-company-empty"
                                style={{
                                    backgroundColor: cardBg,
                                    color: mutedText,
                                    border: `1px solid ${border}`,
                                }}
                            >
                                No recruiters found
                            </div>
                        ) : (
                            <div className="admin-company-table-wrap">
                                <table className="admin-company-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Joined At</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {selectedCompany.recruiters.map((recruiter, index) => {
                                            const initials =
                                                recruiter.email?.charAt(0).toUpperCase() || "?";

                                            return (
                                                <tr key={recruiter.id}>
                                                    <td
                                                        style={{
                                                            borderTop:
                                                                index > 0
                                                                    ? `1px solid ${border}`
                                                                    : "none",
                                                        }}
                                                    >
                                                        <div className="admin-company-recruiter-cell">
                                                            <div className="admin-company-recruiter-avatar">
                                                                {initials}
                                                            </div>

                                                            <div className="admin-company-recruiter-info">
                                                                <span
                                                                    className="admin-company-recruiter-name"
                                                                    style={{ color: mainText }}
                                                                >
                                                                    {recruiter.email.split("@")[0]}
                                                                </span>
                                                                <span
                                                                    className="admin-company-recruiter-email"
                                                                    style={{ color: mutedText }}
                                                                >
                                                                    {recruiter.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td
                                                        style={{
                                                            borderTop:
                                                                index > 0
                                                                    ? `1px solid ${border}`
                                                                    : "none",
                                                        }}
                                                        className="admin-company-joined"
                                                    >
                                                        {new Date(recruiter.joinedAt).toLocaleDateString()}
                                                    </td>

                                                    <td
                                                        style={{
                                                            borderTop:
                                                                index > 0
                                                                    ? `1px solid ${border}`
                                                                    : "none",
                                                        }}
                                                    >
                                                        <span
                                                            className="admin-company-recruiter-status"
                                                            style={getStatusStyle(recruiter.status)}
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}