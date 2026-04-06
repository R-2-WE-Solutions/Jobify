import { useEffect, useState } from "react";
import { Eye, FileText, Search } from "lucide-react";
import { api } from "../../api/api";


// Student Interface
const API_URL = import.meta.env.VITE_API_URL;

interface Student {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
    updatedAtUtc?: string;
}

// Application Interface
interface Application {
    job: string;
    company: string;
    date: string;
    status: string;
}

const formatDateTime = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const statusStyles: { [key: string]: { backgroundColor: string; color: string } } = {
    Applied: { backgroundColor: "#dbeafe", color: "#1e40af" },
    Pending: { backgroundColor: "#dbeafe", color: "#1e40af" },
    Draft: { backgroundColor: "#f3f4f6", color: "#374151" },
    Shortlisted: { backgroundColor: "#f3e8ff", color: "#6b21a8" },
    Interview: { backgroundColor: "#ffedd5", color: "#c2410c" },
    Accepted: { backgroundColor: "#dcfce7", color: "#166534" },
    Rejected: { backgroundColor: "#fee2e2", color: "#991b1b" },
};

export default function AdminStudents() {
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<(Student & { applications?: Application[] }) | null>(null);

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
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.log("Error in Fetching Students: ", err);
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter((student) => {
        const fullName = student.fullName ?? "";
        const email = student.email ?? "";
        const id = student.id ?? "";

        return (
            fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("");
  };

  // Loading Students
  if(loadingStudents) {
    return(
      <div style={{ padding: "24px" }}>
        <p>Loading Students...</p>
      </div>
    );
  }

  // Delete Student
  async function deleteStudent(student: Student){
    try {
      api.delete(`admin/students/${student.id}`);

      console.log("Student Deleted Successfully!");
    }
    catch (error) {
      console.error("Error in Deleting Student: ", error);
    }
  }

  // Fetching Applications
  async function fetchStudentApplications(student: Student){
    try {
      setLoadingApplications(true);

            const token = localStorage.getItem("jobify_token");

            const res = await fetch(`${API_URL}/application/by-student/${student.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const applications = await res.json();

            setSelectedStudent({
                ...student,
                applications: Array.isArray(applications) ? applications : [],
            });

            setShowApplications(true);
        } catch (err) {
            console.log("Error in fetching applications:", err);
        } finally {
            setLoadingApplications(false);
        }
    }

    const handleSendNotification = async () => {
        if (!selectedStudentId) return;

        if (!notifyMessage.trim()) {
            alert("Message is required");
            return;
        }

        try {
            const token = localStorage.getItem("jobify_token");

            const res = await fetch(`${API_URL}/users/admin/students/${selectedStudentId}/notify`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: notifyTitle,
                    message: notifyMessage,
                }),
            });

            if (!res.ok) throw new Error("Failed");

            alert("Notification sent ✅");
            setShowNotifyModal(false);
            setNotifyTitle("");
            setNotifyMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to send ❌");
        }
    };

    if (loadingStudents) {
        return (
            <div className="admin-page">
                <div className="admin-students-card">
                    <p>Loading Students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Students</h1>
                <p>Manage student accounts and view their applications</p>
            </div>

            <div className="admin-students-card">
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
                    Student Management
                </h2>

                <div className="admin-search-wrap">
                    <Search
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "16px",
                            height: "16px",
                            color: "#9ca3af",
                        }}
                    />
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search by name, email, or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

        {/* Students Table */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Student
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Student ID
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Email
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Created At
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Last Updated
                </th>
                <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onMouseEnter={() => setHoveredRow(student.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: hoveredRow === student.id ? "#f9fafb" : "white",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          {getInitials(student.fullName)}
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>{student.fullName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6" }}>
                      <code
                        style={{
                          backgroundColor: "#f3f4f6",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontFamily: "monospace",
                        }}
                      >
                        {student.id}
                      </code>
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {student.email}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {student.createdAt}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", color: "#6b7280", fontSize: "14px" }}>
                      {student.updatedAtUtc}
                    </td>
                    <td style={{ padding: "16px", borderTop: "1px solid #f3f4f6", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        <button
                          onClick={() => {
                            fetchStudentApplications(student)
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
                        >
                          <FileText style={{ width: "14px", height: "14px" }} />
                          Applications
                        </button>
                          <button
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setNotifyTitle("Warning ⚠️"); // optional default
                              setNotifyMessage("");
                              setShowNotifyModal(true);
                            }}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#55e75f",
                              color: "#ffffff",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s",
                            }}
                          >
                            Notify
                          </button>
                        <button
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "white",
                            color: "#374151",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s",
                          }}
                          onClick={ () => deleteStudent(student)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                        >
                            Delete 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

            {showApplications && selectedStudent && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setShowApplications(false)}
                >
                    <div
                        className="admin-students-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-students-modal-header">
                            <div>
                                <h2 className="admin-students-modal-title">
                                    Applications - {selectedStudent.fullName}
                                </h2>
                                <p className="admin-students-modal-subtitle">
                                    {selectedStudent.email}
                                </p>
                            </div>

                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setShowApplications(false)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="admin-students-app-list">
                            {loadingApplications ? (
                                <div className="admin-empty-state">Loading applications...</div>
                            ) : !selectedStudent.applications || selectedStudent.applications.length === 0 ? (
                                <div
                                    style={{
                                        padding: "48px",
                                        textAlign: "center",
                                        color: "#9ca3af",
                                        backgroundColor: "#f9fafb",
                                        borderRadius: "8px",
                                    }}
                                >
                                    No applications yet
                                </div>
                            ) : (
                                selectedStudent.applications.map((app, index) => (
                                    <div key={index} className="admin-students-app-card">
                                        <div className="admin-students-app-top">
                                            <div>
                                                <h3 className="admin-students-app-job">{app.job}</h3>
                                                <p className="admin-students-app-company">{app.company}</p>
                                                <p className="admin-students-app-date">
                                                    Submitted on {formatDateTime(app.date)}
                                                </p>
                                            </div>

                                            <span
                                                className="admin-students-status"
                                                style={statusStyles[app.status] || {
                                                    backgroundColor: "#f3f4f6",
                                                    color: "#374151",
                                                }}
                                            >
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showNotifyModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-notify-modal">
                        <h3 className="admin-notify-title">Send Notification</h3>

                        <input
                            type="text"
                            placeholder="Title"
                            value={notifyTitle}
                            onChange={(e) => setNotifyTitle(e.target.value)}
                            className="admin-notify-input"
                        />

                        <textarea
                            placeholder="Message"
                            value={notifyMessage}
                            onChange={(e) => setNotifyMessage(e.target.value)}
                            className="admin-notify-textarea"
                        />

                        <div className="admin-notify-actions">
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => setShowNotifyModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={handleSendNotification}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
