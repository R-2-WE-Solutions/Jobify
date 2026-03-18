import { useState } from "react";
import { Users, Briefcase, Building2, FileText, TrendingUp, UserPlus, Clock } from "lucide-react";

const stats = [
  { title: "Total Students", value: "1,247", icon: Users, iconColor: "#2563eb", bgColor: "#dbeafe" },
  { title: "Total Recruiters", value: "342", icon: Briefcase, iconColor: "#16a34a", bgColor: "#dcfce7" },
  { title: "Total Companies", value: "89", icon: Building2, iconColor: "#9333ea", bgColor: "#f3e8ff" },
  { title: "Total Applications", value: "5,821", icon: FileText, iconColor: "#ea580c", bgColor: "#ffedd5" },
];

const recentActivity = [
  { type: "New Student", name: "Sarah Johnson", email: "sarah.j@university.edu", time: "2 minutes ago", icon: UserPlus, iconColor: "#2563eb", bgColor: "#dbeafe" },
  { type: "New Recruiter", name: "Michael Chen", company: "TechCorp Inc.", time: "15 minutes ago", icon: Briefcase, iconColor: "#16a34a", bgColor: "#dcfce7" },
  { type: "Pending Approval", name: "Emily Brown", company: "StartupHub", time: "1 hour ago", icon: Clock, iconColor: "#ea580c", bgColor: "#ffedd5" },
  { type: "New Application", name: "David Miller", job: "Software Engineer Intern", time: "2 hours ago", icon: FileText, iconColor: "#9333ea", bgColor: "#f3e8ff" },
  { type: "New Student", name: "Jessica Lee", email: "j.lee@university.edu", time: "3 hours ago", icon: UserPlus, iconColor: "#2563eb", bgColor: "#dbeafe" },
];

export default function AdminDashboard() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Blue Gradient Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "24px",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Dashboard</h1>
        <p style={{ fontSize: "16px", opacity: 0.9 }}>Welcome to Jobify Admin Panel</p>
      </div>

      {/* Stats Cards */}
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
          return (
            <div
              key={stat.title}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: isHovered
                  ? "0 10px 25px rgba(0, 0, 0, 0.15)"
                  : "0 2px 8px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>
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
              <div style={{ fontSize: "36px", fontWeight: "700", marginBottom: "8px" }}>
                {stat.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
                <TrendingUp style={{ width: "16px", height: "16px", color: "#16a34a" }} />
                <span style={{ color: "#16a34a", fontWeight: "600" }}>+12%</span>
                <span style={{ color: "#6b7280" }}>from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Recent Activity</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  paddingBottom: "16px",
                  borderBottom: index < recentActivity.length - 1 ? "1px solid #e5e7eb" : "none",
                }}
              >
                <div
                  style={{
                    backgroundColor: activity.bgColor,
                    padding: "10px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: "20px", height: "20px", color: activity.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#f3f4f6",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      {activity.type}
                    </span>
                  </div>
                  <p style={{ fontWeight: "600", marginBottom: "2px", fontSize: "15px" }}>
                    {activity.name}
                  </p>
                  {activity.email && (
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>{activity.email}</p>
                  )}
                  {activity.company && (
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>{activity.company}</p>
                  )}
                  {activity.job && (
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>{activity.job}</p>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: "#9ca3af", flexShrink: 0 }}>
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          marginTop: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <button
            style={{
              padding: "12px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          >
            Approve Pending Recruiters
          </button>
          <button
            style={{
              padding: "12px 20px",
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            View All Students
          </button>
          <button
            style={{
              padding: "12px 20px",
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
          >
            Manage Companies
          </button>
        </div>
      </div>
    </div>
  );
}
