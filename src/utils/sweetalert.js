import Swal from 'sweetalert2';

// 1. Toast Notification Mixin
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'civic-swal-toast border border-neutral-300 shadow-lg rounded-xl',
    title: 'text-xs font-semibold text-neutral-900',
    timerProgressBar: 'bg-emerald-600',
  }
});

/**
 * Trigger smooth SweetAlert2 toast notification
 * @param {string} title 
 * @param {'success'|'error'|'warning'|'info'|'question'} icon 
 */
export const showToast = (title, icon = 'success') => {
  return Toast.fire({
    icon,
    title,
  });
};

/**
 * Trigger official Civic Modal Alert
 */
export const showAlert = ({
  title,
  text,
  html,
  icon = 'success',
  confirmButtonText = 'Selesai & Tutup',
}) => {
  return Swal.fire({
    title,
    text,
    html,
    icon,
    confirmButtonText,
    buttonsStyling: false,
    customClass: {
      popup: 'civic-card p-6 rounded-2xl border border-neutral-300 shadow-2xl bg-white text-neutral-900',
      title: 'text-base font-black text-neutral-950 font-sans tracking-tight',
      htmlContainer: 'text-xs text-neutral-600 leading-relaxed font-sans',
      confirmButton: 'px-5 py-2.5 bg-primary-800 hover:bg-primary-900 active:bg-primary-950 text-white font-bold text-xs rounded-lg transition shadow-xs',
    }
  });
};

/**
 * Trigger confirmation dialog with Yes/No action
 */
export const showConfirm = async ({
  title,
  text,
  html,
  icon = 'question',
  confirmButtonText = 'Ya, Lanjutkan',
  cancelButtonText = 'Batal',
  confirmColorClass = 'bg-primary-800 hover:bg-primary-900'
}) => {
  return Swal.fire({
    title,
    text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      popup: 'civic-card p-6 rounded-2xl border border-neutral-300 shadow-2xl bg-white text-neutral-900',
      title: 'text-base font-black text-neutral-950 font-sans tracking-tight',
      htmlContainer: 'text-xs text-neutral-600 leading-relaxed font-sans',
      confirmButton: `px-4 py-2.5 ${confirmColorClass} text-white font-bold text-xs rounded-lg transition shadow-xs ml-2`,
      cancelButton: 'px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-lg border border-neutral-300 transition mr-2',
      actions: 'flex items-center justify-end gap-2 pt-2'
    }
  });
};

/**
 * Trigger simulated WhatsApp incoming alert modal with official branding
 */
export const showWhatsAppAlert = ({
  recipient,
  ticketNumber,
  message,
  onOpenDetails
}) => {
  return Swal.fire({
    title: 'Notifikasi WhatsApp Otomatis',
    html: `
      <div class="text-left space-y-3 pt-1">
        <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
          <span class="text-emerald-950 font-semibold">Tujuan: <b>${recipient}</b></span>
          <span class="font-mono text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">#${ticketNumber}</span>
        </div>
        <div class="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-800 text-xs leading-relaxed font-sans whitespace-pre-line">
          ${message}
        </div>
        <div class="text-[10px] text-neutral-400 flex items-center justify-between">
          <span>✓ Terkirim otomatis via SAPA-JARAK Gateway</span>
          <span>${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>
      </div>
    `,
    icon: 'success',
    showCancelButton: Boolean(onOpenDetails),
    confirmButtonText: 'Tutup Notifikasi',
    cancelButtonText: 'Lacak Tiket Ini →',
    buttonsStyling: false,
    customClass: {
      popup: 'civic-card p-6 rounded-2xl border border-neutral-300 shadow-2xl bg-white text-neutral-900 max-w-md',
      title: 'text-sm font-black text-neutral-950 font-sans tracking-tight',
      confirmButton: 'px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-lg border border-neutral-300 transition',
      cancelButton: 'px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition ml-2',
      actions: 'flex items-center justify-end gap-2 pt-3'
    }
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.cancel && onOpenDetails) {
      onOpenDetails();
    }
  });
};

export default {
  showToast,
  showAlert,
  showConfirm,
  showWhatsAppAlert,
};
