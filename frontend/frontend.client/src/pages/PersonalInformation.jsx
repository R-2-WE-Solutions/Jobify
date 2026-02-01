import React from "react";
import "./PersonalInformation.css";
import { useProfile } from "@/contexts/ProfileContext";

export function PersonalInformation() {
  const { candidateProfile, updateCandidateProfile } = useProfile();

  const bio = candidateProfile?.bio ?? "";

  return (
    <section className="pi-card">
      <header className="pi-card__header">
        <h2 className="pi-title">Personal Information</h2>
        <p className="pi-subtitle">Your basic details and contact information</p>
      </header>

      <div className="pi-card__content">
        {/* grid */}
        <div className="pi-grid2">
          <div className="pi-field">
            <label className="pi-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="pi-input"
              id="fullName"
              value={candidateProfile.fullName || ""}
              onChange={(e) => updateCandidateProfile({ fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div className="pi-field">
            <label className="pi-label" htmlFor="email">
              Email
            </label>
            <input
              className="pi-input pi-input--disabled"
              id="email"
              type="email"
              value={candidateProfile.email || ""}
              disabled
            />
          </div>
        </div>

        <div className="pi-field">
          <label className="pi-label" htmlFor="location">
            Location
          </label>
          <input
            className="pi-input"
            id="location"
            value={candidateProfile.location || ""}
            onChange={(e) => updateCandidateProfile({ location: e.target.value })}
            placeholder="City, State/Country"
          />
        </div>

        {/* Remote toggle */}
        <div className="pi-remote">
          <div className="pi-remote__text">
            <label className="pi-label" htmlFor="remote">
              Open to Remote Work
            </label>
            <p className="pi-remote__sub">
              Show your availability for remote opportunities
            </p>
          </div>

          <Toggle
            id="remote"
            checked={Boolean(candidateProfile.openToRemote)}
            onChange={(checked) => updateCandidateProfile({ openToRemote: checked })}
          />
        </div>

        {/* Bio */}
        <div className="pi-field">
          <label className="pi-label" htmlFor="bio">
            About Me
          </label>
          <textarea
            className="pi-textarea"
            id="bio"
            value={bio}
            onChange={(e) => updateCandidateProfile({ bio: e.target.value })}
            placeholder="Tell us about yourself, your passions, and what you're looking for..."
            rows={4}
            maxLength={500}
          />
          <p className="pi-hint">{bio.length} / 500 characters</p>
        </div>
      </div>
    </section>
  );
}

function Toggle({ id, checked, onChange }) {
  return (
    <label className="pi-switch" htmlFor={id} aria-label="toggle">
      <input
        id={id}
        type="checkbox"
        className="pi-switch__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="pi-switch__track" aria-hidden="true">
        <span className="pi-switch__thumb" />
      </span>
    </label>
  );
}
