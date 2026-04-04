import React from "react";
import { Link, useParams } from "react-router-dom";

export default function ApplicationResultPage() {
    const { applicationId } = useParams();

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 40, textAlign: "center" }}>
            <h1 style={{ marginBottom: 10 }}>Application Submitted 🎉</h1>

            <p style={{ color: "#64748b", fontSize: 16 }}>
                Your application has been successfully submitted.
            </p>

            <p style={{ color: "#64748b", fontSize: 16 }}>
                The recruiter will review your profile and get back to you soon.
            </p>

            <p style={{ marginTop: 20, fontWeight: 600 }}>
                Good luck! 🍀
            </p>
        </div>
    );
}