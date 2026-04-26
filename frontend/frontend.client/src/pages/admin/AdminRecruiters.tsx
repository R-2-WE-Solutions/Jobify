import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Mail, Search } from "lucide-react";
import { useTheme } from "../../layout/useTheme";
import "../styles/admin.css";

interface Recruiter {
    id: string;
    name: string;
    email: string;
    company: string;
    createdAt: string;
    lastUpdated: string;
    status: "pending_verification" | "pending_approval" | "verified" | "rejected";
}

function mapStatus(status: string) {
    if (status === "EmailPending") return "pending_verification";
    if (status === "Pending") return "pending_approval";
    if (status === "Verified") return "verified";
    if (status === "Rejected") return "rejected";
    return "pending_verification";
}

export default function AdminRecruiters() {
    const API_URL = import.meta.env.VITE_API_URL;

    const theme: any = useTheme();
    const darkMode = theme && theme.darkMode ? true : false;

    const cardBg = darkMode ? "#111827" : "white";
    const pageBg = darkMode ? "#0f172a" : "#f9fafb";
    const mainText = darkMode ? "#f8fafc" : "#111827";
    const mutedText = darkMode ? "#94a3b8" : "#6b7280";
    const border = darkMode ? "#334155" : "#e5e7eb";
    const rowHover = darkMode ? "#1f2937" : "#f9fafb";
    const softBg = darkMode ? "#1f2937" : "#f3f4f6";

    const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
    const [loadingRecruiters, setLoadingRecruiters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<
        "pending_verification" | "pending_approval" | "verified" | "rejected"
    >("pending_verification");
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
    const [notifyTitle, setNotifyTitle] = useState("");
    const [notifyMessage, setNotifyMessage] = useState("");
    const [notifyType, setNotifyType] = useState("info");

    async function fetchRecruiters() {
        try {
            setLoadingRecruiters(true);
            const token = localStorage.getItem("jobify_token");

            const res = await fetch(`${API_URL}/users/by-role/recruiter`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            const mapped = data.map((r: any) => ({
                id: r.id,
                name: r.fullName ?? r.email,
                email: r.email,
                company: r.companyName ?? "Unknown",
                createdAt: r.createdAt ? r.createdAt.split("T")[0] : "-",
                lastUpdated: r.updatedAtUtc
                    ? r.updatedAtUtc.split("T")[0]
                    : r.createdAt
                    ? r.createdAt.split("T")[0]
                    : "-",
                status: mapStatus(r.verificationStatus),
            }));

            setRecruiters(mapped);
        } catch (err) {
            console.error("Error in Fetching Recruiters: ", err);
        } finally {
            setLoadingRecruiters(false);
        }
    }

    useEffect(() => {
        fetchRecruiters();
    }, []);

    const handleApprove = async (recruiterId: string) => {
        try {
            const token = localStorage.getItem("jobify_token");

            await fetch(`${API_URL}/auth/admin/approve-recruiter/${recruiterId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchRecruiters();
            alert("Recruiter Approved Successfully!");
        } catch (err) {
            console.error("Error in Approving Recruiter: ", err);
        }
    };

    const handleReject = async (recruiterId: string) => {
        try {
            const token = localStorage.getItem("jobify_token");

            await fetch(`${API_URL}/auth/admin/reject-recruiter/${recruiterId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchRecruiters();
            alert("Recruiter Rejected Successfully.");
        } catch (err) {
            console.error("Error in Rejecting Recruiter: ", err);
        }
    };

    const handleRevoke = async (recruiterId: string) => {
        try {
            const token = localStorage.getItem("jobify_token");

            await fetch(`${API_URL}/auth/admin/recruiters/${recruiterId}/revoke`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchRecruiters();
            alert("Recruiter Revoked Successfully.");
        } catch (err) {
            console.error("Error in Revoking Recruiter: ", err);
        }
    };

    const handleSendNotification = async () => {
        if (!selectedRecruiterId) return;

        if (!notifyMessage.trim()) {
            alert("Message is required");
            return;
        }

        try {
            const token = localStorage.getItem("jobify_token");

            const res = await fetch(
                `${API_URL}/users/admin/recruiters/${selectedRecruiterId}/notify`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: notifyTitle,
                        message: notifyMessage,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed");

            alert("Notification sent ✅");
            setShowNotifyModal(false);
            setNotifyTitle("");
            setNotifyMessage("");
            setNotifyType("info");
        } catch (err) {
            console.error(err);
            alert("Failed to send ❌");
        }
    };

    const filteredRecruiters = recruiters.filter((recruiter) => {
        const matchesSearch =
            recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recruiter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recruiter.company.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch && recruiter.status === activeTab;
    });

    const pendingVerificationCount = recruiters.filter((r) => r.status === "pending_verification").length;
    const pendingApprovalCount = recruiters.filter((r) => r.status === "pending_approval").length;
    const verifiedCount = recruiters.filter((r) => r.status === "verified").length;
    const rejectedCount = recruiters.filter((r) => r.status === "rejected").length;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const tabs = [
        { value: "pending_verification", label: "Waiting for Email", icon: Mail, count: pendingVerificationCount },
        { value: "pending_approval", label: "Waiting for Approval", icon: Clock, count: pendingApprovalCount },
        { value: "verified", label: "Verified", icon: CheckCircle, count: verifiedCount },
        { value: "rejected", label: "Rejected", icon: XCircle, count: rejectedCount },
    ];

    if (loadingRecruiters) {
        return (
            <div className="admin-page" style={{ background: pageBg, color: mainText }}>
                <p style={{ padding: "24px" }}>Loading recruiters...</p>
            </div>
        );
    }

    return (
        <div className="admin-page" style={{ background: pageBg, color: mainText }}>
            <div className="admin-header">
                <h1>Recruiters</h1>
                <p>Manage recruiter accounts and approvals</p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                }}
            >
                {[
                    { label: "Pending Verification", value: pendingVerificationCount, icon: Mail, bg: darkMode ? "#7c2d12" : "#ffedd5", color: "#ea580c" },
                    { label: "Pending Approval", value: pendingApprovalCount, icon: Clock, bg: darkMode ? "#1e3a8a" : "#dbeafe", color: "#3b82f6" },
                    { label: "Verified", value: verifiedCount, icon: CheckCircle, bg: darkMode ? "#14532d" : "#dcfce7", color: "#16a34a" },
                    { label: "Rejected", value: rejectedCount, icon: XCircle, bg: darkMode ? "#7f1d1d" : "#fee2e2", color: "#dc2626" },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            style={{
                                backgroundColor: cardBg,
                                borderRadius: "12px",
                                padding: "20px",
                                border: `1px solid ${border}`,
                                boxShadow: darkMode
                                    ? "0 12px 30px rgba(0,0,0,0.35)"
                                    : "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div
                                    style={{
                                        backgroundColor: item.bg,
                                        padding: "12px",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <Icon style={{ width: "24px", height: "24px", color: item.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "13px", color: mutedText, marginBottom: "4px" }}>
                                        {item.label}
                                    </p>
                                    <p style={{ fontSize: "28px", fontWeight: "700", color: mainText }}>
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    marginTop: "20px",
                    backgroundColor: cardBg,
                    borderRadius: "12px",
                    padding: "24px",
                    border: `1px solid ${border}`,
                    boxShadow: darkMode
                        ? "0 12px 30px rgba(0,0,0,0.35)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: mainText }}>
                    Recruiter Management
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
                        placeholder="Search by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px 10px 40px",
                            border: `1px solid ${border}`,
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            background: darkMode ? "#0f172a" : "white",
                            color: mainText,
                        }}
                    />
                </div>

                <div className="admin-recruiter-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.value;

                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value as typeof activeTab)}
                                className={`admin-recruiter-tab ${isActive ? "active" : ""}`}
                            >
                                <Icon className="admin-recruiter-tab-icon" />
                                <span>{tab.label}</span>

                                {tab.count > 0 && (
                                    <span className={`admin-recruiter-tab-badge ${isActive ? "active" : ""}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="admin-recruiters-table-wrap">
                    <table className="admin-recruiters-table">
                        <thead>
                            <tr style={{ backgroundColor: darkMode ? "#1f2937" : "#f9fafb" }}>
                                {["Recruiter", "Email", "Company", "Created At", "Last Updated", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "12px 16px",
                                            textAlign: h === "Actions" ? "right" : "left",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: mutedText,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
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
                                            color: mutedText,
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
                                            backgroundColor: hoveredRow === recruiter.id ? rowHover : cardBg,
                                            transition: "background-color 0.2s",
                                        }}
                                    >
                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}` }}>
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
                                                <span style={{ fontWeight: "600", fontSize: "14px", color: mainText }}>
                                                    {recruiter.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}`, color: mutedText, fontSize: "14px" }}>
                                            {recruiter.email}
                                        </td>

                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}` }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    backgroundColor: softBg,
                                                    padding: "4px 10px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    color: mainText,
                                                }}
                                            >
                                                {recruiter.company}
                                            </span>
                                        </td>

                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}`, color: mutedText, fontSize: "14px" }}>
                                            {recruiter.createdAt}
                                        </td>

                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}`, color: mutedText, fontSize: "14px" }}>
                                            {recruiter.lastUpdated}
                                        </td>

                                        <td style={{ padding: "16px", borderTop: `1px solid ${border}`, textAlign: "right" }}>
                                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
                                                {activeTab === "pending_verification" && (
                                                    <button className="admin-btn admin-btn-secondary" disabled>
                                                        <Mail size={14} />
                                                        Waiting
                                                    </button>
                                                )}

                                                {activeTab === "pending_approval" && (
                                                    <>
                                                        <button className="admin-btn admin-btn-secondary" onClick={() => handleReject(recruiter.id)}>
                                                            <XCircle size={14} />
                                                            Reject
                                                        </button>

                                                        <button className="admin-btn admin-btn-primary" onClick={() => handleApprove(recruiter.id)}>
                                                            <CheckCircle size={14} />
                                                            Approve
                                                        </button>
                                                    </>
                                                )}

                                                {activeTab === "verified" && (
                                                    <>
                                                        <button
                                                            className="admin-btn admin-btn-primary"
                                                            onClick={() => {
                                                                setSelectedRecruiterId(recruiter.id);
                                                                setShowNotifyModal(true);
                                                            }}
                                                        >
                                                            <Mail size={14} />
                                                            Notify
                                                        </button>

                                                        <button className="admin-btn admin-btn-secondary" onClick={() => handleRevoke(recruiter.id)}>
                                                            <XCircle size={14} />
                                                            Revoke
                                                        </button>
                                                    </>
                                                )}

                                                {activeTab === "rejected" && (
                                                    <button className="admin-btn admin-btn-primary" onClick={() => handleApprove(recruiter.id)}>
                                                        <CheckCircle size={14} />
                                                        Re-Approve
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

            {showNotifyModal && (
                <div className="admin-modal-overlay">
                    <div
                        className="admin-notify-modal"
                        style={{
                            backgroundColor: cardBg,
                            color: mainText,
                            border: `1px solid ${border}`,
                        }}
                    >
                        <h3 className="admin-notify-title">Send Notification</h3>

                        <select
                            value={notifyType}
                            onChange={(e) => setNotifyType(e.target.value)}
                            className="admin-notify-input"
                        >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Title"
                            value={notifyTitle}
                            onChange={(e) => setNotifyTitle(e.target.value)}
                            className="admin-notify-input"
                        />

                        <textarea
                            placeholder="Message"
                            value={notifyMessage}
                            onChange={(e) => setNotifyMessage(e.target.value)}
                            className="admin-notify-textarea"
                        />

                        <div className="admin-notify-actions">
                            <button className="admin-btn admin-btn-secondary" onClick={() => setShowNotifyModal(false)}>
                                Cancel
                            </button>

                            <button className="admin-btn admin-btn-primary" onClick={handleSendNotification}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}