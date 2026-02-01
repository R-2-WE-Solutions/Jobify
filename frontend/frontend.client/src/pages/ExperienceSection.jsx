import React, { useMemo, useState } from "react";
import "./ExperienceSection.css";
import { Briefcase, Plus, Edit, Trash2, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext"; // keep your existing context

export function ExperienceSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();

  const experience = useMemo(
    () => candidateProfile?.experience ?? [],
    [candidateProfile]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    role: "",
    company: "",
    duration: "",
    description: "",
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      role: "",
      company: "",
      duration: "",
      description: "",
    });
    setIsOpen(true);
  };

  const openEdit = (exp) => {
    setEditingId(exp.id);
    setFormData({
      role: exp.role || "",
      company: exp.company || "",
      duration: exp.duration || "",
      description: exp.description || "",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      role: "",
      company: "",
      duration: "",
      description: "",
    });
  };

  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = {
      role: formData.role.trim(),
      company: formData.company.trim(),
      duration: formData.duration.trim(),
      description: formData.description.trim(),
    };

    if (!trimmed.role || !trimmed.company || !trimmed.duration || !trimmed.description) {
      return;
    }

    if (editingId) {
      const updated = experience.map((exp) =>
        exp.id === editingId ? { ...exp, ...trimmed, id: editingId } : exp
      );
      updateCandidateProfile({ experience: updated });
    } else {
      const newExp = { ...trimmed, id: Date.now().toString() };
      updateCandidateProfile({ experience: [...experience, newExp] });
    }

    closeModal();
  };

  const handleDelete = (id) => {
    updateCandidateProfile({
      experience: experience.filter((exp) => exp.id !== id),
    });
  };

  return (
    <section className="exp-card">
      <header className="exp-card__header">
        <div className="exp-title">
          <div className="exp-title__row">
            <Briefcase className="exp-title__icon" />
            <h2 className="exp-title__text">Experience</h2>
          </div>
          <p className="exp-title__sub">Your professional background</p>
        </div>

        <button className="exp-btn exp-btn--primary" type="button" onClick={openAdd}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </header>

      <div className="exp-card__content">
        {experience.length === 0 ? (
          <div className="exp-empty">
            <Briefcase className="exp-empty__icon" />
            <p>No experience added yet</p>
          </div>
        ) : (
          <div className="exp-timeline">
            {experience.map((exp, index) => (
              <div key={exp.id} className="exp-row">
                {/* connector line */}
                {index !== experience.length - 1 && <div className="exp-line" />}

                {/* dot */}
                <div className="exp-dot" aria-hidden="true">
                  <Briefcase size={16} className="exp-dot__icon" />
                </div>

                {/* card */}
                <article className="exp-item">
                  <div className="exp-item__top">
                    <div className="exp-item__head">
                      <h4 className="exp-item__role">{exp.role}</h4>
                      <p className="exp-item__company">{exp.company}</p>
                      <p className="exp-item__duration">{exp.duration}</p>
                    </div>

                    <div className="exp-actions">
                      <button
                        className="exp-icon-btn"
                        type="button"
                        onClick={() => openEdit(exp)}
                        aria-label="Edit experience"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="exp-icon-btn exp-icon-btn--danger"
                        type="button"
                        onClick={() => handleDelete(exp.id)}
                        aria-label="Delete experience"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="exp-item__desc">{exp.description}</div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen ? (
        <div className="exp-modal" role="dialog" aria-modal="true">
          <div className="exp-modal__backdrop" onClick={closeModal} />
          <div className="exp-modal__panel">
            <div className="exp-modal__header">
              <div>
                <h3 className="exp-modal__title">
                  {editingId ? "Edit" : "Add"} Experience
                </h3>
                <p className="exp-modal__desc">
                  {editingId ? "Update your" : "Add your"} work experience
                </p>
              </div>

              <button
                className="exp-icon-btn"
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form className="exp-form" onSubmit={handleSubmit}>
              <div className="exp-field">
                <label className="exp-label" htmlFor="role">
                  Role / Position
                </label>
                <input
                  className="exp-input"
                  id="role"
                  value={formData.role}
                  onChange={handleChange("role")}
                  placeholder="Software Engineering Intern"
                  required
                />
              </div>

              <div className="exp-field">
                <label className="exp-label" htmlFor="company">
                  Company
                </label>
                <input
                  className="exp-input"
                  id="company"
                  value={formData.company}
                  onChange={handleChange("company")}
                  placeholder="TechCorp"
                  required
                />
              </div>

              <div className="exp-field">
                <label className="exp-label" htmlFor="duration">
                  Duration
                </label>
                <input
                  className="exp-input"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange("duration")}
                  placeholder="Jun 2024 - Aug 2024"
                  required
                />
              </div>

              <div className="exp-field">
                <label className="exp-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="exp-textarea"
                  id="description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder={"• Built scalable backend services\n• Improved performance by 40%\n• Collaborated with teams"}
                  rows={4}
                  required
                />
                <p className="exp-hint">Use bullet points (•) for better readability</p>
              </div>

              <div className="exp-form__actions">
                <button className="exp-btn" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="exp-btn exp-btn--primary" type="submit">
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
