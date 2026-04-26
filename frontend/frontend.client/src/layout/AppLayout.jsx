import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    Search,
    Moon,
    Sun,
    User,
    LayoutGrid,
    Sparkles,
    Star,
    UserCircle,
    Building2,
    FileText,
    Bell,
    Github,
    Mail
} from "lucide-react";
import { api } from "../api/api";
import { useTheme } from "./useTheme";
import "../pages/styles/layout.css";
import "../pages/styles/footer.css";
import { AppProvider } from "../app/context/AppContext";
import OrganizationProfileModal from "../pages/components/OrganizationProfileModal";

const RECRUITER_SEARCH_OPTIONS = [
    {
        id: "dashboard",
        label: "Dashboard",
        hint: "Overview metrics and updates",
        keywords: "dashboard home overview",
        path: "/dashboard",
    },
    {
        id: "org-post",
        label: "Posting - Post a Job",
        hint: "Open posting form",
        keywords: "organization posting post create job",
        path: "/organization",
        query: { tab: "post" },
    },
    {
        id: "org-listings",
        label: "Posting - My Listings",
        hint: "View and manage listings",
        keywords: "organization postings listings opportunities jobs",
        path: "/organization",
        query: { tab: "listings" },
    },
    {
        id: "app-all",
        label: "Applicants - All Stages",
        hint: "All candidates",
        keywords: "applicants candidates all stages",
        path: "/organization/applicants",
        query: { stage: "All" },
    },
    {
        id: "app-pending",
        label: "Applicants - Pending",
        hint: "Candidates waiting review",
        keywords: "applicants pending",
        path: "/organization/applicants",
        query: { stage: "Pending" },
    },
    {
        id: "app-inreview",
        label: "Applicants - In Review",
        hint: "Candidates under review",
        keywords: "applicants in review",
        path: "/organization/applicants",
        query: { stage: "InReview" },
    },
    {
        id: "app-shortlisted",
        label: "Applicants - Shortlisted",
        hint: "Shortlisted candidates",
        keywords: "applicants shortlisted",
        path: "/organization/applicants",
        query: { stage: "Shortlisted" },
    },
    {
        id: "app-accepted",
        label: "Applicants - Accepted",
        hint: "Accepted candidates",
        keywords: "applicants accepted",
        path: "/organization/applicants",
        query: { stage: "Accepted" },
    },
    {
        id: "app-rejected",
        label: "Applicants - Rejected",
        hint: "Rejected candidates",
        keywords: "applicants rejected",
        path: "/organization/applicants",
        query: { stage: "Rejected" },
    },
    {
        id: "interviews",
        label: "Interviews",
        hint: "Manage upcoming interviews",
        keywords: "interviews schedule",
        path: "/organization/interviews",
    },
    {
        id: "qa-all",
        label: "Q&A - All",
        hint: "All candidate questions",
        keywords: "qa q&a questions all",
        path: "/organization/qanda",
        query: { filter: "all" },
    },
    {
        id: "qa-pending",
        label: "Q&A - Pending",
        hint: "Questions waiting for answer",
        keywords: "qa q&a pending unanswered",
        path: "/organization/qanda",
        query: { filter: "pending" },
    },
    {
        id: "qa-answered",
        label: "Q&A - Answered",
        hint: "Already answered questions",
        keywords: "qa q&a answered",
        path: "/organization/qanda",
        query: { filter: "answered" },
    },
    {
        id: "notifications",
        label: "Notifications",
        hint: "Open notifications",
        keywords: "notifications alerts",
        path: "/notifications",
    },
    {
        id: "profile",
        label: "Profile",
        hint: "Account and company profile",
        keywords: "profile account settings",
        path: "/profile",
    },
];

function buildPath(option) {
    if (!option.query) return option.path;
    return `${option.path}?${new URLSearchParams(option.query).toString()}`;
}

function getSearchMatches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return RECRUITER_SEARCH_OPTIONS;

    return RECRUITER_SEARCH_OPTIONS.filter((option) =>
        `${option.label} ${option.hint} ${option.keywords}`
            .toLowerCase()
            .includes(q)
    );
}

function AppLayoutInner() {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();

    const [scrolled, setScrolled] = useState(false);
    const [role, setRole] = useState(null);
    const [displayName, setDisplayName] = useState("Loading...");
    const [avatarLetter, setAvatarLetter] = useState("?");
    const [sidebarLogoUrl, setSidebarLogoUrl] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState("");

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [openFooter, setOpenFooter] = useState(null);
    const [globalQuery, setGlobalQuery] = useState("");
    const [showSearchMenu, setShowSearchMenu] = useState(false);

    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);

    const profileMenuRef = useRef(null);
    const globalSearchRef = useRef(null);
    const searchMenuRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }

            if (
                searchMenuRef.current &&
                !searchMenuRef.current.contains(event.target)
            ) {
                setShowSearchMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoadingProfile(true);
                setProfileError("");

                const res = await api.get("/profile");
                const data = res.data;

                const userRole = data?.role ?? null;
                setRole(userRole);

                if (userRole === "Recruiter") {
                    const company = data?.profile?.companyName || "Recruiter";
                    setDisplayName(company);
                    setAvatarLetter(company.charAt(0)?.toUpperCase() || "R");
                    if (data?.profile?.userId && data?.profile?.logoFileName) {
                        api.get(`/Profile/recruiter/logo?userId=${data.profile.userId}&t=${Date.now()}`, { responseType: "blob" })
                            .then(r => setSidebarLogoUrl(URL.createObjectURL(r.data)))
                            .catch(() => setSidebarLogoUrl(null));
                    }
                } else if (userRole === "Student") {
                    const fullName = data?.profile?.fullName || "Student";
                    setDisplayName(fullName);
                    setAvatarLetter(fullName.charAt(0)?.toUpperCase() || "S");
                } else {
                    setDisplayName("Unknown User");
                    setAvatarLetter("?");
                    setProfileError("Profile role was not recognized.");
                }
            } catch (error) {
                console.error("Failed to load profile in layout:", error);
                setProfileError("Failed to load profile.");
                setRole(null);
                setDisplayName("Profile Error");
                setAvatarLetter("!");
            } finally {
                setLoadingProfile(false);
            }
        }

        fetchProfile();
    }, []);

    useEffect(() => {
        async function loadUnreadCount() {
            try {
                const unreadRes = await api.get("/Notifications/unread-count");
                setUnreadCount(unreadRes.data?.unreadCount ?? 0);
            } catch (err) {
                console.error("Failed to load unread count:", err);
                setUnreadCount(0);
            }
        }

        loadUnreadCount();
    }, []);

    useEffect(() => {
        function handleGlobalHotkey(event) {
            if (role !== "Recruiter") return;
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                globalSearchRef.current?.focus();
                globalSearchRef.current?.select();
                setShowSearchMenu(true);
            }
        }

        window.addEventListener("keydown", handleGlobalHotkey);
        return () => window.removeEventListener("keydown", handleGlobalHotkey);
    }, [role]);

    function runGlobalSearch() {
        if (role !== "Recruiter") return;
        const q = globalQuery.trim();
        const matches = getSearchMatches(q);

        if (matches.length > 0) {
            navigate(buildPath(matches[0]));
            setShowSearchMenu(false);
            return;
        }

        if (!q) {
            setShowSearchMenu(true);
            return;
        }

        navigate("/organization");
        setShowSearchMenu(false);
    }

    function selectSearchOption(option) {
        navigate(buildPath(option));
        setGlobalQuery(option.label);
        setShowSearchMenu(false);
    }

    function handleLogout() {
        setShowProfileMenu(false);
        localStorage.removeItem("jobify_token");
        localStorage.removeItem("jobify_user");
        localStorage.removeItem("jobify_signup");
        navigate("/login");
    }

    function handleGoToChangePassword() {
        setShowProfileMenu(false);
        navigate("/change-password");
    }

    function closeAllFooterModals() {
        setShowAboutModal(false);
        setShowPrivacyModal(false);
    }

    const filteredSearchOptions = getSearchMatches(globalQuery).slice(0, 10);

    return (
        <div className="al-shell">
            <header className={`al-header ${scrolled ? "isScrolled" : ""}`}>
                <div className="al-headerInner">
                    <div className="al-headerSide al-left">
                        <div className="al-logo">Jobify</div>

                        <button
                            className="al-hamburger"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            type="button"
                        >
                            ☰
                        </button>
                    </div>

                    <div className="al-headerCenter">
                        {!loadingProfile && role === "Recruiter" && (
                            <form
                                ref={searchMenuRef}
                                className="al-search"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    runGlobalSearch();
                                }}
                            >
                                <Search className="al-searchIcon" size={18} />
                                <input
                                    ref={globalSearchRef}
                                    value={globalQuery}
                                    onChange={(e) => {
                                        setGlobalQuery(e.target.value);
                                        setShowSearchMenu(true);
                                    }}
                                    onFocus={() => setShowSearchMenu(true)}
                                    placeholder="Recruiter quick search: pages and tabs... (Ctrl K)"
                                />
                                <kbd className="al-kbd">Ctrl K</kbd>

                                {showSearchMenu && (
                                    <div className="al-searchMenu">
                                        {filteredSearchOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                className="al-searchOption"
                                                onClick={() => selectSearchOption(option)}
                                            >
                                                <span className="al-searchOptionLabel">{option.label}</span>
                                                <span className="al-searchOptionHint">{option.hint}</span>
                                            </button>
                                        ))}

                                        {filteredSearchOptions.length === 0 && (
                                            <div className="al-searchEmpty">
                                                No matching destination. Try "Applicants", "Q&A", or "My Listings".
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>

                    <div className="al-headerSide al-right">
                        <button
                            className="al-iconBtn"
                            type="button"
                            title="Toggle theme"
                            onClick={toggleTheme}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="al-notifWrap">
                            <button
                                className="al-iconBtn"
                                type="button"
                                title="Notifications"
                                onClick={() => navigate("/notifications")}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="notif-badge">{unreadCount}</span>
                                )}
                            </button>
                        </div>

                        <div ref={profileMenuRef} className="al-profileMenuWrap">
                            <button
                                className="al-iconBtn"
                                type="button"
                                title="Account"
                                onClick={() => setShowProfileMenu((prev) => !prev)}
                            >
                                <User size={18} />
                            </button>

                            {showProfileMenu && (
                                <div className="al-profileMenu">
                                    <button
                                        type="button"
                                        onClick={handleGoToChangePassword}
                                        className="al-profileMenuItem"
                                    >
                                        Reset Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="al-profileMenuItem"
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="al-body">
                {sidebarOpen && (
                    <div className="al-overlay" onClick={() => setSidebarOpen(false)} />
                )}

                <aside className={`al-sidebar ${sidebarOpen ? "open" : ""}`}>
                    <nav className="al-nav">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                        >
                            <span className="al-linkIcon">
                                <LayoutGrid size={18} />
                            </span>
                            <span className="al-linkText">Dashboard</span>
                        </NavLink>

                        {!loadingProfile && role === "Recruiter" && (
                            <NavLink
                                to="/organization"
                                end
                                className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                            >
                                <span className="al-linkIcon">
                                    <Building2 size={18} />
                                </span>
                                <span className="al-linkText">Posting</span>
                            </NavLink>
                        )}

                        {!loadingProfile && role === "Recruiter" && (
                            <NavLink
                                to="/organization/applicants"
                                className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                            >
                                <span className="al-linkIcon">
                                    <FileText size={18} />
                                </span>
                                <span className="al-linkText">Applicants</span>
                            </NavLink>
                        )}

                        {!loadingProfile && role === "Student" && (
                            <NavLink
                                to="/browse"
                                className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                            >
                                <span className="al-linkIcon">
                                    <Sparkles size={18} />
                                </span>
                                <span className="al-linkText">Browse</span>
                            </NavLink>
                        )}

                        {!loadingProfile && role === "Student" && (
                            <NavLink
                                to="/match"
                                className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                            >
                                <span className="al-linkIcon">
                                    <Star size={18} />
                                </span>
                                <span className="al-linkText">Matches</span>
                            </NavLink>
                        )}

                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `al-link ${isActive ? "isActive" : ""}`}
                        >
                            <span className="al-linkIcon">
                                <UserCircle size={18} />
                            </span>
                            <span className="al-linkText">Profile</span>
                        </NavLink>
                    </nav>

                    <div className="al-sidebarBottom">
                        <div className="al-userCard">
                            <div className="al-userAvatar" style={sidebarLogoUrl ? { padding: 0, overflow: "hidden" } : {}}>
                                {sidebarLogoUrl
                                    ? <img src={sidebarLogoUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : avatarLetter
                                }
                            </div>

                            <div className="al-userMeta">
                                <div className="al-userName">{displayName}</div>
                                <div className="al-userRole">
                                    {loadingProfile ? "Loading..." : role || "Unknown"}
                                </div>
                                {profileError && <div className="al-errorText">{profileError}</div>}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="al-main">
                    <div className="al-content">
                        <Outlet context={{ displayName, role, loadingProfile }} />
                    </div>
                </main>
            </div>

            <footer className="al-footer">
                <div className="al-footerInner">
                    <div className="al-footerLeft">
                        <span className="al-footerBrand">Jobify</span>
                        <span className="al-footerText">AI-powered matching platform</span>
                    </div>

                    <div className="al-footerRight">
                        <button
                            type="button"
                            className="footer-link"
                            onClick={() => {
                                setShowPrivacyModal(false);
                                setShowAboutModal(true);
                            }}
                        >
                            About
                        </button>

                        <button
                            type="button"
                            className="footer-link"
                            onClick={() => {
                                setShowAboutModal(false);
                                setShowPrivacyModal(true);
                            }}
                        >
                            Privacy Policy
                        </button>

                        <div className="footer-icons">
                            <a
                                href="https://github.com/R-2-WE-Solutions/Jobify"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-icon"
                            >
                                <Github size={18} />
                            </a>

                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=lmsbywa@gmail.com&su=Jobify%20Inquiry"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer-icon"
                            >
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                    <div className="al-footerBottom">© 2026 Jobify. All rights reserved.</div>
                </div>

                
            </footer>

            {showAboutModal && (
                <div className="footer-modalOverlay" onClick={closeAllFooterModals}>
                    <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="footer-modalHeader">
                            <div className="footer-modalTitle">About Jobify</div>

                            <button
                                type="button"
                                className="footer-modalClose"
                                onClick={closeAllFooterModals}
                            >
                                ×
                            </button>
                        </div>

                        <div className="footer-modalBody">
                            <p>
                                Jobify is an AI-powered platform that helps students and recruiters
                                connect through smarter, more transparent hiring tools.
                            </p>

                            <p>
                                Key features include CV review, real opportunity assessments,
                                coding evaluation, proctoring support, university proof checking,
                                matching recommendations with percentage-based fit, and clear
                                skill visibility for both sides.
                            </p>

                            <p>
                                Our goal is to make applications more skill-based, trustworthy,
                                and helpful instead of being just another simple job board.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showPrivacyModal && (
                <div className="footer-modalOverlay" onClick={closeAllFooterModals}>
                    <div className="footer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="footer-modalHeader">
                            <div className="footer-modalTitle">Privacy Policy</div>

                            <button
                                type="button"
                                className="footer-modalClose"
                                onClick={closeAllFooterModals}
                            >
                                ×
                            </button>
                        </div>

                        <div className="footer-modalBody">
                            <p>
                                Jobify is committed to protecting your privacy and personal
                                information.
                            </p>

                            <p>
                                All recruiters and organizations must go through a verification
                                process before accessing the platform and viewing applicant
                                profiles. This helps ensure that only legitimate and approved
                                parties can interact with student information.
                            </p>

                            <p>
                                Student data is securely stored and protected against
                                unauthorized access, misuse, or loss. Personal information is
                                used strictly for recruitment, job matching, and
                                application-related processes within the Jobify platform.
                            </p>

                            <p>
                                Jobify does <strong>not sell, rent, or share your personal data</strong>{" "}
                                with third parties for advertising or commercial purposes.
                            </p>

                            <p>
                                Our goal is to provide a safe and trustworthy environment where
                                students and professionals can connect with verified
                                opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppLayout() {
    return (
        <AppProvider>
            <AppLayoutInner />
            <OrganizationProfileModal />
        </AppProvider>
    );
}
