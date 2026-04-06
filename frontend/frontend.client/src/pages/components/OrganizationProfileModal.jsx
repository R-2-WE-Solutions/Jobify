import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import "../styles/orgmodal.css";

export default function OrganizationProfileModal({ companyName, opportunityId, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                let res;
                if (opportunityId) {
                    res = await api.get(`/Profile/company/by-opportunity/${opportunityId}`);
                } else {
                    res = await api.get(`/Profile/company/${encodeURIComponent(companyName)}`);
                }
                setProfile(res.data);
            } catch (err) {
                if (err?.response?.status !== 404) {
                    setError("Could not load organization profile.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [companyName, opportunityId]);

    // Close on Escape key
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div className="orgmodal-overlay" onClick={onClose}>
            <div className="orgmodal-box" onClick={(e) => e.stopPropagation()}>
                <button className="orgmodal-close" onClick={onClose} aria-label="Close">✕</button>

                <div className="orgmodal-header">
                    <div className="orgmodal-initials">
                        {companyName?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <h2 className="orgmodal-name">{companyName}</h2>
                        <div className="orgmodal-subtitle">Organization Profile</div>
                    </div>
                </div>

                {loading && (
                    <div className="orgmodal-state">
                        <div className="orgmodal-spinner" />
                        <span>Loading profile...</span>
                    </div>
                )}

                {!loading && !error && !profile && (
                    <div className="orgmodal-empty">
                        This organization hasn't added profile information yet.
                    </div>
                )}

                {error && (
                    <div className="orgmodal-state orgmodal-error-state">
                        <span className="orgmodal-error-icon">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                {profile && (
                    <div className="orgmodal-body">
                        {profile.verificationStatus === "Verified" && (
                            <div className="orgmodal-badge orgmodal-badge-verified">
                                ✓ Verified Organization
                            </div>
                        )}

                        {profile.notes && (
                            <div className="orgmodal-section">
                                <div className="orgmodal-label">About</div>
                                <p className="orgmodal-text">{profile.notes}</p>
                            </div>
                        )}

                        {(profile.emailDomain || profile.websiteUrl || profile.linkedinUrl || profile.instagramUrl) && (
                            <div className="orgmodal-links">
                                {profile.emailDomain && (
                                    <div className="orgmodal-row">
                                        <span className="orgmodal-label">Email Domain</span>
                                        <span className="orgmodal-value">@{profile.emailDomain}</span>
                                    </div>
                                )}
                                {profile.websiteUrl && (
                                    <div className="orgmodal-row">
                                        <span className="orgmodal-label">Website</span>
                                        <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="orgmodal-link">
                                            {profile.websiteUrl.replace(/^https?:\/\//, "")}
                                        </a>
                                    </div>
                                )}
                                {profile.linkedinUrl && (
                                    <div className="orgmodal-row">
                                        <span className="orgmodal-label">LinkedIn</span>
                                        <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="orgmodal-link">
                                            View LinkedIn →
                                        </a>
                                    </div>
                                )}
                                {profile.instagramUrl && (
                                    <div className="orgmodal-row">
                                        <span className="orgmodal-label">Instagram</span>
                                        <a href={profile.instagramUrl} target="_blank" rel="noreferrer" className="orgmodal-link">
                                            View Instagram →
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
