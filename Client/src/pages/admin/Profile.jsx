import { useCallback, useEffect, useState } from "react";
import {
  FiUser, FiMail, FiShield, FiCalendar, FiClock, FiSave,
  FiLock, FiEye, FiEyeOff, FiRefreshCw, FiCheckCircle, FiAlertCircle,
  FiCamera, FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-US", { day: "2-digit", month: "long", year: "numeric" });
};

const Profile = () => {
  const { admin, updateAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "", isActive: true, createdAt: "", lastLoginAt: "", profileImage: { url: "", publicId: "" } });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
    return data;
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/admin/profile");
      const current = data.admin || {};
      setProfile({
        name: current.name || "",
        email: current.email || "",
        isActive: Boolean(current.isActive),
        createdAt: current.createdAt || "",
        lastLoginAt: current.lastLoginAt || "",
        profileImage: current.profileImage || { url: "", publicId: "" },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowed.includes(file.type)) {
      setError("Choose a JPG, PNG, WEBP or AVIF image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setUploadingImage(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await request("/admin/profile/photo", { method: "POST", body: formData });
      const updatedAdmin = data.admin || {};
      setProfile((current) => ({ ...current, profileImage: updatedAdmin.profileImage || current.profileImage }));
      updateAdmin(updatedAdmin);
      setNotice(data.message || "Profile photo updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      setImageInputKey((key) => key + 1);
    }
  };

  const handleImageRemove = async () => {
    if (!profile.profileImage?.url || removingImage) return;
    if (!window.confirm("Remove your profile photo?")) return;
    setRemovingImage(true);
    setError("");
    setNotice("");
    try {
      const data = await request("/admin/profile/photo", { method: "DELETE" });
      const updatedAdmin = data.admin || {};
      setProfile((current) => ({ ...current, profileImage: updatedAdmin.profileImage || { url: "", publicId: "" } }));
      updateAdmin(updatedAdmin);
      setNotice(data.message || "Profile photo removed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingImage(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setNotice("");
    try {
      const data = await request("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name.trim(), email: profile.email.trim() }),
      });
      const updated = data.admin || {};
      setProfile((current) => ({ ...current, name: updated.name || current.name, email: updated.email || current.email, profileImage: updated.profileImage || current.profileImage }));
      updateAdmin(updated);
      setNotice(data.message || "Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setError("");
    setNotice("");
    try {
      const data = await request("/admin/change-password", {
        method: "PATCH",
        body: JSON.stringify(passwords),
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice(data.message || "Password changed. Please sign in again.");
      await logout().catch(() => {});
      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)]";
  const labelClass = "mb-2 block text-sm font-semibold";

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Account & security</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">My Profile</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">Manage your administrator details and keep your account secure.</p>
        </div>
        <button type="button" onClick={loadProfile} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] disabled:opacity-50">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </section>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500"><FiAlertCircle className="mt-0.5 shrink-0" />{error}</div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-500"><FiCheckCircle className="mt-0.5 shrink-0" />{notice}</div>}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--color-muted)]"><FiRefreshCw className="animate-spin" /> Loading account details...</div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="h-28 bg-gradient-to-r from-[var(--color-primary)]/20 via-[var(--color-primary)]/5 to-transparent" />
            <div className="-mt-10 flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--color-surface)] bg-[var(--color-primary)] text-3xl font-bold text-slate-950 shadow-sm">
                  {profile.profileImage?.url ? <img src={profile.profileImage.url} alt="Admin profile" className="h-full w-full object-cover" /> : (profile.name || admin?.name || "A").charAt(0).toUpperCase()}
                </div>
                <div className="pb-1">
                  <h2 className="font-heading text-xl font-bold">{profile.name || "Administrator"}</h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{profile.email}</p>
                </div>
              <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:ml-5">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-primary)] px-3.5 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110">
                  <FiCamera size={15} /> {uploadingImage ? "Uploading..." : profile.profileImage?.url ? "Change photo" : "Upload photo"}
                  <input key={imageInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleImageUpload} disabled={uploadingImage} className="sr-only" />
                </label>
                {profile.profileImage?.url && <button type="button" onClick={handleImageRemove} disabled={removingImage} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3.5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-50"><FiTrash2 size={14} /> {removingImage ? "Removing..." : "Remove"}</button>}
              </div>
              </div>
              <span className={`mb-1 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${profile.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                <span className={`h-2 w-2 rounded-full ${profile.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                {profile.isActive ? "Account active" : "Account disabled"}
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiCalendar size={20} /></span>
              <div><p className="text-xs text-[var(--color-muted)]">Account created</p><p className="mt-1 text-sm font-semibold">{formatDate(profile.createdAt)}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><FiClock size={20} /></span>
              <div><p className="text-xs text-[var(--color-muted)]">Last login</p><p className="mt-1 text-sm font-semibold">{profile.lastLoginAt ? formatDate(profile.lastLoginAt) : "Not available"}</p></div>
            </div>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiUser size={19} /></span>
                <div><h2 className="font-heading text-lg font-bold">Personal information</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Update your admin name and email address.</p></div>
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div><label className={labelClass}>Full name</label><div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" /><input className={`${inputClass} pl-10`} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} minLength={2} maxLength={100} required placeholder="Your name" /></div></div>
                <div><label className={labelClass}>Email address</label><div className="relative"><FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" /><input type="email" className={`${inputClass} pl-10`} value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} required placeholder="admin@example.com" /></div></div>
                <button type="submit" disabled={savingProfile} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"><FiSave />{savingProfile ? "Saving changes..." : "Save profile changes"}</button>
              </form>
            </section>

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500"><FiShield size={19} /></span>
                <div><h2 className="font-heading text-lg font-bold">Change password</h2><p className="mt-1 text-xs text-[var(--color-muted)]">You will need to sign in again after changing it.</p></div>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {[
                  ["currentPassword", "Current password", "Enter current password"],
                  ["newPassword", "New password", "At least 8 characters"],
                  ["confirmPassword", "Confirm new password", "Re-enter new password"],
                ].map(([key, label, placeholder]) => (
                  <div key={key}><label className={labelClass}>{label}</label><div className="relative"><FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" /><input type={showPasswords ? "text" : "password"} autoComplete="new-password" className={`${inputClass} pl-10 pr-11`} value={passwords[key]} onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))} minLength={key === "currentPassword" ? undefined : 8} maxLength={128} required placeholder={placeholder} /><button type="button" onClick={() => setShowPasswords((v) => !v)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]">{showPasswords ? <FiEyeOff /> : <FiEye />}</button></div></div>
                ))}
                <p className="text-xs leading-5 text-[var(--color-muted)]">Use at least 8 characters. Changing your password will invalidate existing login sessions.</p>
                <button type="submit" disabled={savingPassword} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-bold transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"><FiLock />{savingPassword ? "Updating password..." : "Update password"}</button>
              </form>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
