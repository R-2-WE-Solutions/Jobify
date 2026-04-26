import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  UserPlus,
  Clock,
} from "lucide-react";
import { api } from "../../api/api";
import { useTheme } from "../../layout/useTheme";


const getActivityIcon = (type: string) => {
  switch (type) {
    case "New Student":
      return { icon: UserPlus, color: "#2563eb", bg: "#dbeafe", darkBg: "#1e3a8a" };
    case "New Recruiter":
      return { icon: Briefcase, color: "#16a34a", bg: "#dcfce7", darkBg: "#14532d" };
    case "New Application":
      return { icon: FileText, color: "#9333ea", bg: "#f3e8ff", darkBg: "#581c87" };
    case "New Opportunity":
      return { icon: Building2, color: "#ea580c", bg: "#ffedd5", darkBg: "#7c2d12" };
    default:
      return { icon: Clock, color: "#6b7280", bg: "#f3f4f6", darkBg: "#1f2937" };
  }
};

export default function AdminDashboard() {
  const theme: any = useTheme();
const darkMode = theme && theme.darkMode ? true : false;
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [dashboard, setDashboard] = useState<any>();
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [systemOverview, setSystemOverview] = useState<any>([]);
  const [loadingSystemOverview, setLoadingSystemOverview] = useState(false);

  const pageBg = darkMode ? "#0f172a" : "#f9fafb";
  const cardBg = darkMode ? "#111827" : "#ffffff";
  const cardBorder = darkMode ? "#334155" : "#e5e7eb";
  const mainText = darkMode ? "#f8fafc" : "#111827";
  const mutedText = darkMode ? "#94a3b8" : "#6b7280";
  const softBg = darkMode ? "#1f2937" : "#f3f4f6";
  const shadow = darkMode
    ? "0 12px 30px rgba(0, 0, 0, 0.35)"
    : "0 2px 8px rgba(0, 0, 0, 0.08)";
  const hoverShadow = darkMode
    ? "0 18px 36px rgba(0, 0, 0, 0.45)"
    : "0 10px 25px rgba(0, 0, 0, 0.15)";

  async function fetchDashboard() {
    try {
      const res = await api.get("/users/admin/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.error("Error in Fetching Dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function fetchSystemOverview() {
    try {
      setLoadingSystemOverview(true);
      const res = await api.get("/users/admin/system-overview");
      setSystemOverview(res.data);
    } catch (err) {
      console.error("Error in Fetching System Overview: ", err);
    } finally {
      setLoadingSystemOverview(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
    fetchSystemOverview();
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: dashboard?.totalStudents ?? "--",
      trend: dashboard?.studentsTrendPercent,
      icon: Users,
      iconColor: "#2563eb",
      bgColor: darkMode ? "#1e3a8a" : "#dbeafe",
    },
    {
      title: "Total Recruiters",
      value: dashboard?.totalRecruiters ?? "--",
      trend: dashboard?.recruitersTrendPercent,
      icon: Briefcase,
      iconColor: "#16a34a",
      bgColor: darkMode ? "#14532d" : "#dcfce7",
    },
    {
      title: "Total Companies",
      value: dashboard?.totalCompanies ?? "--",
      trend: dashboard?.companiesTrendPercent,
      icon: Building2,
      iconColor: "#9333ea",
      bgColor: darkMode ? "#581c87" : "#f3e8ff",
    },
    {
      title: "Total Applications",
      value: dashboard?.totalApplications ?? "--",
      trend: dashboard?.applicationsTrendPercent,
      icon: FileText,
      iconColor: "#ea580c",
      bgColor: darkMode ? "#7c2d12" : "#ffedd5",
    },
  ];

  return (
    <div
      className="admin-page"
      style={{
        padding: "24px",
        backgroundColor: pageBg,
        minHeight: "100vh",
        color: mainText,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
          color: "white",
          border: darkMode ? "1px solid #334155" : "none",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.9 }}>
          Welcome to Jobify Admin Panel
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isHovered = hoveredCard === index;

          const trendValue = typeof stat.trend === "number" ? stat.trend : null;
          const trendColor =
            trendValue === null
              ? mutedText
              : trendValue > 0
              ? "#16a34a"
              : trendValue < 0
              ? "#dc2626"
              : mutedText;
          const TrendIcon =
            trendValue === null || trendValue === 0
              ? Minus
              : trendValue > 0
              ? TrendingUp
              : TrendingDown;
          const trendText =
            trendValue === null ? "--" : `${trendValue > 0 ? "+" : ""}${trendValue}%`;

          return (
            <div
              key={stat.title}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: cardBg,
                borderRadius: "12px",
                padding: "24px",
                border: `1px solid ${cardBorder}`,
                boxShadow: isHovered ? hoverShadow : shadow,
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "14px", color: mutedText, fontWeight: "500" }}>
                  {stat.title}
                </span>

                <div
                  style={{
                    backgroundColor: stat.bgColor,
                    padding: "8px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px", color: stat.iconColor }} />
                </div>
              </div>

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: mainText,
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "14px",
                }}
              >
                <TrendIcon style={{ width: "16px", height: "16px", color: trendColor }} />
                <span style={{ color: trendColor, fontWeight: "600" }}>{trendText}</span>
                <span style={{ color: mutedText }}>from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: "12px",
          padding: "24px",
          border: `1px solid ${cardBorder}`,
          boxShadow: shadow,
          marginTop: "24px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "20px",
            color: mainText,
          }}
        >
          System Overview
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                color: mainText,
              }}
            >
              Recruiter Status
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Pending Verification</span>
                <span style={{ fontWeight: "600", color: mainText }}>
                  {systemOverview?.pendingVerification ?? "--"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Pending Approval</span>
                <span style={{ fontWeight: "600", color: mainText }}>
                  {systemOverview?.pendingApproval ?? "--"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Verified</span>
                <span style={{ fontWeight: "600", color: mainText }}>
                  {systemOverview?.verifiedRecruiters ?? "--"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Rejected</span>
                <span style={{ fontWeight: "600", color: "#dc2626" }}>
                  {systemOverview?.rejectedRecruiters ?? "--"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                color: mainText,
              }}
            >
              Platform Health
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Active Users</span>
                <span style={{ fontWeight: "600", color: mainText }}>
                  {systemOverview?.activeUsers ?? "--"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>New Signups (24h)</span>
                <span style={{ fontWeight: "600", color: mainText }}>
                  {systemOverview?.newSignups ?? "--"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: mutedText }}>Pending Actions</span>
                <span style={{ fontWeight: "600", color: "#ea580c" }}>
                  {systemOverview?.pendingActions ?? "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: cardBg,
          borderRadius: "12px",
          padding: "24px",
          border: `1px solid ${cardBorder}`,
          boxShadow: shadow,
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "20px",
            color: mainText,
          }}
        >
          Recent Activity
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {dashboard?.recentActivity?.map((activity: any, index: number) => {
            const { icon: Icon, color, bg, darkBg } = getActivityIcon(activity.type);

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  paddingBottom: "16px",
                  borderBottom:
                    index < dashboard.recentActivity.length - 1
                      ? `1px solid ${cardBorder}`
                      : "none",
                }}
              >
                <div
                  style={{
                    backgroundColor: darkMode ? darkBg : bg,
                    padding: "10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px", color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: softBg,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: darkMode ? "#e5e7eb" : "#374151",
                      }}
                    >
                      {activity.type}
                    </span>
                  </div>

                  <p
                    style={{
                      fontWeight: "600",
                      marginBottom: "2px",
                      fontSize: "15px",
                      color: mainText,
                    }}
                  >
                    {activity.name}
                  </p>

                  {activity.email && (
                    <p style={{ fontSize: "14px", color: mutedText }}>{activity.email}</p>
                  )}

                  {activity.company && (
                    <p style={{ fontSize: "14px", color: mutedText }}>{activity.company}</p>
                  )}

                  {activity.job && (
                    <p style={{ fontSize: "14px", color: mutedText }}>{activity.job}</p>
                  )}
                </div>

                <span style={{ fontSize: "12px", color: mutedText, flexShrink: 0 }}>
                  {activity.time}
                </span>
              </div>
            );
          })}

          {!dashboard?.recentActivity?.length && (
            <div style={{ color: mutedText, fontSize: "14px" }}>
              No recent activity found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}