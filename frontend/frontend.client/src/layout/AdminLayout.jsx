import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Building2,
    AlertTriangle,
    Shield,
    LogOut,
    Menu,
    X,
    Sun,
    Moon,
} from "lucide-react";
import { useTheme } from "../layout/useTheme";

const lightColors = {
    pageBg: "#f6f7fb",
    sidebarBg: "#ffffff",
    sidebarBorder: "#e5e7eb",
    logoBadgeBg: "#eff6ff",
    logoSubtext: "#64748b",
    navText: "#0f172a",
    navActiveText: "#ffffff",
    navActiveBg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    profileCardBg: "linear-gradient(180deg, #ffffff, #f8fafc)",
    profileCardBorder: "#e5e7eb",
    logoutBg: "#fee2e2",
    logoutBorder: "#fecaca",
    logoutText: "#b91c1c",
    toggleBg: "#ffffff",
    toggleBorder: "#e5e7eb",
};

const darkColors = {
    pageBg: "#0f172a",
    sidebarBg: "#111827",
    sidebarBorder: "#1f2937",
    logoBadgeBg: "#1e3a8a",
    logoSubtext: "#94a3b8",
    navText: "#e5e7eb",
    navActiveText: "#ffffff",
    navActiveBg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    profileCardBg: "linear-gradient(180deg, #1f2937, #111827)",
    profileCardBorder: "#334155",
    logoutBg: "#451a1a",
    logoutBorder: "#7f1d1d",
    logoutText: "#fecaca",
    toggleBg: "#111827",
    toggleBorder: "#334155",
};

const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/recruiters", label: "Recruiters", icon: Briefcase },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/companies", label: "Companies", icon: Building2 },
    { to: "/admin/reported-opportunities", label: "Reported Opportunities", icon: AlertTriangle },
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useTheme();
    const colors = darkMode ? darkColors : lightColors;

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);

            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const storedUser = JSON.parse(localStorage.getItem("jobify_user") || "{}");
    const adminEmail = storedUser?.email || "admin@jobify.com";

    const handleLogout = () => {
        localStorage.removeItem("jobify_token");
        localStorage.removeItem("jobify_user");
        navigate("/login", { replace: true });
    };

    return (
        <div
            className={darkMode ? "admin-shell admin-dark" : "admin-shell"}
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: colors.pageBg,
                color: colors.navText,
                flexDirection: isMobile ? "column" : "row",
            }}
        >
            <button
                onClick={toggleTheme}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                    position: "fixed",
                    top: "18px",
                    right: "22px",
                    zIndex: 1300,
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    border: `1px solid ${colors.toggleBorder}`,
                    background: colors.toggleBg,
                    color: colors.navText,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: darkMode
                        ? "0 12px 28px rgba(0, 0, 0, 0.35)"
                        : "0 12px 28px rgba(15, 23, 42, 0.12)",
                }}
            >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {isMobile && (
                <header
                    style={{
                        height: "64px",
                        background: colors.sidebarBg,
                        borderBottom: `1px solid ${colors.sidebarBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 16px",
                        position: "sticky",
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: colors.logoBadgeBg,
                                color: "#60a5fa",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Shield size={20} />
                        </div>

                        <div>
                            <div style={{ fontSize: "18px", fontWeight: 700 }}>Jobify</div>
                            <div style={{ fontSize: "12px", color: colors.logoSubtext }}>
                                Admin Panel
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: colors.navText,
                            marginRight: "52px",
                        }}
                    >
                        <Menu size={24} />
                    </button>
                </header>
            )}

            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        zIndex: 1001,
                    }}
                />
            )}

            <aside
                style={{
                    width: isMobile ? "min(82vw, 280px)" : "260px",
                    background: colors.sidebarBg,
                    color: colors.navText,
                    padding: "24px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: isMobile ? "fixed" : "sticky",
                    top: 0,
                    left: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
                    height: "100vh",
                    borderRight: `1px solid ${colors.sidebarBorder}`,
                    zIndex: 1002,
                    transition: "left 0.25s ease",
                    boxShadow: isMobile && sidebarOpen ? "0 10px 30px rgba(0,0,0,0.35)" : "none",
                }}
            >
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                            marginBottom: "32px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "10px",
                                    backgroundColor: colors.logoBadgeBg,
                                    color: "#60a5fa",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Shield size={20} />
                            </div>

                            <div>
                                <div style={{ fontSize: "20px", fontWeight: 700 }}>Jobify</div>
                                <div style={{ fontSize: "13px", color: colors.logoSubtext }}>
                                    Admin Panel
                                </div>
                            </div>
                        </div>

                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: colors.navText,
                                }}
                            >
                                <X size={22} />
                            </button>
                        )}
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isDashboard = item.to === "/admin";

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={isDashboard}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                    style={({ isActive }) => ({
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        textDecoration: "none",
                                        color: isActive ? colors.navActiveText : colors.navText,
                                        padding: "12px 14px",
                                        borderRadius: "10px",
                                        background: isActive ? colors.navActiveBg : "transparent",
                                        border: "1px solid transparent",
                                        fontWeight: 600,
                                        transition: "all 0.2s ease",
                                        whiteSpace: "nowrap",
                                    })}
                                >
                                    <Icon size={18} style={{ flexShrink: 0 }} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <div
                        style={{
                            background: colors.profileCardBg,
                            borderRadius: "12px",
                            padding: "14px",
                            marginBottom: "12px",
                            border: `1px solid ${colors.profileCardBorder}`,
                            minWidth: 0,
                        }}
                    >
                        <div style={{ fontSize: "14px", fontWeight: 700 }}>Admin</div>
                        <div
                            style={{
                                fontSize: "12px",
                                color: colors.logoSubtext,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {adminEmail}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: `1px solid ${colors.logoutBorder}`,
                            backgroundColor: colors.logoutBg,
                            color: colors.logoutText,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            <main
                className="admin-main"
                style={{
                    flex: 1,
                    width: "100%",
                    minWidth: 0,
                    backgroundColor: colors.pageBg,
                }}
            >
                <Outlet />
            </main>
        </div>
    );
}