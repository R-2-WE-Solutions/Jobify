import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import "./styles/myapplications.css";

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
            alert(err?.response?.data || "Failed to update application.");
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
            alert(err?.response?.data || "Failed to withdraw application.");
        } finally {
            setWithdrawingId(null);
        }
    }

    if (loading) {
        return <div className="apps-page">Loading applications...</div>;
    }

    if (error) {
        return <div className="apps-page apps-error">{error}</div>;
    }

    return (
        <div className="apps-page">
            <h1 className="apps-title">My Applications</h1>
            <p className="apps-subtitle">
                Manage your submitted applications, update your note, or withdraw when needed.
            </p>

            {applications.length === 0 ? (
                <div className="apps-empty">
                    You have not submitted any applications yet.
                </div>
            ) : (
                <div className="apps-list">
                    {applications.map((app) => {
                        const isEditing = editingId === app.applicationId;
                        const isSaving = savingId === app.applicationId;
                        const isWithdrawing = withdrawingId === app.applicationId;

                        return (
                            <div key={app.applicationId} className="apps-card">
                                <div className="apps-cardTop">
                                    <div>
                                        <h2 className="apps-jobTitle">{app.opportunityTitle}</h2>
                                        <div className="apps-company">{app.companyName}</div>
                                        <div className="apps-meta">
                                            <strong>Status:</strong> {app.status}
                                        </div>
                                        <div className="apps-meta">
                                            <strong>Created:</strong>{" "}
                                            {new Date(app.createdAtUtc).toLocaleString()}
                                        </div>
                                        <div className="apps-meta">
                                            <strong>Updated:</strong>{" "}
                                            {new Date(app.updatedAtUtc).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="apps-actions">
                                        {canEdit(app.status) && !isEditing && (
                                            <button
                                                onClick={() => startEdit(app)}
                                                className="apps-btn apps-btn-outline"
                                            >
                                                Edit Note
                                            </button>
                                        )}

                                        {canWithdraw(app.status) && (
                                            <button
                                                onClick={() => withdrawApplication(app.applicationId)}
                                                disabled={isWithdrawing}
                                                className="apps-btn apps-btn-danger"
                                            >
                                                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="apps-noteSection">
                                    <div className="apps-noteLabel">Application Note</div>

                                    {isEditing ? (
                                        <>
                                            <textarea
                                                value={editedNote}
                                                onChange={(e) => setEditedNote(e.target.value)}
                                                rows={5}
                                                className="apps-textarea"
                                                placeholder="Add a note for this application..."
                                            />

                                            <div className="apps-editActions">
                                                <button
                                                    onClick={() => saveEdit(app.applicationId)}
                                                    disabled={isSaving}
                                                    className="apps-btn apps-btn-primary"
                                                >
                                                    {isSaving ? "Saving..." : "Save Changes"}
                                                </button>

                                                <button
                                                    onClick={cancelEdit}
                                                    disabled={isSaving}
                                                    className="apps-btn apps-btn-outline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="apps-noteBox">
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