import React, { useMemo, useState } from "react";
import "./ProjectsSection.css";
import { Code2, Plus, Edit, Trash2, ExternalLink, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

export function ProjectsSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();

  const projects = useMemo(
    () => candidateProfile?.projects ?? [],
    [candidateProfile]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: [],
    links: "",
  });

  const [techInput, setTechInput] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", techStack: [], links: "" });
    setTechInput("");
    setIsOpen(true);
  };

  const openEdit = (proj) => {
    setEditingId(proj.id);
    setFormData({
      title: proj.title || "",
      description: proj.description || "",
      techStack: Array.isArray(proj.techStack) ? proj.techStack : [],
      links: proj.links || "",
    });
    setTechInput("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", techStack: [], links: "" });
    setTechInput("");
  };

  const handleDelete = (id) => {
    updateCandidateProfile({
      projects: projects.filter((p) => p.id !== id),
    });
  };

  const addTech = () => {
    const val = techInput.trim();
    if (!val) return;
    if (formData.techStack.includes(val)) {
      setTechInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      techStack: [...prev.techStack, val],
    }));
    setTechInput("");
  };

  const removeTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  const normalizeUrl = (raw) => {
    const v = (raw || "").trim();
    if (!v) return "";
    // If user already typed http(s), keep it. Otherwise prefix https://
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      techStack: formData.techStack,
      links: formData.links.trim(),
    };

    if (!trimmed.title || !trimmed.description) return;

    if (editingId) {
      const updated = projects.map((p) =>
        p.id === editingId ? { ...p, ...trimmed, id: editingId } : p
      );
      updateCandidateProfile({ projects: updated });
    } else {
      const newProject = { ...trimmed, id: Date.now().toString() };
      updateCandidateProfile({ projects: [...projects, newProject] });
    }

    closeModal();
  };

  return (
    <section className="pr-card">
      <header className="pr-card__header">
        <div className="pr-title">
          <div className="pr-title__row">
            <Code2 className="pr-title__icon" />
            <h2 className="pr-title__text">Projects</h2>
          </div>
          <p className="pr-title__sub">Showcase your best work</p>
        </div>

        <button className="pr-btn pr-btn--primary" type="button" onClick={openAdd}>
          <Plus size={16} />
          <span>Add</span>
        </button>
      </header>

      <div className="pr-card__content">
        {projects.length === 0 ? (
          <div className="pr-empty">
            <Code2 className="pr-empty__icon" />
            <p>No projects added yet</p>
            <p className="pr-empty__sub">Showcase your work to stand out</p>
          </div>
        ) : (
          <div className="pr-grid">
            {projects.map((proj) => (
              <article key={proj.id} className="pr-item">
                <div className="pr-item__top">
                  <div className="pr-item__main">
                    <h4 className="pr-item__title">
                      {proj.title}
                      {proj.links ? (
                        <a
                          className="pr-link"
                          href={normalizeUrl(proj.links)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open project link"
                          title="Open link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : null}
                    </h4>

                    <p className="pr-item__desc">{proj.description}</p>

                    {Array.isArray(proj.techStack) && proj.techStack.length > 0 ? (
                      <div className="pr-tags">
                        {proj.techStack.map((tech) => (
                          <span key={tech} className="pr-tag pr-tag--outline">
                            {tech}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="pr-actions">
                    <button
                      className="pr-icon-btn"
                      type="button"
                      onClick={() => openEdit(proj)}
                      aria-label="Edit project"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="pr-icon-btn pr-icon-btn--danger"
                      type="button"
                      onClick={() => handleDelete(proj.id)}
                      aria-label="Delete project"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen ? (
        <div className="pr-modal" role="dialog" aria-modal="true">
          <div className="pr-modal__backdrop" onClick={closeModal} />
          <div className="pr-modal__panel">
            <div className="pr-modal__header">
              <div>
                <h3 className="pr-modal__title">
                  {editingId ? "Edit" : "Add"} Project
                </h3>
                <p className="pr-modal__desc">
                  {editingId ? "Update your" : "Add a"} project to showcase
                </p>
              </div>

              <button
                className="pr-icon-btn"
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form className="pr-form" onSubmit={handleSubmit}>
              <div className="pr-field">
                <label className="pr-label" htmlFor="title">
                  Project Title
                </label>
                <input
                  className="pr-input"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="AI-Powered Job Matcher"
                  required
                />
              </div>

              <div className="pr-field">
                <label className="pr-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  className="pr-textarea"
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what the project does and your role..."
                  rows={3}
                  required
                />
              </div>

              <div className="pr-field">
                <label className="pr-label" htmlFor="tech">
                  Tech Stack
                </label>

                <div className="pr-techRow">
                  <input
                    className="pr-input"
                    id="tech"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Add technology"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                  />

                  <button className="pr-btn" type="button" onClick={addTech}>
                    Add
                  </button>
                </div>

                {formData.techStack.length > 0 ? (
                  <div className="pr-tags pr-tags--form">
                    {formData.techStack.map((tech) => (
                      <span key={tech} className="pr-tag pr-tag--pill">
                        {tech}
                        <button
                          type="button"
                          className="pr-tag__x"
                          onClick={() => removeTech(tech)}
                          aria-label={`Remove ${tech}`}
                          title="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="pr-field">
                <label className="pr-label" htmlFor="links">
                  GitHub / Demo Link (Optional)
                </label>
                <input
                  className="pr-input"
                  id="links"
                  value={formData.links}
                  onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                  placeholder="github.com/username/project"
                />
              </div>

              <div className="pr-form__actions">
                <button className="pr-btn" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="pr-btn pr-btn--primary" type="submit">
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
