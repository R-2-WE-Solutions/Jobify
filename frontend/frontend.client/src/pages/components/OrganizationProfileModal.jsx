import React, { useEffect, useState } from "react";
import { useApp } from "../../app/context/AppContext";
import { api } from "../../api/api";
import { X, Globe, Linkedin, Instagram, Building2 } from "lucide-react";
import "../styles/orgmodal.css";

export default function OrganizationProfileModal() {
    const { orgModal, closeOrgModal } = useApp();
    const { open, companyName, opportunityId } = orgModal;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        if (!open) { setProfile(null); setLogoUrl(null); return; }
        setLoading(true);
        const url = opportunityId
            ? `/Profile/company/by-opportunity/${opportunityId}`
            : `/Profile/company/${encodeURIComponent(companyName)}`;
        api.get(url)
            .then(r => {
                setProfile(r.data);
                if (r.data?.userId) {
                    api.get(`/Profile/recruiter/logo?userId=${r.data.userId}&t=${Date.now()}`, { responseType: "blob" })
                        .then(res => setLogoUrl(URL.createObjectURL(res.data)))
                        .catch(() => setLogoUrl(null));
                }
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [open, opportunityId, companyName]);

    if (!open) return null;

    const name = profile?.companyName || companyName || "Organization";
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="orgmodal-overlay" onClick={closeOrgModal}>
            <div className="orgmodal" onClick={e => e.stopPropagation()}>
                <button className="orgmodal-close" onClick={closeOrgModal} type="button">
                    <X size={18} />
                </button>

                <div className="orgmodal-header">
                    <div className="orgmodal-logo">
                        {logoUrl
                            ? <img src={logoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
                            : <span className="orgmodal-initial">{initial}</span>
                        }
                    </div>
                    <div>
                        <h2 className="orgmodal-name">{name}</h2>
                        <p className="orgmodal-subtitle">Organization Profile</p>
                    </div>
                </div>

                {loading && <p className="orgmodal-empty">Loading...</p>}

                {!loading && !profile && (
                    <p className="orgmodal-empty">This organization hasn't added profile information yet.</p>
                )}

                {!loading && profile && (
                    <div className="orgmodal-body">
                        {profile.notes && (
                            <p className="orgmodal-notes">{profile.notes}</p>
                        )}
                        <div className="orgmodal-links">
                            {profile.websiteUrl && (
                                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="orgmodal-link">
                                    <Globe size={14} /> Website
                                </a>
                            )}
                            {profile.linkedinUrl && (
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="orgmodal-link">
                                    <Linkedin size={14} /> LinkedIn
                                </a>
                            )}
                            {profile.instagramUrl && (
                                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="orgmodal-link">
                                    <Instagram size={14} /> Instagram
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}