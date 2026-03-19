import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/interviews/recruiter")
      .then(res => setInterviews(res.data))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading interviews...</div>;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Recruiter Interviews</h1>

      {interviews.length === 0 ? (
        <p>No interviews scheduled yet.</p>
      ) : (
        <ul>
          {interviews.map(i => (
            <li key={i.id}>
              <strong>{i.opportunityTitle}</strong> — {i.companyName}
              <br />
              {new Date(i.scheduledAtUtc).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}