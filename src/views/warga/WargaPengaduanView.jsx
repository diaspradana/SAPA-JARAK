import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  Send,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Hash,
  ChevronDown,
  Trash2,
} from 'lucide-react';

const TYPE_OPTIONS = [
  { id: 'PERTANYAAN', label: 'Pertanyaan', desc: 'Tanyakan sesuatu tentang program bantuan', emoji: '❓' },
  { id: 'KOREKSI_DATA', label: 'Koreksi Data', desc: 'Laporkan kesalahan data pengajuan Anda', emoji: '✏️' },
  { id: 'KELUHAN', label: 'Keluhan', desc: 'Sampaikan keluhan terkait layanan', emoji: '📢' },
];

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
  } catch { return isoString; }
};

export default function WargaPengaduanView() {
  const { currentUser, applications, showToast } = useApp();

  const [selectedType, setSelectedType] = useState('PERTANYAAN');
  const [ticketRef, setTicketRef] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [sentList, setSentList] = useState([]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  const myApplications = applications.filter(
    (app) =>
      app.beneficiaryName === currentUser?.name ||
      app.reporterName === currentUser?.name ||
      app.phone === currentUser?.phone
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      showToast('Pesan terlalu singkat. Minimal 10 karakter.', 'warning');
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 900));

    const pengaduanNumber = `PDU-${selectedType.substring(0, 3)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPengaduan = {
      id: Date.now(),
      pengaduanNumber,
      type: selectedType,
      ticketRef: ticketRef.trim() || null,
      message: message.trim(),
      sentAt: new Date().toISOString(),
      status: 'Diterima',
    };

    setSentList((prev) => [newPengaduan, ...prev]);
    setSubmitted(pengaduanNumber);
    setMessage('');
    setTicketRef('');
    setSubmitting(false);
    showToast('Pengaduan berhasil dikirim!', 'success');
  };

  const handleDelete = (id) => {
    setSentList((prev) => prev.filter((p) => p.id !== id));
  };

  const selectedTypeObj = TYPE_OPTIONS.find((t) => t.id === selectedType);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageCircle size={22} className="text-emerald-600" />
          Pengaduan / Bantuan
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sampaikan pertanyaan, koreksi data, atau keluhan kepada petugas Desa Jarak.
        </p>
      </div>

      {/* Success Banner */}
      {submitted && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Pengaduan Berhasil Dikirim!</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              Nomor Pengaduan: <span className="font-bold font-mono">{submitted}</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              Petugas desa akan merespons dalam 1–3 hari kerja. Simpan nomor pengaduan Anda.
            </p>
          </div>
          <button onClick={() => setSubmitted(null)} className="text-emerald-400 hover:text-emerald-600 ml-auto">×</button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700 px-5 py-3">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Form Pengaduan Baru</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama (readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Nama Pengirim</label>
            <input
              type="text"
              value={currentUser?.name || ''}
              readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Jenis Pengaduan</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              >
                <span>{selectedTypeObj?.emoji} {selectedTypeObj?.label}</span>
                <ChevronDown size={15} className="text-gray-400" />
              </button>
              {typeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl z-10 overflow-hidden">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => { setSelectedType(opt.id); setTypeDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors ${selectedType === opt.id ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{opt.label}</div>
                        <div className="text-xs text-gray-400">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional ticket reference */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
              No. Registrasi Pengajuan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <div className="relative">
              <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              >
                <option value="">-- Tidak terkait pengajuan tertentu --</option>
                {myApplications.map((app) => (
                  <option key={app.id} value={app.ticketNumber}>
                    #{app.ticketNumber} – {app.assistanceType} ({app.dusunName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
              Isi Pengaduan / Pesan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              minLength={10}
              placeholder="Tuliskan pengaduan, pertanyaan, atau koreksi data Anda secara detail di sini..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none leading-relaxed"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Minimal 10 karakter</span>
              <span>{message.length} karakter</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || message.trim().length < 10}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
            ) : (
              <><Send size={16} /> Kirim Pengaduan</>
            )}
          </button>
        </form>
      </div>

      {/* Sent List */}
      {sentList.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Pengaduan Terkirim (Sesi Ini)
          </h3>
          <div className="space-y-3">
            {sentList.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-mono text-xs text-emerald-700 dark:text-emerald-400">{p.pengaduanNumber}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {TYPE_OPTIONS.find((t) => t.id === p.type)?.emoji} {TYPE_OPTIONS.find((t) => t.id === p.type)?.label}
                      {p.ticketRef && <> · #{p.ticketRef}</>}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{p.message}</p>
                    <div className="text-[10px] text-gray-400 mt-1">{formatDate(p.sentAt)}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    title="Hapus dari daftar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-5 space-y-3">
        <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300">Kontak Langsung Balai Desa</h3>
        {[
          { icon: MapPin, text: 'Jl. Desa Jarak No. 1, Plosoklaten, Kediri' },
          { icon: Phone, text: '(0354) 123-4567' },
          { icon: Clock, text: 'Senin – Jumat: 08.00 – 14.00 WIB' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.text} className="flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-400">
              <Icon size={14} className="shrink-0" />
              <span>{c.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
