import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";


//Frontend only half backend lol.... just wanted to check how it will look
function msToClock(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

export default function AssessmentPage() {
    const { applicationId } = useParams();
    const nav = useNavigate();

    const [data, setData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [runOutput, setRunOutput] = useState(null);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const tickRef = useRef(null);
    const saveRef = useRef(null);

    const expiresAt = useMemo(() => {
        const x = data?.attempt?.expiresAtUtc;
        return x ? new Date(x).getTime() : null;
    }, [data]);

    const [now, setNow] = useState(Date.now());
    const remainingMs = expiresAt ? (expiresAt - now) : null;

    useEffect(() => {
        (async () => {
            const res = await api.get(`/api/Applications/${applicationId}`);
            setData(res.data);
            setAnswers(res.data?.attempt?.savedAnswers || {});
        })();
    }, [applicationId]);

    useEffect(() => {
        tickRef.current = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(tickRef.current);
    }, []);
    useEffect(() => {
        saveRef.current = setInterval(async () => {
            try {
                setSaving(true);
                await api.put(`/api/Applications/${applicationId}/assessment`, { answers });
            } catch { }
            setSaving(false);
        }, 5000);

        return () => clearInterval(saveRef.current);
    }, [applicationId, answers]);

    const sendProctor = async (type) => {
        try {
            await api.post(`/api/Applications/${applicationId}/assessment/proctor-event`, {
                type,
                details: { at: new Date().toISOString() },
            });
        } catch { }
    };

    useEffect(() => {
        const onVis = () => {
            if (document.hidden) sendProctor("VISIBILITY_HIDDEN");
        };
        const onBlur = () => sendProctor("WINDOW_BLUR");
        const onCopy = (e) => { e.preventDefault(); sendProctor("COPY"); };
        const onPaste = (e) => { e.preventDefault(); sendProctor("PASTE"); };

        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("blur", onBlur);
        document.addEventListener("copy", onCopy);
        document.addEventListener("paste", onPaste);

        return () => {
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("blur", onBlur);
            document.removeEventListener("copy", onCopy);
            document.removeEventListener("paste", onPaste);
        };
    }, [applicationId]);

    useEffect(() => {
        if (remainingMs !== null && remainingMs <= 0 && data?.status !== "Submitted") {
            submit();
        }
    }, [remainingMs]);

    if (!data) return <div style={{ padding: 20 }}>Loading…</div>;
    const assessment = data.assessment;
    if (!assessment) return <div style={{ padding: 20 }}>No assessment found.</div>;

    const questions = assessment.questions || [];

    const setMcq = (qid, idx) => {
        setAnswers((a) => ({ ...a, [qid]: idx }));
    };

    const setCode = (qid, patch) => {
        setAnswers((a) => ({
            ...a,
            [qid]: {
                languageId: a[qid]?.languageId ?? 71,
                code: a[qid]?.code ?? "",
                ...patch,
            },
        }));
    };

    const run = async (qid) => {
        const a = answers[qid] || {};
        setRunOutput(null);
        const res = await api.post(`/api/Applications/${applicationId}/assessment/run`, {
            questionId: qid,
            languageId: a.languageId ?? 71,
            sourceCode: a.code ?? "",
        });
        setRunOutput(res.data);
    };

    const submit = async () => {
        if (submitting) return;
        try {
            setSubmitting(true);
            await api.put(`/api/Applications/${applicationId}/assessment`, { answers });
            const res = await api.post(`/api/Applications/${applicationId}/assessment/submit`);
            nav(`/application/${applicationId}/result`, { state: res.data });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Assessment</h1>
                <div style={{ fontFamily: "monospace" }}>
                    Time left: {remainingMs === null ? "—" : msToClock(remainingMs)}{" "}
                    {saving ? " • saving…" : ""}
                </div>
            </div>

            {data.attempt?.flagged && (
                <div style={{ padding: 12, borderRadius: 10, border: "1px solid #ef4444", marginBottom: 12 }}>
                    <b>Flagged:</b> {data.attempt.flagReason || "Suspicious behavior detected."}
                </div>
            )}

            {questions.map((q) => (
                <div key={q.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    {q.type === "mcq" ? (
                        <>
                            <div style={{ fontWeight: 700 }}>{q.prompt}</div>
                            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                                {(q.options || []).map((opt, idx) => (
                                    <label key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <input
                                            type="radio"
                                            name={q.id}
                                            checked={answers[q.id] === idx}
                                            onChange={() => setMcq(q.id, idx)}
                                        />
                                        <span>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 800 }}>{q.title || "Coding Question"}</div>
                                    <div style={{ marginTop: 6 }}>{q.prompt}</div>
                                </div>

                                <select
                                    value={answers[q.id]?.languageId ?? 71}
                                    onChange={(e) => setCode(q.id, { languageId: Number(e.target.value) })}
                                >
                                    {(q.languageIdsAllowed || [71]).map((lid) => (
                                        <option key={lid} value={lid}>
                                            Language {lid}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <textarea
                                value={answers[q.id]?.code ?? q.starterCode ?? ""}
                                onChange={(e) => setCode(q.id, { code: e.target.value })}
                                rows={10}
                                style={{
                                    width: "100%",
                                    marginTop: 10,
                                    fontFamily: "monospace",
                                    padding: 12,
                                    borderRadius: 10,
                                    border: "1px solid #e5e7eb",
                                }}
                            />

                            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                <button onClick={() => run(q.id)} style={{ padding: "10px 14px" }}>
                                    Run Code
                                </button>
                            </div>

                            {runOutput && (
                                <div style={{ marginTop: 10, padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}>
                                    <div><b>Status:</b> {runOutput.status}</div>
                                    {runOutput.compile_output && <pre>{runOutput.compile_output}</pre>}
                                    {runOutput.stderr && <pre>{runOutput.stderr}</pre>}
                                    {runOutput.stdout && <pre>{runOutput.stdout}</pre>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}

            <button onClick={submit} disabled={submitting} style={{ padding: "12px 18px", fontWeight: 700 }}>
                {submitting ? "Submitting…" : "Submit Assessment"}
            </button>
        </div>
    );
}
