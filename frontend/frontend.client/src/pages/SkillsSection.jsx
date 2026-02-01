import React, { useMemo, useState } from "react";
import "./SkillsSection.css";
import { Target, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

export function SkillsSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();

  const skills = useMemo(() => candidateProfile?.skills ?? [], [candidateProfile]);

  const [newSkill, setNewSkill] = useState("");
  const [newProficiency, setNewProficiency] = useState("Beginner");

  const handleAddSkill = () => {
    const name = newSkill.trim();
    if (!name) return;

    // Optional: prevent duplicates by name (case-insensitive)
    const exists = skills.some((s) => (s.name || "").toLowerCase() === name.toLowerCase());
    if (exists) {
      setNewSkill("");
      return;
    }

    updateCandidateProfile({
      skills: [
        ...skills,
        { name, proficiency: newProficiency, verified: false },
      ],
    });

    setNewSkill("");
    setNewProficiency("Beginner");
  };

  const handleRemoveSkill = (skillName) => {
    updateCandidateProfile({
      skills: skills.filter((s) => s.name !== skillName),
    });
  };

  return (
    <section className="sk-card">
      <header className="sk-card__header">
        <div className="sk-headLeft">
          <div className="sk-titleRow">
            <Target className="sk-titleIcon" />
            <h2 className="sk-title">Skills</h2>
          </div>
          <p className="sk-subtitle">Skills directly affect your match score</p>
        </div>

        {skills.length < 3 && (
          <div className="sk-warning">
            <AlertCircle size={16} />
            <span>Add more skills</span>
          </div>
        )}
      </header>

      <div className="sk-card__content">
        {/* Add Skill */}
        <div className="sk-addRow">
          <input
            className="sk-input"
            placeholder="Add a skill (e.g., React, Python)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />

          <select
            className="sk-select"
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value)}
            aria-label="Select proficiency"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button className="sk-btn sk-btn--primary" type="button" onClick={handleAddSkill}>
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>

        {/* Skills list */}
        {skills.length > 0 ? (
          <div className="sk-badges">
            {skills.map((skill) => (
              <span key={skill.name} className="sk-badge">
                {skill.verified ? <CheckCircle className="sk-check" size={14} /> : null}

                <span className="sk-badge__name">{skill.name}</span>
                <span className="sk-badge__meta">({skill.proficiency})</span>

                <button
                  type="button"
                  className="sk-badge__x"
                  onClick={() => handleRemoveSkill(skill.name)}
                  aria-label={`Remove ${skill.name}`}
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="sk-empty">
            <Target className="sk-empty__icon" />
            <p>No skills added yet</p>
            <p className="sk-empty__sub">Add at least 3 skills to improve your profile</p>
          </div>
        )}

        {/* Tip */}
        <div className="sk-tip">
          <p className="sk-tip__text">
            <strong>Tip:</strong> Add skills that match your experience and interests.
            Verified skills (with checkmarks) come from completed assessments.
          </p>
        </div>
      </div>
    </section>
  );
}
