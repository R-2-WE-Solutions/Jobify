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
  Bell
} from "lucide-react";
import { api } from "../api/api";
import { useTheme } from "./useTheme";
import "../pages/styles/layout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState("Loading...");
  const [avatarLetter, setAvatarLetter] = useState("?");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get("/profile");
        const data = res.data;

        const userRole = data?.role ?? null;
        setRole(userRole);

        if (userRole === "Recruiter") {
          const company = data?.profile?.companyName || "Recruiter";
          setDisplayName(company);
          setAvatarLetter(company.charAt(0).toUpperCase());
        } else {
          const name = data?.profile?.fullName || "Student";
          setDisplayName(name);
          setAvatarLetter(name.charAt(0).toUpperCase());
        }
      } catch {
        setDisplayName("Error");
      }
    }

    fetchProfile();
  }, []);

  // =========================
  // LOAD NOTIFICATIONS
  // =========================
  useEffect(() => {
    async function loadNotifications() {
      try {
        const [nRes, uRes] = await Promise.all([
          api.get("/Notifications"),
          api.get("/Notifications/unread-count"),
        ]);

        setNotifications(nRes.data || []);
        setUnreadCount(uRes.data?.unreadCount || 0);
      } catch (err) {
        console.error(err);
      }
    }

    loadNotifications();
  }, []);

  async function handleNotificationClick(n) {
    try {
      if (!n.isRead) {
        await api.put(`/Notifications/${n.id}/read`);

        setNotifications(prev =>
          prev.map(x => x.id === n.id ? { ...x, isRead: true } : x)
        );

        setUnreadCount(prev => Math.max(prev - 1, 0));
      }

      setShowNotifications(false);

      if (n.opportunityId) {
        navigate(`/opportunities/${n.opportunityId}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div className="al-shell">
      <header className={`al-header ${scrolled ? "isScrolled" : ""}`}>
        <div className="al-headerInner">

          {/* LEFT */}
          <div className="al-headerSide al-left">
            <div className="al-logo">Jobify</div>
            <button
              className="al-hamburger"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              ☰
            </button>
          </div>

          {/* CENTER */}
          <div className="al-headerCenter">
            <div className="al-search">
              <Search size={18} />
              <input placeholder="Search..." />
            </div>
          </div>

          {/* RIGHT */}
          <div className="al-headerSide al-right">

            {/* THEME */}
            <button onClick={toggleTheme} className="al-iconBtn">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* 🔔 NOTIFICATIONS */}
            <div ref={notificationsRef} style={{ position: "relative" }}>
              <button
                className="al-iconBtn"
                onClick={() => setShowNotifications(prev => !prev)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <h4>Notifications</h4>

                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.isRead ? "" : "unread"}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div ref={profileMenuRef}>
              <button
                className="al-iconBtn"
                onClick={() => setShowProfileMenu(prev => !prev)}
              >
                <User size={18} />
              </button>

              {showProfileMenu && (
                <div className="al-profileMenu">
                  <button onClick={() => navigate("/profile")}>Profile</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="al-body">
        <aside className={`al-sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="al-nav">
            <NavLink to="/dashboard" className="al-link">
              <LayoutGrid size={18} /> Dashboard
            </NavLink>

            {role === "Student" && (
              <>
                <NavLink to="/browse" className="al-link">
                  <Sparkles size={18} /> Browse
                </NavLink>
                <NavLink to="/match" className="al-link">
                  <Star size={18} /> Matches
                </NavLink>
              </>
            )}

            {role === "Recruiter" && (
              <>
                <NavLink to="/organization" className="al-link">
                  <Building2 size={18} /> Posting
                </NavLink>
                <NavLink to="/applicants" className="al-link">
                  <FileText size={18} /> Applicants
                </NavLink>
              </>
            )}

            <NavLink to="/profile" className="al-link">
              <UserCircle size={18} /> Profile
            </NavLink>
          </nav>

          <div className="al-sidebarBottom">
            <div className="al-userCard">
              <div className="al-userAvatar">{avatarLetter}</div>
              <div>
                <div>{displayName}</div>
                <div>{role}</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="al-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}