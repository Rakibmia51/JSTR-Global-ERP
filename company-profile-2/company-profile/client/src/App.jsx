import React, { useEffect, useState } from "react";
import { getCompany } from "./api.js";
import CompanySetupWizard from "./components/CompanySetupWizard.jsx";
import CompanySummary from "./components/CompanySummary.jsx";

export default function App() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCompany()
      .then((d) => setCompany(d.company))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center muted">Loading…</p>;
  if (error)
    return (
      <p className="center error">
        Could not reach the API: {error}. Is the server running on port 5000?
      </p>
    );

  if (company?.setupCompleted && !editing) {
    return (
      <CompanySummary company={company} onEdit={() => setEditing(true)} />
    );
  }

  return (
    <CompanySetupWizard
      initial={company}
      onDone={(c) => {
        setCompany(c);
        setEditing(false);
      }}
    />
  );
}
