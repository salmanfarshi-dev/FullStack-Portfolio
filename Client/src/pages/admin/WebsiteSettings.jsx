import { useCallback, useEffect, useState } from "react";
import {
  FiGlobe, FiSave, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiImage, FiMail, FiPhone, FiMapPin, FiPalette, FiShield,
  FiClock, FiRotateCcw,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const DEFAULT_SETTINGS = {
  siteName: "Salman Farshi",
  tagline: "Building Modern Web Experiences",
  logo: "",
  favicon: "",
  contactEmail: "",
  contactPhone: "",
  location: "",
  copyrightText: "© {year} Salman Farshi. All rights reserved.",
  primaryColor: "#22D3EE",
  secondaryColor: "#8B5CF6",
  maintenanceMode: false,
  maintenanceMessage: "We are currently improving our website. Please check back soon.",
  isWebsiteEnabled: true,
  allowContactMessages: true,
  allowNewsletterSubscriptions: true,
  showPreloader: true,
  enableAnalytics: true,
  timezone: "Asia/Dhaka",
};

const groups = [
  { title: "Site identity", description: "Your portfolio's public name and visual identity.", icon: FiGlobe },
  { title: "Contact information", description: "How visitors can reach and locate you.", icon: FiMail },
  { title: "Brand appearance", description: "Set the primary and secondary brand colors.", icon: FiPalette },
  { title: "Website controls", description: "Control public access and optional website features.", icon: FiShield },
];

const Field = ({ label, hint, children }) => (
  <div className="min-w-0">
    <label className="mb-2 block text-sm font-semibold">{label}</label>
    {children}
    {hint && <p className="mt-1.5 text-xs leading-5 text-[var(--color-muted)]">{hint}</p>}
  </div>
);

const inputClass = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10";
const Toggle = ({ title, description, checked, onChange, disabled = false }) => (
  <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-primary)]/50 ${disabled ? "opacity-60" : ""}`}>
    <span className="min-w-0">
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">{description}</span>
    </span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} className="h-5 w-5 shrink-0 accent-[var(--color-primary)]" />
  </label>
);

const WebsiteSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsId, setSettingsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");
    return data;
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await request("/settings/admin");
      const current = data.settings || null;
      setSettings({ ...DEFAULT_SETTINGS, ...(current || {}) });
      setSettingsId(current?._id || null);
    } catch (err) {
      setError(err.message || "Could not load website settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateField = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setNotice("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = { ...settings };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    try {
      const data = await request(settingsId ? `/settings/${settingsId}` : "/settings", {
        method: settingsId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSettings({ ...DEFAULT_SETTINGS, ...(data.settings || payload) });
      setSettingsId(data.settings?._id || settingsId);
      setNotice(data.message || "Website settings saved successfully.");
    } catch (err) {
      setError(err.message || "Could not save website settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Discard your unsaved changes and reload saved settings?")) return;
    loadSettings();
  };

  const previewColor = (field) => (
    <div className="flex items-center gap-3">
      <input type="color" value={settings[field] || "#000000"} onChange={(event) => updateField(field, event.target.value.toUpperCase())} className="h-12 w-14 cursor-pointer rounded-lg border border-[var(--color-border)] bg-transparent p-1" aria-label={field} />
      <input value={settings[field]} onChange={(event) => updateField(field, event.target.value.toUpperCase())} maxLength={7} pattern="^#[0-9A-Fa-f]{6}$" className={inputClass} />
    </div>
  );

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">System configuration</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Website Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">Manage your portfolio identity, contact details, brand appearance and public website behaviour from one place.</p>
        </div>
        <button type="button" onClick={loadSettings} disabled={loading || saving} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] disabled:opacity-50"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh settings</button>
      </section>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500"><FiAlertCircle className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500"><FiCheckCircle className="mt-0.5 shrink-0" />{notice}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><Icon size={19} /></div>
            <h2 className="mt-4 text-sm font-bold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{description}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--color-muted)]"><FiRefreshCw className="animate-spin" /> Loading website settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiGlobe size={20} /></div>
              <div><h2 className="font-heading text-lg font-bold">Site Identity</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Set the name and visual assets used to identify your website.</p></div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Website name"><input className={inputClass} value={settings.siteName} onChange={(e) => updateField("siteName", e.target.value)} maxLength={100} required placeholder="Salman Farshi" /></Field>
              <Field label="Tagline"><input className={inputClass} value={settings.tagline} onChange={(e) => updateField("tagline", e.target.value)} maxLength={200} placeholder="Building Modern Web Experiences" /></Field>
              <Field label="Logo URL" hint="Paste a public HTTPS image URL. Upload management can be added separately."><div className="relative"><FiImage className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} type="url" value={settings.logo} onChange={(e) => updateField("logo", e.target.value)} placeholder="https://example.com/logo.png" /></div></Field>
              <Field label="Favicon URL" hint="Use a public HTTPS image URL for your browser tab icon."><div className="relative"><FiImage className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} type="url" value={settings.favicon} onChange={(e) => updateField("favicon", e.target.value)} placeholder="https://example.com/favicon.png" /></div></Field>
              <div className="md:col-span-2"><Field label="Copyright text" hint="Use {year} to display the current year in the footer."><input className={inputClass} value={settings.copyrightText} onChange={(e) => updateField("copyrightText", e.target.value)} maxLength={200} placeholder="© {year} Salman Farshi. All rights reserved." /></Field></div>
            </div>
            {(settings.logo || settings.favicon) && <div className="mt-5 flex flex-wrap gap-4">{settings.logo && <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3"><img src={settings.logo} alt="Logo preview" className="h-10 max-w-32 object-contain" /><span className="text-xs text-[var(--color-muted)]">Logo preview</span></div>}{settings.favicon && <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3"><img src={settings.favicon} alt="Favicon preview" className="h-8 w-8 object-contain" /><span className="text-xs text-[var(--color-muted)]">Favicon preview</span></div>}</div>}
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiMail size={20} /></div><div><h2 className="font-heading text-lg font-bold">Contact Information</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Public contact details shown to portfolio visitors.</p></div></div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Contact email"><div className="relative"><FiMail className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} type="email" value={settings.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} placeholder="hello@example.com" /></div></Field>
              <Field label="Contact phone"><div className="relative"><FiPhone className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} type="tel" value={settings.contactPhone} onChange={(e) => updateField("contactPhone", e.target.value)} maxLength={30} placeholder="+880 1XXX-XXXXXX" /></div></Field>
              <div className="md:col-span-2"><Field label="Location"><div className="relative"><FiMapPin className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} value={settings.location} onChange={(e) => updateField("location", e.target.value)} maxLength={150} placeholder="Dhaka, Bangladesh" /></div></Field></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiPalette size={20} /></div><div><h2 className="font-heading text-lg font-bold">Brand Appearance</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Choose the colors that represent your portfolio brand.</p></div></div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Primary brand color" hint="Used for key buttons, links and highlights.">{previewColor("primaryColor")}</Field>
              <Field label="Secondary brand color" hint="Used for supporting accents and decorative details.">{previewColor("secondaryColor")}</Field>
            </div>
            <div className="mt-5 rounded-xl border border-[var(--color-border)] p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Color preview</p><div className="flex flex-wrap items-center gap-3"><span className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-950" style={{ backgroundColor: settings.primaryColor }}>Primary</span><span className="rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ backgroundColor: settings.secondaryColor }}>Secondary</span><span className="text-xs text-[var(--color-muted)]">{settings.primaryColor} · {settings.secondaryColor}</span></div></div>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiShield size={20} /></div><div><h2 className="font-heading text-lg font-bold">Website Controls</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Manage website availability and visitor-facing features.</p></div></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Toggle title="Website enabled" description="Allow visitors to access your public portfolio." checked={settings.isWebsiteEnabled} onChange={(v) => updateField("isWebsiteEnabled", v)} />
              <Toggle title="Maintenance mode" description="Enable maintenance mode while you work on the website." checked={settings.maintenanceMode} onChange={(v) => updateField("maintenanceMode", v)} />
              <Toggle title="Contact messages" description="Allow visitors to submit the contact form." checked={settings.allowContactMessages} onChange={(v) => updateField("allowContactMessages", v)} />
              <Toggle title="Newsletter subscriptions" description="Allow visitors to subscribe to your newsletter." checked={settings.allowNewsletterSubscriptions} onChange={(v) => updateField("allowNewsletterSubscriptions", v)} />
              <Toggle title="Show preloader" description="Display the loading animation while the site loads." checked={settings.showPreloader} onChange={(v) => updateField("showPreloader", v)} />
              <Toggle title="Enable analytics" description="Collect website visits and engagement statistics." checked={settings.enableAnalytics} onChange={(v) => updateField("enableAnalytics", v)} />
            </div>
            {settings.maintenanceMode && <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><label className="mb-2 block text-sm font-semibold text-amber-600">Maintenance message</label><textarea className={`${inputClass} min-h-24 resize-y`} value={settings.maintenanceMessage} onChange={(e) => updateField("maintenanceMessage", e.target.value)} maxLength={500} placeholder="We are currently improving our website..." /><p className="mt-1 text-xs text-[var(--color-muted)]">This message is shown when maintenance mode is active.</p></div>}
            <div className="mt-5 max-w-sm"><Field label="Website timezone"><div className="relative"><FiClock className="pointer-events-none absolute left-3 top-3.5 text-[var(--color-muted)]" /><select className={`${inputClass} pl-10`} value={settings.timezone} onChange={(e) => updateField("timezone", e.target.value)}><option value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</option><option value="Asia/Kolkata">Asia/Kolkata (India)</option><option value="UTC">UTC</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option></select></div></Field></div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col-reverse justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:px-5">
            <p className="px-1 text-xs text-[var(--color-muted)]">{settingsId ? "Changes are saved to your database." : "Save once to create your website settings record."}</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleReset} disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface-hover)] disabled:opacity-50 sm:flex-none"><FiRotateCcw /> Reset</button>
              <button type="submit" disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:flex-none"><FiSave />{saving ? "Saving..." : "Save Settings"}</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default WebsiteSettings;
