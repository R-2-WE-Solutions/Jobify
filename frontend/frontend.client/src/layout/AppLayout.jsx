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
      {/* HEADER */}
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
            <button className="al-iconBtn" onClick={toggleTheme}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="al-iconBtn"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            <div ref={profileMenuRef} className="al-profileMenuWrap">
              <button
                className="al-iconBtn"
                onClick={() => setShowProfileMenu((p) => !p)}
              >
                <User size={18} />
              </button>

              {showProfileMenu && (
                <div className="al-profileMenu">
                  <button onClick={handleGoToChangePassword}>
                    Reset Password
                  </button>
                  <button onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="al-body">
        {sidebarOpen && (
          <div className="al-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`al-sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="al-nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            {role === "Recruiter" && (
              <>
                <NavLink to="/organization">Posting</NavLink>
                <NavLink to="/organization/applicants">
                  Applicants
                </NavLink>
              </>
            )}
            {role === "Student" && (
              <>
                <NavLink to="/browse">Browse</NavLink>
                <NavLink to="/match">Matches</NavLink>
              </>
            )}
            <NavLink to="/profile">Profile</NavLink>
          </nav>
        </aside>

        <main className="al-main">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="al-footer">
        <div className="al-footerInner">
          <div className="al-footerLeft">
            <span className="al-footerBrand">Jobify</span>
            <span className="al-footerText">
              AI-powered matching platform
            </span>
          </div>

          <div className="al-footerRight">
            <a href="/" className="footer-link">About</a>

            <button
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
              >
                <Github size={18} />
              </a>

              {/* ✅ FIXED MAIL LINK */}
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

          <div className="al-footerBottom">
            © 2026 Jobify. All rights reserved.
          </div>
        </div>

        {/* MODAL */}
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
                <button onClick={() => setShowPrivacyModal(false)}>×</button>
              </div>

              <div className="footer-modalBody">
                <p>Jobify respects your privacy.</p>
                <p>No selling of data.</p>
                <p>Used only for matching and recruitment.</p>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}