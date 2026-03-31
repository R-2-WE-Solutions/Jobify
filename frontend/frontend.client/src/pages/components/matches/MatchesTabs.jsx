import {
    OpportunitiesTab,
    ApplicationsTab,
    InterviewsTab,
    CVReviewTab,
} from "./MatchCard";

export function MatchesTabs({
    activeTab,
    matches,
    onWithdrawApplication
}) {
    if (activeTab === "applications") {
        return (
            <ApplicationsTab
                matches={matches}
                onWithdrawApplication={onWithdrawApplication}
            />
        );
    }

    if (activeTab === "interviews") {
        return <InterviewsTab matches={matches} />;
    }

    if (activeTab === "cv-review") {
        return <CVReviewTab />;
    }

    return <OpportunitiesTab matches={matches} />;
}