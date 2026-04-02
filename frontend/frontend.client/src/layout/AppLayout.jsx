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
  Mail,
} from "lucide-react";
import { api } from "../api/api";
import { useTheme } from "./useTheme";
import "../pages/styles/layout.css";
import "../pages/styles/footer.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState("Loading...");
  const [avatarLetter, setAvatarLetter] = useState("?");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const profileMenuRef = useRef(null);

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
            <div className="al-search">
              <Search className="al-searchIcon" size={18} />
              <input placeholder="Quick search: pages, users, settings… (Ctrl K)" />
              <kbd className="al-kbd">Ctrl K</kbd>
            </div>
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
          <div
            className="al-overlay"
            onClick={() => setSidebarOpen(false)}
          />
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
              <div className="al-userAvatar">{avatarLetter}</div>
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
            <span className="al-footerText">
              AI-powered matching platform
            </span>
          </div>

          <div className="al-footerRight">
            <a href="/" className="footer-link">
              About
            </a>

            <button
              type="button"
              className="footer-link"
              onClick={() => setShowPrivacyModal(true)}
            >
              Privacy Policy
            </button>

            <div className="footer-icons">
              <a
                href="https://github.com/R-2-WE-Solutions/Jobify"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>

              <a
                href="mailto:lmsbywa@gmail.com"
                className="footer-icon"
                aria-label="Email"
                title="lmsbywa@gmail.com"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="al-footerBottom">
            © 2026 Jobify. All rights reserved.
          </div>
        </div>

        {showPrivacyModal && (
          <div
            className="footer-modalOverlay"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div
              className="footer-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="footer-modalHeader">
                <div className="footer-modalTitle">Privacy Policy</div>
                <button
                  type="button"
                  className="footer-modalClose"
                  onClick={() => setShowPrivacyModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="footer-modalBody">
                <p>
                  Jobify respects your privacy. Personal information such as resumes,
                  profiles, applications, and uploaded documents is used only for
                  recruitment, matching, and platform functionality.
                </p>
                <p>
                  We do not sell user data to third parties. Information is only shown
                  to authorized users and organizations within the platform as needed
                  for the recruitment process.
                </p>
                <p>
                  By using Jobify, you agree to provide accurate information and use
                  the platform responsibly.
                </p>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}