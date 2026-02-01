import React, { useMemo, useRef } from "react";
import "./ResumeSection.css";
import { FileText, Upload, Trash2, CheckCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

export function ResumeSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();
  const fileInputRef = useRef(null);

  const resume = useMemo(() => candidateProfile?.resume, [candidateProfile]);

  const handleFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // In a real app, you'd upload file to a server and store URL + metadata
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    updateCandidateProfile({
      resume: {
        name: file.name,
        size: `${sizeInMB} MB`,
      },
    });
  };

  const handleRemove = () => {
    updateCandidateProfile({ resume: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="rs-card rs-card--accent">
      <header className="rs-header">
        <div className="rs-titleRow">
          <FileText className="rs-titleIcon" />
          <h2 className="rs-title">Resume / CV</h2>
        </div>
        <p className="rs-subtitle">Upload your resume to increase visibility</p>
      </header>

      <div className="rs-content">
        {resume ? (
          <div className="rs-stack">
            {/* Current resume */}
            <div className="rs-current">
              <div className="rs-current__left">
                <div className="rs-fileIcon">
                  <FileText size={18} />
                </div>

                <div className="rs-meta">
                  <p className="rs-name">{resume.name}</p>
                  <p className="rs-size">{resume.size}</p>

                  <span className="rs-badge rs-badge--success">
                    <CheckCircle size={14} />
                    Used for matching
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rs-iconBtn rs-iconBtn--danger"
                onClick={handleRemove}
                aria-label="Remove resume"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Replace */}
            <button type="button" className="rs-btn rs-btn--outline" onClick={handleFileClick}>
              <Upload size={16} />
              <span>Replace Resume</span>
            </button>
          </div>
        ) : (
          <div className="rs-stack">
            {/* Upload area */}
            <div className="rs-drop" onClick={handleFileClick} role="button" tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFileClick();
                }
              }}
            >
              <Upload className="rs-drop__icon" />
              <p className="rs-drop__title">Click to upload resume</p>
              <p className="rs-drop__sub">PDF or DOC up to 10MB</p>
            </div>

            <button type="button" className="rs-btn rs-btn--primary" onClick={handleFileClick}>
              <Upload size={16} />
              <span>Upload Resume</span>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="rs-hiddenInput"
        />

        {/* Helper text */}
        <div className="rs-helper">
          <p className="rs-helper__text">
            <strong>Why upload?</strong> Recruiters can view your full resume, and our AI uses
            it to improve your match scores with opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}
