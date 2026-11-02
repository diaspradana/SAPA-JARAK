import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Edit3,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Hash,
  Shield,
  AlertTriangle,
} from 'lucide-react';

export default function WargaProfilView() {
  const { currentUser, updateProfile, updatePassword, showToast } = useApp();

  const [editMode, setEditMode] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    nik: currentUser?.nik || '',
    kkNumber: currentUser?.kkNumber || '',
    address: currentUser?.address || '',
    rt: currentUser?.rt || '',
    rw: currentUser?.rw || '',
  });

  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSaveProfile = async () => {
    if (!editData.name.trim()) {
      showToast('Nama tidak boleh kosong.', 'warning');
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await updateProfile(editData);
      setEditData({
        name: updated.name || '',
        email: updated.email || '',
        phone: updated.phone || '',
        nik: updated.nik || '',
        kkNumber: updated.kkNumber || '',
        address: updated.address || '',
        rt: updated.rt || '',
        rw: updated.rw || '',
      });
      setEditMode(false);
    } catch (error) {
      showToast(error.message || 'Profil gagal disimpan ke server.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      nik: currentUser?.nik || '',
      kkNumber: currentUser?.kkNumber || '',
      address: currentUser?.address || '',
      rt: currentUser?.rt || '',
      rw: currentUser?.rw || '',
    });
    setEditMode(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.old || !pwForm.new || !pwForm.confirm) {
      showToast('Mohon isi semua kolom kata sandi.', 'warning');
      return;
    }
    if (pwForm.new.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'warning');
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      const response = await updatePassword(pwForm.old, pwForm.new);
      setPwSuccess(true);
      setPwForm({ old: '', new: '', confirm: '' });
      showToast(response.message || 'Kata sandi berhasil diperbarui di server.', 'success');
      setTimeout(() => setPwSuccess(false), 4000);
    } catch (error) {
      showToast(error.message || 'Kata sandi gagal diperbarui di server.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const infoFields = [
    { key: 'nik', label: 'NIK', icon: Hash, value: currentUser?.nik || '-' },
    { key: 'kkNumber', label: 'No. KK', icon: Hash, value: currentUser?.kkNumber || '-' },
    { key: 'phone', label: 'No. Handphone', icon: Phone, value: currentUser?.phone || '-' },
    { key: 'email', label: 'Email', icon: Mail, value: currentUser?.email || '-' },
    { key: 'dusunName', label: 'Dusun', icon: MapPin, value: currentUser?.dusunName ? `Dusun ${currentUser.dusunName}` : '-' },
    { key: 'address', label: 'Alamat Lengkap', icon: MapPin, value: currentUser?.address || '-' },
  ];

  const initials = currentUser?.avatarInitials || currentUser?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'WG';

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <User size={22} className="text-emerald-600" />
          Profil Saya
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi pribadi dan keamanan akun Anda.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-6 flex items-center gap-5">
          <div className="w-18 h-18 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur text-white text-2xl font-black flex items-center justify-center shadow-inner border-2 border-white/30 shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{currentUser?.name}</h2>
            <p className="text-emerald-100 text-sm">{currentUser?.roleLabel || 'Warga Desa Jarak'}</p>
            {currentUser?.dusunName && (
              <p className="text-emerald-200 text-xs mt-0.5">Dusun {currentUser.dusunName}</p>
            )}
          </div>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 backdrop-blur text-white text-xs font-bold hover:bg-white/25 transition-colors border border-white/20"
            >
              <Edit3 size={13} /> Edit
            </button>
          )}
        </div>

        {/* Info Fields */}
        <div className="p-5 space-y-3">
          {editMode ? (
            // Edit Form
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">NIK</label>
                  <input
                    type="text"
                    value={editData.nik}
                    onChange={(e) => setEditData({ ...editData, nik: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">No. KK</label>
                  <input
                    type="text"
                    value={editData.kkNumber}
                    onChange={(e) => setEditData({ ...editData, kkNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">No. HP</label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">RT</label>
                  <input
                    type="text"
                    value={editData.rt}
                    onChange={(e) => setEditData({ ...editData, rt: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">RW</label>
                  <input
                    type="text"
                    value={editData.rw}
                    onChange={(e) => setEditData({ ...editData, rw: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Alamat Lengkap</label>
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={handleSaveProfile}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Save size={15} /> {profileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            // Display Fields
            <div className="space-y-1">
              {infoFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-neutral-800 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{field.label}</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5 break-all">{field.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 px-5 py-3 flex items-center gap-2">
          <Lock size={15} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Ganti Kata Sandi</h2>
        </div>

        {pwSuccess && (
          <div className="mx-5 mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
            <CheckCircle2 size={16} />
            Kata sandi berhasil diubah!
          </div>
        )}

        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {[
            { key: 'old', label: 'Kata Sandi Lama', placeholder: 'Masukkan kata sandi saat ini' },
            { key: 'new', label: 'Kata Sandi Baru', placeholder: 'Minimal 6 karakter' },
            { key: 'confirm', label: 'Konfirmasi Kata Sandi Baru', placeholder: 'Ulangi kata sandi baru' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={showPw[field.key] ? 'text' : 'password'}
                  value={pwForm[field.key]}
                  onChange={(e) => setPwForm({ ...pwForm, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, [field.key]: !showPw[field.key] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {field.key === 'confirm' && pwForm.new && pwForm.confirm && pwForm.new !== pwForm.confirm && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} /> Kata sandi tidak cocok
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={pwLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {pwLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" /> Mengubah...</>
            ) : (
              <><Lock size={15} /> Ubah Kata Sandi</>
            )}
          </button>
        </form>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Shield size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-blue-900 dark:text-blue-300">Keamanan Akun</div>
          <div className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
            Jangan bagikan kata sandi Anda kepada siapapun. Petugas desa tidak akan pernah meminta kata sandi Anda. Segera ubah jika Anda merasa akun dikompromikan.
          </div>
        </div>
      </div>
    </div>
  );
}
