import React, { useMemo, useState } from "react";
import "./InterestsSection.css";
import { Heart, Plus, X } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext"; // keep your existing context

const SUGGESTED_INTERESTS = [
  "Artificial Intelligence",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "UI/UX Design",
  "DevOps",
  "Blockchain",
  "IoT",
  "Game Development",
  "Machine Learning",
];

export function InterestsSection() {
  const { candidateProfile, updateCandidateProfile } = useProfile();
  const [newInterest, setNewInterest] = useState("");

  const interests = useMemo(
    () => candidateProfile?.interests ?? [],
    [candidateProfile]
  );

  const availableSuggestions = useMemo(
    () => SUGGESTED_INTERESTS.filter((s) => !interests.includes(s)),
    [interests]
  );

  const handleAddInterest = (interest) => {
    const val = (interest || "").trim();
    if (!val) return;

    if (!interests.includes(val)) {
      updateCandidateProfile({ interests: [...interests, val] });
    }
    setNewInterest("");
  };

  const handleRemoveInterest = (interest) => {
    updateCandidateProfile({
      interests: interests.filter((i) => i !== interest),
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleAddInterest(newInterest);
  };

  return (
    <section className="int-card">
      <header className="int-card__header">
        <div className="int-title__row">
          <Heart className="int-title__icon" />
          <h2 className="int-title__text">Interests</h2>
        </div>
        <p className="int-title__sub">Areas you're passionate about</p>
      </header>

      <div className="int-card__content">
        {/* Add Interest */}
        <form className="int-add" onSubmit={onSubmit}>
          <input
            className="int-input"
            placeholder="Add an interest"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
          />
          <button className="int-btn int-btn--primary" type="submit">
            <Plus size={16} />
            <span>Add</span>
          </button>
        </form>

        {/* Your Interests */}
        {interests.length > 0 && (
          <div className="int-block">
            <p className="int-label">Your Interests</p>
            <div className="int-badges">
              {interests.map((interest) => (
                <span key={interest} className="int-badge int-badge--filled">
                  <span className="int-badge__text">{interest}</span>
                  <button
                    type="button"
                    className="int-badge__x"
                    onClick={() => handleRemoveInterest(interest)}
                    aria-label={`Remove ${interest}`}
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested */}
        {availableSuggestions.length > 0 && (
          <div className="int-block">
            <p className="int-label">Suggested Interests (click to add)</p>
            <div className="int-badges">
              {availableSuggestions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className="int-badge int-badge--outline"
                  onClick={() => handleAddInterest(interest)}
                  title="Add interest"
                >
                  <Plus size={14} />
                  <span>{interest}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {interests.length === 0 && (
          <div className="int-empty">
            <Heart className="int-empty__icon" />
            <p>No interests added yet</p>
            <p className="int-empty__sub">
              Select from suggestions or add your own
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
