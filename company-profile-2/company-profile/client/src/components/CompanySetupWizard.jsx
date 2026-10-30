import React, { useRef, useState } from "react";
import { saveCompany, uploadLogo, removeLogo, completeSetup } from "../api.js";

const STEPS = ["Basics", "Contact", "Branding", "Review"];
const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];
const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "INR", "AED", "SGD"];
const TIMEZONES = [
  "Asia/Dhaka", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "UTC",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toForm(c) {
  return {
    name: c?.name || "",
    legalName: c?.legalName || "",
    industry: c?.industry || "",
    size: c?.size || "",
    registrationNumber: c?.registrationNumber || "",
    taxId: c?.taxId || "",
    email: c?.email || "",
    phone: c?.phone || "",
    website: c?.website || "",
    address: {
      line1: c?.address?.line1 || "",
      line2: c?.address?.line2 || "",
      city: c?.address?.city || "",
      state: c?.address?.state || "",
      postalCode: c?.address?.postalCode || "",
      country: c?.address?.country || "",
    },
    currency: c?.currency || "BDT",
    timezone: c?.timezone || "Asia/Dhaka",
    fiscalYearStartMonth: c?.fiscalYearStartMonth || 1,
  };
}

// Client-side checks mirror the server so users get instant feedback.
function validate(step, f) {
  const e = {};
  if (step === 0) {
    if (f.name.trim().length < 2) e.name = "Company name is required";
  }
  if (step === 1) {
    if (!f.email) e.email = "Contact email is required";
    else if (!emailRe.test(f.email)) e.email = "Enter a valid email address";
    if (f.website && !/^https?:\/\//i.test(f.website))
      e.website = "Website must start with http:// or https://";
    if (f.phone && !/^[+()\-\s\d]{6,20}$/.test(f.phone))
      e.phone = "Enter a valid phone number";
    if (!f.address.country.trim()) e["address.country"] = "Country is required";
  }
  return e;
}

export default function CompanySetupWizard({ initial, onDone }) {
  const [step, setStep] = useState(
    initial && !initial.setupCompleted
      ? Math.min((initial.setupStep || 1) - 1, 3)
      : 0
  );
  const [form, setForm] = useState(toForm(initial));
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl || "");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setAddr = (k) => (e) =>
    setForm({ ...form, address: { ...form.address, [k]: e.target.value } });

  async function persist(nextStep) {
    const { company } = await saveCompany({ ...form, setupStep: nextStep + 1 });
    return company;
  }

  async function next() {
    const v = validate(step, form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    setMessage("");
    try {
      await persist(step + 1);
      setStep(step + 1);
    } catch (e) {
      setErrors(e.errors || {});
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function back() {
    setErrors({});
    setMessage("");
    setStep(step - 1);
  }

  async function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Logo must be 2MB or smaller");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { company } = await uploadLogo(file);
      setLogoUrl(company.logoUrl);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onLogoRemove() {
    setBusy(true);
    try {
      await removeLogo();
      setLogoUrl("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setMessage("");
    try {
      await saveCompany({ ...form, setupStep: 4 });
      const { company } = await completeSetup();
      onDone(company);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  const Field = ({ label, error, children }) => (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="error">{error}</small>}
    </label>
  );

  return (
    <div className="card">
      <h1>Set up your company</h1>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? "active" : i < step ? "done" : ""}>
            <span>{i < step ? "✓" : i + 1}</span> {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid">
          <Field label="Company name *" error={errors.name}>
            <input value={form.name} onChange={set("name")} placeholder="Acme Ltd" />
          </Field>
          <Field label="Legal name" error={errors.legalName}>
            <input value={form.legalName} onChange={set("legalName")} />
          </Field>
          <Field label="Industry" error={errors.industry}>
            <input value={form.industry} onChange={set("industry")} placeholder="Manufacturing, Retail…" />
          </Field>
          <Field label="Company size" error={errors.size}>
            <select value={form.size} onChange={set("size")}>
              <option value="">Select…</option>
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Registration number" error={errors.registrationNumber}>
            <input value={form.registrationNumber} onChange={set("registrationNumber")} />
          </Field>
          <Field label="Tax ID / BIN / VAT" error={errors.taxId}>
            <input value={form.taxId} onChange={set("taxId")} />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="grid">
          <Field label="Contact email *" error={errors.email}>
            <input type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input value={form.phone} onChange={set("phone")} placeholder="+880 1XXX XXXXXX" />
          </Field>
          <Field label="Website" error={errors.website}>
            <input value={form.website} onChange={set("website")} placeholder="https://example.com" />
          </Field>
          <Field label="Address line 1" error={errors["address.line1"]}>
            <input value={form.address.line1} onChange={setAddr("line1")} />
          </Field>
          <Field label="Address line 2" error={errors["address.line2"]}>
            <input value={form.address.line2} onChange={setAddr("line2")} />
          </Field>
          <Field label="City" error={errors["address.city"]}>
            <input value={form.address.city} onChange={setAddr("city")} />
          </Field>
          <Field label="State / Division" error={errors["address.state"]}>
            <input value={form.address.state} onChange={setAddr("state")} />
          </Field>
          <Field label="Postal code" error={errors["address.postalCode"]}>
            <input value={form.address.postalCode} onChange={setAddr("postalCode")} />
          </Field>
          <Field label="Country *" error={errors["address.country"]}>
            <input value={form.address.country} onChange={setAddr("country")} />
          </Field>
        </div>
      )}

      {step === 2 && (
        <>
          <div className="logo-row">
            {logoUrl ? (
              <img className="logo" src={logoUrl} alt="Company logo preview" />
            ) : (
              <div className="logo placeholder">{form.name?.[0] || "?"}</div>
            )}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onLogoChange}
                disabled={busy}
              />
              <p className="muted small">PNG, JPG or WEBP, up to 2MB.</p>
              {logoUrl && (
                <button type="button" className="link" onClick={onLogoRemove} disabled={busy}>
                  Remove logo
                </button>
              )}
            </div>
          </div>
          <div className="grid">
            <Field label="Currency">
              <select value={form.currency} onChange={set("currency")}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Timezone">
              <select value={form.timezone} onChange={set("timezone")}>
                {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Fiscal year starts in">
              <select
                value={form.fiscalYearStartMonth}
                onChange={(e) =>
                  setForm({ ...form, fiscalYearStartMonth: Number(e.target.value) })
                }
              >
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Field>
          </div>
        </>
      )}

      {step === 3 && (
        <dl className="details">
          <dt>Company</dt><dd>{form.name}</dd>
          <dt>Industry / size</dt><dd>{[form.industry, form.size].filter(Boolean).join(" · ") || "—"}</dd>
          <dt>Email</dt><dd>{form.email}</dd>
          <dt>Phone</dt><dd>{form.phone || "—"}</dd>
          <dt>Website</dt><dd>{form.website || "—"}</dd>
          <dt>Address</dt>
          <dd>
            {Object.values(form.address).filter(Boolean).join(", ") || "—"}
          </dd>
          <dt>Currency</dt><dd>{form.currency}</dd>
          <dt>Timezone</dt><dd>{form.timezone}</dd>
          <dt>Fiscal year</dt><dd>Starts in {MONTHS[form.fiscalYearStartMonth - 1]}</dd>
          <dt>Logo</dt><dd>{logoUrl ? "Uploaded" : "None"}</dd>
        </dl>
      )}

      {message && <p className="error">{message}</p>}

      <div className="actions">
        {step > 0 && (
          <button className="btn secondary" onClick={back} disabled={busy}>
            Back
          </button>
        )}
        {step < 3 ? (
          <button className="btn" onClick={next} disabled={busy}>
            {busy ? "Saving…" : "Save & continue"}
          </button>
        ) : (
          <button className="btn" onClick={finish} disabled={busy}>
            {busy ? "Finishing…" : "Finish setup"}
          </button>
        )}
      </div>
    </div>
  );
}
