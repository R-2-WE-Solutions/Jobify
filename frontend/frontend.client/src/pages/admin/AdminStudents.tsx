import { useEffect, useState } from "react";
import { Eye, FileText, Search } from "lucide-react";
import { api } from "../../api/api";
import { useTheme } from "../../layout/useTheme";
import "../styles/admin.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Student {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAtUtc?: string;
}

interface Application {
  job: string;
  company: string;
  date: string;
  status: string;
}

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const statusStyles: any = {
  Applied: { backgroundColor: "#dbeafe", color: "#1e40af" },
  Pending: { backgroundColor: "#dbeafe", color: "#1e40af" },
  Draft: { backgroundColor: "#f3f4f6", color: "#374151" },
  Shortlisted: { backgroundColor: "#f3e8ff", color: "#6b21a8" },
  Interview: { backgroundColor: "#ffedd5", color: "#c2410c" },
  Accepted: { backgroundColor: "#dcfce7", color: "#166534" },
  Rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
};

export default function AdminStudents() {
  const theme: any = useTheme();
  const darkMode = theme && theme.darkMode;

  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showApplications, setShowApplications] = useState(false);

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);

        const token = localStorage.getItem("jobify_token");

        const res = await fetch(`${API_URL}/users/by-role/Student`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) =>
    (s.fullName + s.email + s.id)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getInitials = (name?: string) =>
    name?.split(" ").map((n) => n[0]).join("") || "?";

  async function fetchStudentApplications(student: Student) {
    try {
      setLoadingApplications(true);

      const token = localStorage.getItem("jobify_token");

      const res = await fetch(
        `${API_URL}/application/by-student/${student.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const applications = await res.json();

      setSelectedStudent({
        ...student,
        applications,
      });

      setShowApplications(true);
    } finally {
      setLoadingApplications(false);
    }
  }

  return (
    <div
      className="admin-page"
      style={{
        background: darkMode ? "#0f172a" : "#f9fafb",
        color: darkMode ? "#e5e7eb" : "#111827",
      }}
    >
      {/* HEADER */}
      <div className="admin-header">
        <h1>Students</h1>
        <p>Manage student accounts</p>
      </div>

      {/* CARD */}
      <div className="admin-students-card">
        <h2>Student Management</h2>

        {/* SEARCH */}
        <div className="admin-search-wrap">
          <Search />
          <input
            className="admin-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="admin-students-table-wrap">
          <table className="admin-students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="admin-student-cell">
                      <div className="admin-student-avatar">
                        {getInitials(student.fullName)}
                      </div>
                      <span>{student.fullName}</span>
                    </div>
                  </td>

                  <td>{student.email}</td>
                  <td>{formatDateTime(student.createdAt)}</td>
                  <td>{formatDateTime(student.updatedAtUtc)}</td>

                  <td>
                    <button
                      className="admin-btn admin-btn-primary"
                      onClick={() => fetchStudentApplications(student)}
                    >
                      Applications
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showApplications && selectedStudent && (
        <div className="admin-modal-overlay">
          <div className="admin-students-modal">
            <h2>{selectedStudent.fullName}</h2>

            {!selectedStudent.applications?.length ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  background: darkMode ? "#1f2937" : "#f9fafb",
                  color: darkMode ? "#94a3b8" : "#6b7280",
                }}
              >
                No applications yet
              </div>
            ) : (
              selectedStudent.applications.map((app: any, i: number) => (
                <div key={i} className="admin-students-app-card">
                  <h3>{app.job}</h3>
                  <p>{app.company}</p>
                  <span style={statusStyles[app.status]}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}