import React, { useEffect, useState } from "react";
import { api } from "../api/api";

function canEdit(status) {
    return ["Draft", "Pending", "InReview", "Submitted"].includes(status);
}

function canWithdraw(status) {
    return !["Withdrawn", "Accepted", "Rejected"].includes(status);
}

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editedNote, setEditedNote] = useState("");
    const [savingId, setSavingId] = useState(null);
    const [withdrawingId, setWithdrawingId] = useState(null);

    async function loadApplications() {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/api/Application/me");
            setApplications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load applications.");
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadApplications();
    }, []);

    function startEdit(app) {
        setEditingId(app.applicationId);
        setEditedNote(app.note || "");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditedNote("");
    }

    async function saveEdit(applicationId) {
        try {
            setSavingId(applicationId);

            await api.put(`/api/Application/${applicationId}`, {
                note: editedNote,
            });

            setApplications((prev) =>
                prev.map((app) =>
                    app.applicationId === applicationId
                        ? {
                              ...app,
                              note: editedNote.trim() ? editedNote.trim() : null,
                              updatedAtUtc: new Date().toISOString(),
                          }
                        : app
                )
            );

            cancelEdit();
        } catch (err) {
            console.error(err);
            alert(
                err?.response?.data || "Failed to update application."
            );
        } finally {
            setSavingId(null);
        }
    }

    async function withdrawApplication(applicationId) {
        const confirmed = window.confirm(
            "Are you sure you want to withdraw this application?"
        );

        if (!confirmed) return;

        try {
            setWithdrawingId(applicationId);

            await api.post(`/api/Application/${applicationId}/withdraw`);

            setApplications((prev) =>
                prev.map((app) =>
                    app.applicationId === applicationId
                        ? {
                              ...app,
                              status: "Withdrawn",
                              updatedAtUtc: new Date().toISOString(),
                          }
                        : app
                )
            );
        } catch (err) {
            console.error(err);
            alert(
                err?.response?.data || "Failed to withdraw application."
            );
        } finally {
            setWithdrawingId(null);
        }
    }

    if (loading) {
        return <div style={{ padding: 24 }}>Loading applications...</div>;
    }

    if (error) {
        return <div style={{ padding: 24, color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
            <h1 style={{ marginBottom: 8 }}>My Applications</h1>
            <p style={{ color: "#666", marginBottom: 24 }}>
                Manage your submitted applications, update your note, or withdraw when needed.
            </p>

            {applications.length === 0 ? (
                <div
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 20,
                        background: "#fff",
                    }}
                >
                    You have not submitted any applications yet.
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {applications.map((app) => {
                        const isEditing = editingId === app.applicationId;
                        const isSaving = savingId === app.applicationId;
                        const isWithdrawing = withdrawingId === app.applicationId;

                        return (
                            <div
                                key={app.applicationId}
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 14,
                                    padding: 18,
                                    background: "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        alignItems: "flex-start",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <div>
                                        <h2 style={{ margin: "0 0 6px 0" }}>
                                            {app.opportunityTitle}
                                        </h2>
                                        <div style={{ color: "#666", marginBottom: 8 }}>
                                            {app.companyName}
                                        </div>
                                        <div style={{ fontSize: 14, color: "#555" }}>
                                            <strong>Status:</strong> {app.status}
                                        </div>
                                        <div style={{ fontSize: 14, color: "#555" }}>
                                            <strong>Created:</strong>{" "}
                                            {new Date(app.createdAtUtc).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: 14, color: "#555" }}>
                                            <strong>Updated:</strong>{" "}
                                            {new Date(app.updatedAtUtc).toLocaleString()}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {canEdit(app.status) && !isEditing && (
                                            <button
                                                onClick={() => startEdit(app)}
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 10,
                                                    border: "1px solid #d1d5db",
                                                    background: "#fff",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Edit Note
                                            </button>
                                        )}

                                        {canWithdraw(app.status) && (
                                            <button
                                                onClick={() => withdrawApplication(app.applicationId)}
                                                disabled={isWithdrawing}
                                                style={{
                                                    padding: "10px 14px",
                                                    borderRadius: 10,
                                                    border: "1px solid #ef4444",
                                                    background: "#fff",
                                                    color: "#ef4444",
                                                    cursor: isWithdrawing ? "not-allowed" : "pointer",
                                                    opacity: isWithdrawing ? 0.7 : 1,
                                                }}
                                            >
                                                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Application Note</div>

                                    {isEditing ? (
                                        <>
                                            <textarea
                                                value={editedNote}
                                                onChange={(e) => setEditedNote(e.target.value)}
                                                rows={5}
                                                style={{
                                                    width: "100%",
                                                    borderRadius: 10,
                                                    border: "1px solid #d1d5db",
                                                    padding: 12,
                                                    resize: "vertical",
                                                }}
                                                placeholder="Add a note for this application..."
                                            />

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    marginTop: 12,
                                                }}
                                            >
                                                <button
                                                    onClick={() => saveEdit(app.applicationId)}
                                                    disabled={isSaving}
                                                    style={{
                                                        padding: "10px 14px",
                                                        borderRadius: 10,
                                                        border: "none",
                                                        background: "#111827",
                                                        color: "#fff",
                                                        cursor: isSaving ? "not-allowed" : "pointer",
                                                        opacity: isSaving ? 0.7 : 1,
                                                    }}
                                                >
                                                    {isSaving ? "Saving..." : "Save Changes"}
                                                </button>

                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={isSaving}
                                                    style={{
                                                        padding: "10px 14px",
                                                        borderRadius: 10,
                                                        border: "1px solid #d1d5db",
                                                        background: "#fff",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                padding: 12,
                                                borderRadius: 10,
                                                background: "#f9fafb",
                                                border: "1px solid #e5e7eb",
                                                minHeight: 60,
                                                color: app.note ? "#111827" : "#6b7280",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {app.note || "No note added."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}