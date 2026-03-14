import { useState, useNavigate } from "react";
import { Briefcase, ListChecks, Calendar, FileText } from "lucide-react";
import "./styles/matches.css";


const API_BASE = "http://localhost:5159/api";

export default function MatchesPage() {

    const tabs = [
        { key: "opportunities", label: "Opportunities", icon: Briefcase },
        { key: "applications", label: "Applications", icon: ListChecks },
        { key: "interviews", label: "Interviews", icon: Calendar },
        { key: "cv-review", label: "CV Review", icon: FileText },
    ];

    const [activeTab, setActiveTab] = useState("opportunities");

    const navigate = useNavigate();

    // Opportunities
    const [opportunities, setOpportunities] = useState(matches.opportunities);
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
    const [opportunitiesError, setOpportunitiesError] = useState("");

    // Applications
    const [applications, setApplications] = useState(matches.applications);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState("");

    async function fetchOpportunities() {

        const res = await fetch(`${API_BASE}/opportunities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if(res.ok) {
            const data = await res.json();
            setOpportunities(data.opportunities);
        }
        else {
            console.error("Failed to fetch opportunities");
        }
    }

    async function fetchApplications() {
        const res = await fetch(`${API_BASE}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

        if(res.ok) {
            const data = await res.json();
            setApplications(data.applications);
        }
        else {
            console.error("Failed to fetch applications");
        }

    }


    return (
        <div className="matches-page">
            <div className="matches-header">
                <h1 className="matches-title">Matches</h1>
                <p className="matches-subtitle">Manage your job search pipeline.</p>
            </div>

            <div className="matches-tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`matches-tab ${active ? "active" : ""}`}
                        >
                            <Icon className="matches-tab-icon" />
                            <span>{tab.label}</span>
                        </button>
                    ); 
                })}
            </div>

            <div className="matches-content">
                <MatchesTabs activeTab={activeTab} matches={matches} />
            </div>
        </div>
    );
}
