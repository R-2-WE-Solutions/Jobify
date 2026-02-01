import React, { useMemo, useState } from "react";
import "./EducationSection.css";
import { GraduationCap, Plus, Trash2, Edit, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext"; // keep your existing context

export function EducationSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();

  const education = useMemo(
    () => candidateProfile?.education ?? [],
    [candidateProfile]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    university: "",
    degree: "",
    major: "",
    gpa: "",
    graduationYear: "",
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      university: "",
      degree: "",
      major: "",
      gpa: "",
      graduationYear: "",
    });
    setIsOpen(true);
  };

  const openEdit = (edu) => {
    setEditingId(edu.id);
    setFormData({
      university: edu.university || "",
      degree: edu.degree || "",
      major: edu.major || "",
      gpa: edu.gpa || "",
      graduationYear: edu.graduationYear || "",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({
      university: "",
      degree: "",
      major: "",
      gpa: "",
      graduationYear: "",
    });
  };

  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = {
      university: formData.university.trim(),
      degree: formData.degree.trim(),
      major: formData.major.trim(),
      gpa: formData.gpa.trim(),
      graduationYear: formData.graduationYear.trim(),
    };

    if (!trimmed.university || !trimmed.degree || !trimmed.major || !trimmed.graduationYear) {
      return; // browser "required" should catch this anyway
    }

    if (editingId) {
      const updated = education.map((edu) =>
        edu.id === editingId ? { ...edu, ...trimmed, id: editingId } : edu
      );
      updateCandidateProfile({ education: updated });
    } else {
      const newEducation = { ...trimmed, id: Date.now().toString() };
      updateCandidateProfile({ education: [...education, newEducation] });
    }

    closeModal();
  };

  const handleDelete = (id) => {
    updateCandidateProfile({
      education: education.filter((edu) => edu.id !== id),
    });
  };

  return (
    <section className="edu-card">
      <header className="edu-card__header">
        <div className="edu-title">
          <div className="edu-title__row">
            <GraduationCap className="edu-title__icon" />
            <h2 className="edu-title__text">Education</h2>
          </div>
          <p className="edu-title__sub">Your academic background</p>
        </div>

        <button className="edu-btn edu-btn--primary" type="button" onClick={openAdd}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </header>

      <div className="edu-card__content">
        {education.length === 0 ? (
          <div className="edu-empty">
            <GraduationCap className="edu-empty__icon" />
            <p>No education added yet</p>
          </div>
        ) : (
          <div className="edu-list">
            {education.map((edu) => (
              <article key={edu.id} className="edu-item">
                <div className="edu-item__main">
                  <h4 className="edu-item__heading">
                    {edu.degree} in {edu.major}
                  </h4>
                  <p className="edu-item__uni">{edu.university}</p>

                  <div className="edu-item__meta">
                    <span>Class of {edu.graduationYear}</span>
                    {edu.gpa ? <span>GPA: {edu.gpa}</span> : null}
                  </div>
                </div>

                <div className="edu-actions">
                  <button
                    className="edu-icon-btn"
                    type="button"
                    onClick={() => openEdit(edu)}
                    aria-label="Edit education"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    className="edu-icon-btn edu-icon-btn--danger"
                    type="button"
                    onClick={() => handleDelete(edu.id)}
                    aria-label="Delete education"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen ? (
        <div className="edu-modal" role="dialog" aria-modal="true">
          <div className="edu-modal__backdrop" onClick={closeModal} />
          <div className="edu-modal__panel">
            <div className="edu-modal__header">
              <div>
                <h3 className="edu-modal__title">
                  {editingId ? "Edit" : "Add"} Education
                </h3>
                <p className="edu-modal__desc">
                  {editingId ? "Update your" : "Add your"} educational details
                </p>
              </div>

              <button
                className="edu-icon-btn"
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form className="edu-form" onSubmit={handleSubmit}>
              <div className="edu-field">
                <label className="edu-label" htmlFor="university">
                  University
                </label>
                <input
                  className="edu-input"
                  id="university"
                  value={formData.university}
                  onChange={handleChange("university")}
                  required
                />
              </div>

              <div className="edu-grid2">
                <div className="edu-field">
                  <label className="edu-label" htmlFor="degree">
                    Degree
                  </label>
                  <input
                    className="edu-input"
                    id="degree"
                    value={formData.degree}
                    onChange={handleChange("degree")}
                    placeholder="B.S., M.S., etc."
                    required
                  />
                </div>

                <div className="edu-field">
                  <label className="edu-label" htmlFor="major">
                    Major
                  </label>
                  <input
                    className="edu-input"
                    id="major"
                    value={formData.major}
                    onChange={handleChange("major")}
                    required
                  />
                </div>
              </div>

              <div className="edu-grid2">
                <div className="edu-field">
                  <label className="edu-label" htmlFor="gpa">
                    GPA (Optional)
                  </label>
                  <input
                    className="edu-input"
                    id="gpa"
                    value={formData.gpa}
                    onChange={handleChange("gpa")}
                    placeholder="3.8"
                  />
                </div>

                <div className="edu-field">
                  <label className="edu-label" htmlFor="graduationYear">
                    Graduation Year
                  </label>
                  <input
                    className="edu-input"
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange("graduationYear")}
                    placeholder="2025"
                    required
                  />
                </div>
              </div>

              <div className="edu-form__actions">
                <button className="edu-btn" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="edu-btn edu-btn--primary" type="submit">
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
