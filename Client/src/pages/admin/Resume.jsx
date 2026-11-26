import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiFileText, FiUploadCloud, FiDownload, FiExternalLink, FiTrash2,
  FiRefreshCw, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle,
  FiCalendar, FiHardDrive, FiFile, FiX, FiSave,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const formatBytes = (bytes = 0) => {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";

const Resume = () => {
  const fileRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("My Professional Resume");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, { credentials: "include", ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  };

  const loadResume = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/resume/admin");
      setResume(data.resume || null);
      if (data.resume) {
        setTitle(data.resume.title || "My Professional Resume");
        setDescription(data.resume.description || "");
        setIsVisible(Boolean(data.resume.isVisible));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResume(); }, [loadResume]);

  const chooseFile = (selected) => {
    setError("");
    setNotice("");
    if (!selected) return;
    if (selected.type !== "application/pdf" || !selected.name.toLowerCase().endsWith(".pdf")) {
      setFile(null);
      setError("Please select a valid PDF file.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("PDF file must be 10 MB or smaller.");
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return setError("Choose a PDF file before uploading.");
    setUploading(true); setError(""); setNotice("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isVisible", String(isVisible));
      const data = await request("/resume/upload", { method: "POST", body: formData });
      setResume(data.resume);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setNotice(data.message || "Resume uploaded successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!resume) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const data = await request(`/resume/${resume._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isVisible }),
      });
      setResume(data.resume);
      setNotice(data.message || "Resume details saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resume || !window.confirm("Delete this resume from your portfolio and Cloudinary?")) return;
    setDeleting(true); setError(""); setNotice("");
    try {
      const data = await request(`/resume/${resume._id}`, { method: "DELETE" });
      setResume(null); setFile(null);
      setTitle("My Professional Resume"); setDescription(""); setIsVisible(true);
      setNotice(data.message || "Resume deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Portfolio content</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Resume Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">Upload and manage the PDF resume displayed on your public portfolio. Files are stored in Cloudinary.</p>
        </div>
        <button type="button" onClick={loadResume} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh</button>
      </section>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500"><FiAlertCircle className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500"><FiCheckCircle className="mt-0.5 shrink-0" />{notice}</div>}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><p className="text-sm text-[var(--color-muted)]">Resume status</p><p className="mt-2 text-xl font-bold">{loading ? "Loading..." : resume ? "Uploaded" : "Not uploaded"}</p></div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><p className="text-sm text-[var(--color-muted)]">Total downloads</p><p className="mt-2 font-heading text-3xl font-bold">{Number(resume?.downloadCount || 0).toLocaleString()}</p></div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"><p className="text-sm text-[var(--color-muted)]">Public visibility</p><p className="mt-2 text-xl font-bold">{resume ? (resume.isVisible ? "Visible" : "Hidden") : "—"}</p></div>
      </section>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--color-muted)]"><FiRefreshCw className="animate-spin" /> Loading resume details...</div>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-5"><h2 className="font-heading text-lg font-bold">{resume ? "Replace Resume PDF" : "Upload Your Resume"}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">PDF only · Maximum file size 10 MB</p></div>
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Resume title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]" placeholder="My Professional Resume" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Description <span className="font-normal text-[var(--color-muted)]">(optional)</span></label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]" placeholder="A short description about this resume..." />
              </div>
              <div>
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-5 text-center transition hover:border-[var(--color-primary)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiUploadCloud size={24} /></span>
                  <span className="mt-3 text-sm font-semibold">{file ? file.name : "Choose a PDF file"}</span>
                  <span className="mt-1 text-xs text-[var(--color-muted)]">{file ? formatBytes(file.size) : "Click to browse · PDF up to 10 MB"}</span>
                </button>
                {file && <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-danger)]"><FiX /> Remove selected file</button>}
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] p-4">
                <span><span className="block text-sm font-semibold">Show resume on public portfolio</span><span className="mt-1 block text-xs text-[var(--color-muted)]">Visitors can view and download this PDF</span></span>
                <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />
              </label>
              <button type="submit" disabled={!file || uploading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><FiUploadCloud />{uploading ? "Uploading to Cloudinary..." : resume ? "Upload & Replace Resume" : "Upload Resume"}</button>
            </form>
          </section>

          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="font-heading text-lg font-bold">Current Resume</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Stored resume information</p></div><FiFileText className="text-[var(--color-primary)]" size={23} /></div>
            {!resume ? (
              <div className="flex min-h-56 flex-col items-center justify-center text-center"><FiFile size={38} className="text-[var(--color-muted)]" /><h3 className="mt-3 font-semibold">No resume uploaded</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Choose a PDF to publish your resume.</p></div>
            ) : (
              <>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  <div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500"><FiFileText size={23} /></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold">{resume.fileName}</p><p className="mt-1 text-xs text-[var(--color-muted)]">PDF document · {formatBytes(resume.fileSize)}</p></div></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-xs"><div><p className="text-[var(--color-muted)]">Last updated</p><p className="mt-1 font-medium">{formatDate(resume.lastUpdated)}</p></div><div><p className="text-[var(--color-muted)]">Visibility</p><p className="mt-1 inline-flex items-center gap-1 font-medium">{resume.isVisible ? <><FiEye className="text-emerald-500" /> Public</> : <><FiEyeOff /> Hidden</>}</p></div></div>
                </div>
                <form onSubmit={handleSave} className="mt-4 space-y-3">
                  <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--color-primary)] disabled:opacity-50"><FiSave />{saving ? "Saving..." : "Save Details & Visibility"}</button>
                </form>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-3 py-2.5 text-xs font-bold text-white"><FiExternalLink /> Preview PDF</a>
                  <a href={resume.fileUrl} download={resume.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-xs font-bold"><FiDownload /> Download</a>
                </div>
                <button type="button" onClick={handleDelete} disabled={deleting} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/5 disabled:opacity-50"><FiTrash2 />{deleting ? "Deleting..." : "Delete Resume"}</button>
              </>
            )}
          </section>
        </div>
      )}
      <p className="text-right text-xs text-[var(--color-muted)]"><FiHardDrive className="mr-1 inline" /> Secure admin-only upload · Cloudinary storage</p>
    </div>
  );
};

export default Resume;
