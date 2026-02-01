import React, { useMemo } from "react";
import "./MatchingInsights.css";
import { TrendingUp, Target, Briefcase, Heart, Lightbulb } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";

export function MatchingInsights() {
  const { candidateProfile } = useProfile();

  const skillsCount = candidateProfile?.skills?.length ?? 0;
  const expCount = candidateProfile?.experience?.length ?? 0;
  const interestsCount = candidateProfile?.interests?.length ?? 0;
  const projectsCount = candidateProfile?.projects?.length ?? 0;
  const hasResume = Boolean(candidateProfile?.resume);

  // Metrics
  const skillCoverage = Math.min((skillsCount / 5) * 100, 100);
  const experienceAlignment = expCount > 0 ? 80 : 20;
  const interestMatchStrength = Math.min((interestsCount / 3) * 100, 100);
  const profileCompleteness = hasResume ? 100 : 60;

  // Suggestions
  const suggestions = useMemo(() => {
    const s = [];
    if (skillsCount < 5) s.push(`Add ${5 - skillsCount} more skills to improve match quality`);
    if (!hasResume) s.push("Upload CV to increase visibility by 40%");
    if (projectsCount === 0) s.push("Add a project to showcase your practical experience");
    if (interestsCount < 3) s.push("Add more interests to get better opportunity recommendations");
    return s;
  }, [skillsCount, hasResume, projectsCount, interestsCount]);

  return (
    <section className="mi-card mi-card--accent">
      <header className="mi-header">
        <div className="mi-titleRow">
          <TrendingUp className="mi-titleIcon" />
          <h2 className="mi-title">How Jobify Sees Your Profile</h2>
        </div>
        <p className="mi-subtitle">Insights on your matching potential</p>
      </header>

      <div className="mi-content">
        {/* Metrics */}
        <div className="mi-metrics">
          <Metric
            icon={<Target className="mi-metricIcon" />}
            label="Skill Coverage"
            value={Math.round(skillCoverage)}
            sub={`${skillsCount} skills added`}
          />

          <Metric
            icon={<Briefcase className="mi-metricIcon" />}
            label="Experience Alignment"
            value={Math.round(experienceAlignment)}
            sub={`${expCount} positions • ${projectsCount} projects`}
          />

          <Metric
            icon={<Heart className="mi-metricIcon" />}
            label="Interest Match Strength"
            value={Math.round(interestMatchStrength)}
            sub={`${interestsCount} interests for better recommendations`}
          />

          <Metric
            icon={<TrendingUp className="mi-metricIcon" />}
            label="Profile Completeness"
            value={Math.round(profileCompleteness)}
            sub={hasResume ? "Resume uploaded ✓" : "No resume yet"}
          />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <div className="mi-suggestions">
            <div className="mi-suggestionsHeader">
              <Lightbulb className="mi-lightbulb" />
              <h4 className="mi-suggestionsTitle">Suggestions to Improve</h4>
            </div>

            <div className="mi-suggestionsList">
              {suggestions.map((text, idx) => (
                <div className="mi-suggestionRow" key={idx}>
                  <span className="mi-badge mi-badge--outline">{idx + 1}</span>
                  <span className="mi-suggestionText">{text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mi-suggestions">
            <div className="mi-success">
              <span className="mi-badge mi-badge--success">✓</span>
              <p className="mi-successText">
                Your profile is optimized! You're ready to match with top opportunities.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ icon, label, value, sub }) {
  return (
    <div className="mi-metric">
      <div className="mi-metricTop">
        <div className="mi-metricLabel">
          {icon}
          <span>{label}</span>
        </div>
        <span className="mi-metricValue">{value}%</span>
      </div>

      <div className="mi-progress" aria-label={`${label} progress`}>
        <div className="mi-progressFill" style={{ width: `${value}%` }} />
      </div>

      <p className="mi-metricSub">{sub}</p>
    </div>
  );
}
