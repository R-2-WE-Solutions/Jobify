import { Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/LoginPage/SignupPage";
import ForgotPasswordPage from "./pages/LoginPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/LoginPage/ResetPasswordPage";
import OAuthCallbackPage from "./pages/LoginPage/OAuthCallbackPage";
import EmailConfirmed from "./pages/LoginPage/EmailConfirmed";

import ProfileReviewPage from "./pages/ProfileReviewPage";


import AppLayout from "./layout/AppLayout";

import { BrowseOpportunities } from "./pages/BrowseOpportunities";
import ProfilePage from "./pages/ProfilePage";

//Opportunity Details page
import JobDetailsPage from "./pages/JobDetailsPage";

// placeholder pages 
const Dashboard = () => <div>Dashboard</div>;
const Matches = () => <div>Matches</div>;

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/oauth-confirm" element={<OAuthCallbackPage />} />
            <Route path="/email-confirmed" element={<EmailConfirmed />} />

            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/browse" element={<BrowseOpportunities />} />

                <Route path="/opportunities/:id" element={<JobDetailsPage />} />

                <Route path="/apply/:applicationId/review" element={<ProfileReviewPage />} />

                <Route path="/matches" element={<Matches />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>


            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
