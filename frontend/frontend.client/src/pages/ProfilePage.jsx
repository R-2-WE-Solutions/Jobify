import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../api/profile';
import './styles/profile.css';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProfile();

            // ✅ API returns { role, profile }
            setProfile(data.profile);
            setFormData(data.profile);
            setUserRole(data.role);
        } catch (err) {
            setError(err.message || 'Failed to load profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const result = await updateProfile(formData);

            // ✅ API returns { role, profile }
            setProfile(result.profile);
            setFormData(result.profile);
            setUserRole(result.role);

            setEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            console.error('Error updating profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setEditing(false);
        setError(null);
    };

    // ✅ FIX 1: ONLY block on loading
    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    // ✅ FIX 2: if API returned nothing, show error instead of infinite loading
    if (!profile) {
        return (
            <div className="profile-container">
                <div className="alert alert-error">
                    {error || 'Profile not found / failed to load.'}
                </div>
            </div>
        );
    }

    // ✅ FIX 3: if role missing, show error instead of infinite loading
    if (!userRole) {
        return (
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                </div>
                <div className="alert alert-error">
                    {error || 'User role is missing. Try refreshing or login again.'}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                {!editing && (
                    <button
                        className="btn-primary"
                        onClick={() => setEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    Profile updated successfully!
                </div>
            )}

            {userRole === 'Student' ? (
                <StudentProfileForm
                    profile={profile}
                    formData={formData}
                    editing={editing}
                    onChange={handleInputChange}
                />
            ) : userRole === 'Recruiter' ? (
                <RecruiterProfileForm
                    profile={profile}
                    formData={formData}
                    editing={editing}
                    onChange={handleInputChange}
                />
            ) : (
                <div className="alert alert-error">Unknown user role</div>
            )}

            {editing && (
                <div className="profile-actions">
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

const StudentProfileForm = ({ profile, formData, editing, onChange }) => {
    return (
        <div className="profile-form">
            <div className="form-section">
                <h2>Basic Information</h2>

                <div className="form-group">
                    <label>Full Name</label>
                    {editing ? (
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={onChange}
                            placeholder="Enter your full name"
                        />
                    ) : (
                        <p className="form-value">{profile.fullName || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>University</label>
                    {editing ? (
                        <input
                            type="text"
                            name="university"
                            value={formData.university || ''}
                            onChange={onChange}
                            placeholder="Enter your university"
                        />
                    ) : (
                        <p className="form-value">{profile.university || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Major</label>
                    {editing ? (
                        <input
                            type="text"
                            name="major"
                            value={formData.major || ''}
                            onChange={onChange}
                            placeholder="Enter your major"
                        />
                    ) : (
                        <p className="form-value">{profile.major || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Bio</label>
                    {editing ? (
                        <textarea
                            name="bio"
                            value={formData.bio || ''}
                            onChange={onChange}
                            placeholder="Tell us about yourself"
                            rows="4"
                        />
                    ) : (
                        <p className="form-value">{profile.bio || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Portfolio URL</label>
                    {editing ? (
                        <input
                            type="url"
                            name="portfolioUrl"
                            value={formData.portfolioUrl || ''}
                            onChange={onChange}
                            placeholder="https://yourportfolio.com"
                        />
                    ) : (
                        <p className="form-value">
                            {profile.portfolioUrl ? (
                                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                    {profile.portfolioUrl}
                                </a>
                            ) : (
                                'Not set'
                            )}
                        </p>
                    )}
                </div>
            </div>

            <div className="form-section">
                <h2>Professional Details</h2>

                <div className="form-group">
                    <label>Education</label>
                    {editing ? (
                        <textarea
                            name="educationText"
                            value={formData.educationText || ''}
                            onChange={onChange}
                            placeholder="Describe your education background"
                            rows="4"
                        />
                    ) : (
                        <p className="form-value">{profile.educationText || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Experience</label>
                    {editing ? (
                        <textarea
                            name="experienceText"
                            value={formData.experienceText || ''}
                            onChange={onChange}
                            placeholder="Describe your work experience"
                            rows="4"
                        />
                    ) : (
                        <p className="form-value">{profile.experienceText || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Projects</label>
                    {editing ? (
                        <textarea
                            name="projectsText"
                            value={formData.projectsText || ''}
                            onChange={onChange}
                            placeholder="List your projects"
                            rows="4"
                        />
                    ) : (
                        <p className="form-value">{profile.projectsText || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Interests</label>
                    {editing ? (
                        <textarea
                            name="interestsText"
                            value={formData.interestsText || ''}
                            onChange={onChange}
                            placeholder="What are your interests?"
                            rows="3"
                        />
                    ) : (
                        <p className="form-value">{profile.interestsText || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Certifications</label>
                    {editing ? (
                        <textarea
                            name="certificationsText"
                            value={formData.certificationsText || ''}
                            onChange={onChange}
                            placeholder="List your certifications"
                            rows="3"
                        />
                    ) : (
                        <p className="form-value">{profile.certificationsText || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Awards</label>
                    {editing ? (
                        <textarea
                            name="awardsText"
                            value={formData.awardsText || ''}
                            onChange={onChange}
                            placeholder="List your awards and achievements"
                            rows="3"
                        />
                    ) : (
                        <p className="form-value">{profile.awardsText || 'Not set'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecruiterProfileForm = ({ profile, formData, editing, onChange }) => {
    const getVerificationBadge = (status) => {
        const badges = {
            'EmailPending': { text: 'Email Pending', class: 'badge-warning' },
            'Pending': { text: 'Pending Verification', class: 'badge-info' },
            'Verified': { text: 'Verified', class: 'badge-success' },
            'Rejected': { text: 'Rejected', class: 'badge-error' }
        };
        return badges[status] || { text: status, class: 'badge-default' };
    };

    const badge = getVerificationBadge(profile.verificationStatus);

    return (
        <div className="profile-form">
            <div className="form-section">
                <h2>Company Information</h2>

                <div className="form-group">
                    <label>Verification Status</label>
                    <p className="form-value">
                        <span className={`badge ${badge.class}`}>
                            {badge.text}
                        </span>
                    </p>
                </div>

                <div className="form-group">
                    <label>Company Name *</label>
                    {editing ? (
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName || ''}
                            onChange={onChange}
                            placeholder="Enter company name"
                            required
                        />
                    ) : (
                        <p className="form-value">{profile.companyName || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Email Domain</label>
                    {editing ? (
                        <input
                            type="text"
                            name="emailDomain"
                            value={formData.emailDomain || ''}
                            onChange={onChange}
                            placeholder="example.com"
                        />
                    ) : (
                        <p className="form-value">{profile.emailDomain || 'Not set'}</p>
                    )}
                </div>

                <div className="form-group">
                    <label>Website URL</label>
                    {editing ? (
                        <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl || ''}
                            onChange={onChange}
                            placeholder="https://company.com"
                        />
                    ) : (
                        <p className="form-value">
                            {profile.websiteUrl ? (
                                <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                                    {profile.websiteUrl}
                                </a>
                            ) : (
                                'Not set'
                            )}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>LinkedIn URL</label>
                    {editing ? (
                        <input
                            type="url"
                            name="linkedinUrl"
                            value={formData.linkedinUrl || ''}
                            onChange={onChange}
                            placeholder="https://linkedin.com/company/..."
                        />
                    ) : (
                        <p className="form-value">
                            {profile.linkedinUrl ? (
                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    {profile.linkedinUrl}
                                </a>
                            ) : (
                                'Not set'
                            )}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>Instagram URL</label>
                    {editing ? (
                        <input
                            type="url"
                            name="instagramUrl"
                            value={formData.instagramUrl || ''}
                            onChange={onChange}
                            placeholder="https://instagram.com/..."
                        />
                    ) : (
                        <p className="form-value">
                            {profile.instagramUrl ? (
                                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">
                                    {profile.instagramUrl}
                                </a>
                            ) : (
                                'Not set'
                            )}
                        </p>
                    )}
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    {editing ? (
                        <textarea
                            name="notes"
                            value={formData.notes || ''}
                            onChange={onChange}
                            placeholder="Additional notes or information"
                            rows="4"
                        />
                    ) : (
                        <p className="form-value">{profile.notes || 'Not set'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
