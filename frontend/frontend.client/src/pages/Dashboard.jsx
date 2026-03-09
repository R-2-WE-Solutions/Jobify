import { useEffect, useState } from "react";
import { getCandidateDashboard } from "../services/dashboardService";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getCandidateDashboard();
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "24px", fontSize: "18px" }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "8px", fontSize: "28px" }}>
        Welcome back, {data.fullName} 👋
      </h1>
      <p style={{ marginBottom: "24px", color: "#555" }}>
        Here is your job activity overview.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px"
        }}
      >
        <StatCard title="Profile Completion" value={`${data.profileCompletionPercentage}%`} />
        <StatCard title="Skills Added" value={data.skillsCount} />
        <StatCard title="Applications" value={data.applicationsCount} />
        <StatCard title="Matches Found" value={data.matchesCount} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px"
        }}
      >
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Recommended Opportunities</h2>

          {data.recommendedOpportunities.length === 0 ? (
            <p style={{ color: "#666" }}>No recommendations yet. Complete your profile and add skills.</p>
          ) : (
            data.recommendedOpportunities.map((job) => (
              <OpportunityCard key={job.id} job={job} showScore={true} />
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <ActionButton text="Browse Jobs" onClick={() => window.location.href = "/browse"} />
              <ActionButton text="View Matches" onClick={() => window.location.href = "/matches"} />
              <ActionButton text="Edit Profile" onClick={() => window.location.href = "/profile"} />
              <ActionButton text="Get Recommendations" onClick={() => window.location.href = "/match"} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Recent Opportunities</h2>
            {data.recentOpportunities.length === 0 ? (
              <p style={{ color: "#666" }}>No opportunities found.</p>
            ) : (
              data.recentOpportunities.map((job) => (
                <OpportunityCard key={job.id} job={job} showScore={false} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ color: "#666", marginBottom: "8px", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>{value}</div>
    </div>
  );
}

function OpportunityCard({ job, showScore }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "16px",
        marginBottom: "14px",
        background: "#fff"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
        <div>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "18px" }}>{job.title}</h3>
          <p style={{ margin: "0 0 4px 0", color: "#555" }}>{job.companyName}</p>
          <p style={{ margin: 0, color: "#777", fontSize: "14px" }}>
            {job.location} • {job.workMode}
          </p>
        </div>

        {showScore && job.matchScore !== null && (
          <div
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
              padding: "8px 12px",
              borderRadius: "999px",
              fontWeight: "bold",
              height: "fit-content"
            }}
          >
            {job.matchScore}% match
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: "12px",
        border: "none",
        background: "#2563eb",
        color: "white",
        fontWeight: "600",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}

const sectionStyle = {
  background: "white",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "20px"
};