import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import { Plus, Trash2, ArrowLeft, Clock3, Save, Code2, ListChecks } from "lucide-react";
import "./styles/assesmentbuilder.css";

const emptyMcq = () => ({
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
});

const emptyCode = () => ({
    title: "",
    prompt: "",
    language: "javascript",
    starterCode: "",
    expectedOutput: "",
});

export default function AssessmentBuilderPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [jobTitle, setJobTitle] = useState("");

    const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
    const [mcqs, setMcqs] = useState([]);
    const [codingChallenges, setCodingChallenges] = useState([]);

    useEffect(() => {
        async function loadOpportunity() {
            try {
                setLoading(true);
                const res = await api.get(`/opportunities/${id}`);
                const opp = res.data;

                setJobTitle(opp.title || "");

                if (opp.assessment) {
                    setTimeLimitMinutes(
                        opp.assessment.timeLimitMinutes ||
                        Math.max(1, Math.floor((opp.assessmentTimeLimitSeconds || 1800) / 60))
                    );

                    setMcqs(Array.isArray(opp.assessment.mcqs) ? opp.assessment.mcqs : []);
                    setCodingChallenges(
                        Array.isArray(opp.assessment.codingChallenges)
                            ? opp.assessment.codingChallenges
                            : []
                    );
                } else {
                    setTimeLimitMinutes(
                        Math.max(1, Math.floor((opp.assessmentTimeLimitSeconds || 1800) / 60))
                    );
                    setMcqs([]);
                    setCodingChallenges([]);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load opportunity.");
                navigate("/organization");
            } finally {
                setLoading(false);
            }
        }

        loadOpportunity();
    }, [id, navigate]);

    const totalQuestions = useMemo(
        () => mcqs.length + codingChallenges.length,
        [mcqs, codingChallenges]
    );

    function addMcq() {
        setMcqs((prev) => [...prev, emptyMcq()]);
    }

    function removeMcq(index) {
        setMcqs((prev) => prev.filter((_, i) => i !== index));
    }

    function updateMcq(index, patch) {
        setMcqs((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    }

    function updateMcqOption(qIndex, optIndex, value) {
        setMcqs((prev) =>
            prev.map((q, i) =>
                i === qIndex
                    ? {
                        ...q,
                        options: q.options.map((opt, j) => (j === optIndex ? value : opt)),
                    }
                    : q
            )
        );
    }

    function addCode() {
        setCodingChallenges((prev) => [...prev, emptyCode()]);
    }

    function removeCode(index) {
        setCodingChallenges((prev) => prev.filter((_, i) => i !== index));
    }

    function updateCode(index, patch) {
        setCodingChallenges((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    }

    function validateAssessment() {
        for (let i = 0; i < mcqs.length; i++) {
            const q = mcqs[i];
            if (!q.prompt.trim()) return `MCQ ${i + 1}: question is required.`;
            if (!Array.isArray(q.options) || q.options.length < 2) {
                return `MCQ ${i + 1}: add at least 2 options.`;
            }
            if (q.options.some((x) => !String(x).trim())) {
                return `MCQ ${i + 1}: all options must be filled.`;
            }
            if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
                return `MCQ ${i + 1}: choose a valid correct answer.`;
            }
        }

        for (let i = 0; i < codingChallenges.length; i++) {
            const q = codingChallenges[i];
            if (!q.title.trim()) return `Coding question ${i + 1}: title is required.`;
            if (!q.prompt.trim()) return `Coding question ${i + 1}: prompt is required.`;
        }

        if (timeLimitMinutes <= 0) return "Time limit must be greater than 0.";
        return null;
    }

    async function saveAssessment() {
        const err = validateAssessment();
        if (err) {
            alert(err);
            return;
        }

        setSaving(true);

        try {
            const oppRes = await api.get(`/opportunities/${id}`);
            const opp = oppRes.data;

            const payload = {
                title: opp.title,
                companyName: opp.companyName,
                location: opp.location,
                locationName: opp.locationName,
                fullAddress: opp.fullAddress,
                type: opp.type,
                level: opp.level,
                workMode: opp.workMode,
                minPay: opp.minPay,
                maxPay: opp.maxPay,
                description: opp.description,
                deadlineUtc: opp.deadlineUtc,
                responsibilities: opp.responsibilities || [],
                benefits: opp.benefits || [],
                preferredSkills: opp.preferredSkills || [],
                skills: opp.skills || [],
                latitude: opp.latitude,
                longitude: opp.longitude,
                assessment: {
                    timeLimitMinutes,
                    mcqs,
                    codingChallenges,
                },
            };

            await api.put(`/opportunities/${id}`, payload);
            alert("Assessment saved successfully.");
            navigate("/organization");
        } catch (err) {
            console.error(err);
            alert("Failed to save assessment.");
        } finally {
            setSaving(false);
        }
    }

    async function removeAssessment() {
        if (!window.confirm("Remove this assessment from the opportunity?")) return;

        setSaving(true);
        try {
            const oppRes = await api.get(`/opportunities/${id}`);
            const opp = oppRes.data;

            const payload = {
                title: opp.title,
                companyName: opp.companyName,
                location: opp.location,
                locationName: opp.locationName,
                fullAddress: opp.fullAddress,
                type: opp.type,
                level: opp.level,
                workMode: opp.workMode,
                minPay: opp.minPay,
                maxPay: opp.maxPay,
                description: opp.description,
                deadlineUtc: opp.deadlineUtc,
                responsibilities: opp.responsibilities || [],
                benefits: opp.benefits || [],
                preferredSkills: opp.preferredSkills || [],
                skills: opp.skills || [],
                latitude: opp.latitude,
                longitude: opp.longitude,
                assessment: null,
            };

            await api.put(`/opportunities/${id}`, payload);
            alert("Assessment removed.");
            navigate("/organization");
        } catch (err) {
            console.error(err);
            alert("Failed to remove assessment.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="assessment-page"><div className="assessment-card">Loading assessment...</div></div>;
    }

    return (
        <div className="assessment-page">
            <div className="assessment-card">
                <div className="assessment-topbar">
                    <button className="assessment-back" onClick={() => navigate("/organization")}>
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <div>
                        <h1 className="assessment-title">Assessment Builder</h1>
                        <p className="assessment-subtitle">{jobTitle || "Opportunity Assessment"}</p>
                    </div>
                </div>

                <div className="assessment-summary">
                    <div className="assessment-stat">
                        <Clock3 size={16} />
                        <span>Time Limit</span>
                        <strong>{timeLimitMinutes} min</strong>
                    </div>

                    <div className="assessment-stat">
                        <ListChecks size={16} />
                        <span>MCQs</span>
                        <strong>{mcqs.length}</strong>
                    </div>

                    <div className="assessment-stat">
                        <Code2 size={16} />
                        <span>Coding</span>
                        <strong>{codingChallenges.length}</strong>
                    </div>

                    <div className="assessment-stat">
                        <span>Total</span>
                        <strong>{totalQuestions}</strong>
                    </div>
                </div>

                <div className="assessment-field">
                    <label>Time Limit (minutes)</label>
                    <input
                        type="number"
                        min="1"
                        className="assessment-input"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    />
                </div>

                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h2>MCQ Questions</h2>
                        <button className="assessment-btn assessment-btn-outline" onClick={addMcq}>
                            <Plus size={15} />
                            Add MCQ
                        </button>
                    </div>

                    {mcqs.length === 0 && (
                        <div className="assessment-empty">No MCQs added yet.</div>
                    )}

                    {mcqs.map((q, index) => (
                        <div key={index} className="assessment-question-card">
                            <div className="assessment-question-top">
                                <h3>MCQ {index + 1}</h3>
                                <button
                                    className="assessment-icon-btn danger"
                                    onClick={() => removeMcq(index)}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="assessment-field">
                                <label>Question</label>
                                <textarea
                                    className="assessment-textarea"
                                    value={q.prompt}
                                    onChange={(e) => updateMcq(index, { prompt: e.target.value })}
                                />
                            </div>

                            <div className="assessment-options">
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="assessment-option-row">
                                        <input
                                            className="assessment-input"
                                            placeholder={`Option ${optIndex + 1}`}
                                            value={opt}
                                            onChange={(e) =>
                                                updateMcqOption(index, optIndex, e.target.value)
                                            }
                                        />
                                        <label className="assessment-radio-label">
                                            <input
                                                type="radio"
                                                name={`correct-${index}`}
                                                checked={q.correctIndex === optIndex}
                                                onChange={() =>
                                                    updateMcq(index, { correctIndex: optIndex })
                                                }
                                            />
                                            Correct
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="assessment-section">
                    <div className="assessment-section-header">
                        <h2>Coding Challenges</h2>
                        <button className="assessment-btn assessment-btn-outline" onClick={addCode}>
                            <Plus size={15} />
                            Add Coding Question
                        </button>
                    </div>

                    {codingChallenges.length === 0 && (
                        <div className="assessment-empty">No coding challenges added yet.</div>
                    )}

                    {codingChallenges.map((q, index) => (
                        <div key={index} className="assessment-question-card">
                            <div className="assessment-question-top">
                                <h3>Coding Question {index + 1}</h3>
                                <button
                                    className="assessment-icon-btn danger"
                                    onClick={() => removeCode(index)}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="assessment-field">
                                <label>Title</label>
                                <input
                                    className="assessment-input"
                                    value={q.title}
                                    onChange={(e) => updateCode(index, { title: e.target.value })}
                                />
                            </div>

                            <div className="assessment-field">
                                <label>Prompt</label>
                                <textarea
                                    className="assessment-textarea"
                                    value={q.prompt}
                                    onChange={(e) => updateCode(index, { prompt: e.target.value })}
                                />
                            </div>

                            <div className="assessment-field">
                                <label>Language</label>
                                <select
                                    className="assessment-input"
                                    value={q.language}
                                    onChange={(e) => updateCode(index, { language: e.target.value })}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="csharp">C#</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                </select>
                            </div>

                            <div className="assessment-field">
                                <label>Starter Code</label>
                                <textarea
                                    className="assessment-code"
                                    value={q.starterCode}
                                    onChange={(e) =>
                                        updateCode(index, { starterCode: e.target.value })
                                    }
                                />
                            </div>

                            <div className="assessment-field">
                                <label>Expected Output / Notes</label>
                                <textarea
                                    className="assessment-textarea"
                                    value={q.expectedOutput}
                                    onChange={(e) =>
                                        updateCode(index, { expectedOutput: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="assessment-actions">
                    <button className="assessment-btn assessment-btn-danger" onClick={removeAssessment}>
                        Remove Assessment
                    </button>

                    <button
                        className="assessment-btn assessment-btn-primary"
                        onClick={saveAssessment}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save Assessment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
