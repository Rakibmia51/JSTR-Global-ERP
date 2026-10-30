import React from "react";

export default function CompanySummary({ company, onEdit }) {
  const a = company.address || {};
  const address = [a.line1, a.line2, a.city, a.state, a.postalCode, a.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="card">
      <div className="summary-head">
        {company.logoUrl ? (
          <img className="logo" src={company.logoUrl} alt="Company logo" />
        ) : (
          <div className="logo placeholder">{company.name?.[0]}</div>
        )}
        <div>
          <h1>{company.name}</h1>
          <p className="muted">
            {[company.industry, company.size && `${company.size} employees`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <dl className="details">
        <dt>Legal name</dt><dd>{company.legalName || "—"}</dd>
        <dt>Email</dt><dd>{company.email || "—"}</dd>
        <dt>Phone</dt><dd>{company.phone || "—"}</dd>
        <dt>Website</dt><dd>{company.website || "—"}</dd>
        <dt>Address</dt><dd>{address || "—"}</dd>
        <dt>Registration no.</dt><dd>{company.registrationNumber || "—"}</dd>
        <dt>Tax ID</dt><dd>{company.taxId || "—"}</dd>
        <dt>Currency</dt><dd>{company.currency}</dd>
        <dt>Timezone</dt><dd>{company.timezone}</dd>
      </dl>

      <button className="btn" onClick={onEdit}>Edit profile</button>
    </div>
  );
}
