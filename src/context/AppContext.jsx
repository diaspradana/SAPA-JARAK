import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_APPLICATIONS, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { DUSUN_LIST, STATUS_STAGES } from '../data/desaConfig';
import { 
  showToast as swalToast, 
  showAlert as swalAlert, 
  showConfirm as swalConfirm, 
  showWhatsAppAlert as swalWhatsAppAlert 
} from '../utils/sweetalert';

const AppContext = createContext();

const STORAGE_KEY_APPS = 'sapa_jarak_apps_v1';
const STORAGE_KEY_NOTIFS = 'sapa_jarak_notifs_v1';
const STORAGE_KEY_ROLE = 'sapa_jarak_role_v1';
const STORAGE_KEY_LOWBW = 'sapa_jarak_lowbw_v1';
const STORAGE_KEY_THEME = 'sapa_jarak_theme_v1';

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ROLE) || 'public';
    } catch {
      return 'public';
    }
  });

  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_LOWBW) === 'true';
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState('home');
  const [activeTicketNumber, setActiveTicketNumber] = useState(null);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Sync theme to <html> tag and LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      swalToast(next === 'dark' ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan', 'info');
      return next;
    });
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, activeRole);
    } catch (e) {
      console.error(e);
    }
  }, [activeRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOWBW, lowBandwidthMode ? 'true' : 'false');
      if (lowBandwidthMode) {
        document.body.classList.add('low-bandwidth-active');
      } else {
        document.body.classList.remove('low-bandwidth-active');
      }
    } catch (e) {
      console.error(e);
    }
  }, [lowBandwidthMode]);

  const showToast = (message, type = 'success') => {
    swalToast(message, type);
  };

  const showAlert = swalAlert;
  const showConfirm = swalConfirm;
  const showWhatsAppAlert = swalWhatsAppAlert;

  const triggerWhatsAppAlert = (recipient, ticketNumber, message, title = 'Notifikasi WhatsApp Baru') => {
    const notif = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient,
      ticketNumber,
      message,
      title
    };
    setNotifications(prev => [notif, ...prev]);
    setActiveWhatsAppModal(notif);
  };

  // 1. Submit New Application (Public)
  const submitApplication = (formData) => {
    const dusunObj = DUSUN_LIST.find(d => d.id === formData.dusunId) || DUSUN_LIST[0];
    const year = new Date().getFullYear();
    const count = applications.filter(a => a.dusunId === formData.dusunId).length + 1;
    const ticketNumber = `JRK-${dusunObj.code}-${year}-${String(count).padStart(3, '0')}`;
    
    // Mask name for public privacy
    const rawName = formData.beneficiaryName || "Pemohon";
    const nameParts = rawName.split(" ");
    const maskedName = nameParts.length > 1 
      ? `${nameParts[0]} ${nameParts[1][0]}*****` 
      : `${rawName.substring(0, 3)}*****`;

    const newApp = {
      id: `APP-${Date.now()}`,
      ticketNumber,
      assistanceType: formData.assistanceType,
      dusunId: formData.dusunId,
      dusunName: dusunObj.name,
      rt: formData.rt || "01",
      rw: formData.rw || "01",
      address: formData.address || `RT ${formData.rt || "01"} / RW ${formData.rw || "01"}, Dusun ${dusunObj.name}, Desa Jarak`,
      
      beneficiaryName: formData.beneficiaryName,
      beneficiaryMaskedName: maskedName,
      nik: formData.nik || "3506120000000000",
      kkNumber: formData.kkNumber || "3506120000000000",
      phone: formData.phone || formData.reporterPhone,
      isUnregistered: !!formData.isUnregistered,
      
      reporterName: formData.reporterName,
      reporterPhone: formData.reporterPhone,
      reporterRelation: formData.reporterRelation || "Diri Sendiri",
      
      description: formData.description,
      status: "WAITING_KASUN",
      submittedAt: new Date().toISOString(),
      
      photos: {
        initial: formData.photos && formData.photos.length > 0 
          ? formData.photos 
          : ["https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80"]
      },
      
      timeline: [
        {
          status: "SUBMITTED",
          title: "Pengajuan Diterima",
          time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
          note: "Laporan bantuan berhasil dikirim dan diverifikasi melalui nomor WhatsApp."
        },
        {
          status: "WAITING_KASUN",
          title: "Menunggu Verifikasi Kasun",
          time: new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
          note: `Notifikasi diteruskan ke Kepala Dusun ${dusunObj.name} (${dusunObj.kasunName}).`
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Send simulated WhatsApp notification
    triggerWhatsAppAlert(
      formData.reporterPhone,
      ticketNumber,
      `Halo ${formData.reporterName}, pengajuan bantuan ${formData.assistanceType} di Desa Jarak telah berhasil didaftarkan dengan Nomor Tiket #${ticketNumber}. Pantau status terkini secara transparan melalui: https://sapa-jarak.desa.id/lacak?ticket=${ticketNumber}`,
      'Pengajuan Bantuan Terdaftar'
    );

    showToast(`Pengajuan berhasil dikirim! Nomor Tiket: #${ticketNumber}`, 'success');
    return newApp;
  };

  // 2. Kasun updates Survey & Recommends to Village
  const submitKasunSurvey = (ticketNumber, surveyData) => {
    setApplications(prev => prev.map(app => {
      if (app.ticketNumber !== ticketNumber) return app;

      const updatedStatus = surveyData.isReturned ? "RETURNED" : "FORWARDED_TO_DESA";
      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

      const newTimelineItems = [
        {
          status: "KASUN_SURVEY",
          title: "Survei Kasun Selesai",
          time: nowStr,
          note: `Kasun telah melakukan survei lapangan (Skor Kelayakan: ${surveyData.score}/100). Catatan: ${surveyData.notes}`
        }
      ];

      if (surveyData.isReturned) {
        newTimelineItems.push({
          status: "RETURNED",
          title: "Dikembalikan dengan Catatan",
          time: nowStr,
          note: `Perlu perbaikan berkas: ${surveyData.returnNotes}`
        });
      } else {
        newTimelineItems.push({
          status: "FORWARDED_TO_DESA",
          title: "Direkomendasikan ke Pemerintah Desa",
          time: nowStr,
          note: `Diteruskan ke Kasi Kesra & Kepala Desa Jarak untuk validasi & penetapan pendanaan.`
        });
      }

      return {
        ...app,
        status: updatedStatus,
        survey: {
          verifiedBy: surveyData.verifiedBy || "Kepala Dusun",
          verifiedAt: new Date().toISOString(),
          coordinates: surveyData.coordinates || { lat: -7.9045, lng: 112.1894 },
          notes: surveyData.notes,
          scoringParams: surveyData.scoringParams,
          score: surveyData.score,
          recommendation: surveyData.recommendation
        },
        photos: {
          ...app.photos,
          survey: surveyData.surveyPhotos || app.photos.survey || []
        },
        timeline: [...app.timeline, ...newTimelineItems]
      };
    }));

    const app = applications.find(a => a.ticketNumber === ticketNumber);
    if (app) {
      if (surveyData.isReturned) {
        triggerWhatsAppAlert(
          app.phone,
          ticketNumber,
          `Pengajuan #${ticketNumber} memerlukan tindak lanjut: ${surveyData.returnNotes}. Silakan hubungi Kasun setempat untuk koordinasi perbaikan data.`
        );
      } else {
        triggerWhatsAppAlert(
          app.phone,
          ticketNumber,
          `Kabar baik, pengajuan #${ticketNumber} telah selesai disurvei lapangan oleh Kasun dengan skor kelayakan ${surveyData.score}/100 dan direkomendasikan ke Pemerintah Desa Jarak.`
        );
      }
    }

    showToast("Hasil survei Kasun berhasil disimpan & diteruskan ke Desa!", "success");
  };

  // 3. Desa validates & approves funding
  const approveDesaFunding = (ticketNumber, fundingData) => {
    setApplications(prev => prev.map(app => {
      if (app.ticketNumber !== ticketNumber) return app;

      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

      return {
        ...app,
        status: "FUNDING_APPROVED",
        funding: {
          source: fundingData.source,
          budget: Number(fundingData.budget),
          approvedBy: "Kasi Kesejahteraan & Kepala Desa Jarak",
          approvedAt: new Date().toISOString(),
          dtksMatched: fundingData.dtksMatched ?? true,
          dtksDesil: fundingData.dtksDesil || "Desil 1 (Sangat Miskin)",
          duplicateCheckPassed: true,
          notes: fundingData.notes
        },
        timeline: [
          ...app.timeline,
          {
            status: "FUNDING_APPROVED",
            title: "Bantuan & Anggaran Disetujui Pemdes",
            time: nowStr,
            note: `Disetujui alokasi dana sebesar Rp ${Number(fundingData.budget).toLocaleString('id-ID')} bersumber dari ${fundingData.source}.`
          }
        ]
      };
    }));

    const app = applications.find(a => a.ticketNumber === ticketNumber);
    if (app) {
      triggerWhatsAppAlert(
        app.phone,
        ticketNumber,
        `Selamat! Pengajuan bantuan #${ticketNumber} telah DISETUJUI oleh Pemerintah Desa Jarak dengan alokasi anggaran Rp ${Number(fundingData.budget).toLocaleString('id-ID')} dari ${fundingData.source}. Tahap pengadaan/pengerjaan segera dimulai.`
      );
    }

    showToast("Bantuan dan sumber pendanaan berhasil disetujui!", "success");
  };

  // 4. Update Procurement & Progress
  const updateProcurementProgress = (ticketNumber, procurementData) => {
    setApplications(prev => prev.map(app => {
      if (app.ticketNumber !== ticketNumber) return app;

      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      const nextStatus = procurementData.progress >= 100 ? "HANDOVER" : "PROCUREMENT";

      return {
        ...app,
        status: nextStatus,
        procurement: {
          ...app.procurement,
          contractor: procurementData.contractor || app.procurement?.contractor || "Swakelola Desa",
          rabMaterials: procurementData.rabMaterials || app.procurement?.rabMaterials || [],
          totalCost: procurementData.totalCost || app.procurement?.totalCost || 0,
          progress: procurementData.progress,
          statusText: procurementData.statusText || `Pengerjaan fisik mencapai progres ${procurementData.progress}%`
        },
        photos: {
          ...app.photos,
          ...(procurementData.progress >= 50 && procurementData.photo50 ? { progress50: [procurementData.photo50] } : {}),
          ...(procurementData.progress >= 100 && procurementData.photo100 ? { progress100: [procurementData.photo100] } : {})
        },
        timeline: [
          ...app.timeline,
          {
            status: "PROCUREMENT",
            title: `Progres Pelaksanaan ${procurementData.progress}%`,
            time: nowStr,
            note: procurementData.statusText || `Progres pelaksanaan fisik ${procurementData.progress}%.`
          }
        ]
      };
    }));

    showToast(`Progres pengerjaan diperbarui: ${procurementData.progress}%`, "success");
  };

  // 5. Complete Handover BAST & Publish to Transparency
  const completeHandoverBAST = (ticketNumber, handoverData) => {
    setApplications(prev => prev.map(app => {
      if (app.ticketNumber !== ticketNumber) return app;

      const nowStr = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

      return {
        ...app,
        status: "COMPLETED",
        handover: {
          bastNumber: handoverData.bastNumber || `BAST/${app.assistanceType}/${app.ticketNumber.split('-')[1]}/${new Date().getFullYear()}`,
          handoverDate: handoverData.handoverDate || new Date().toISOString().split('T')[0],
          recipientSignature: handoverData.recipientSignature || null,
          officerSignature: handoverData.officerSignature || null,
          notes: handoverData.notes || "Bantuan diserahkan dalam keadaan baik dan lengkap.",
          publicPublished: true
        },
        photos: {
          ...app.photos,
          handover: handoverData.handoverPhoto || app.photos?.handover || "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80"
        },
        timeline: [
          ...app.timeline,
          {
            status: "COMPLETED",
            title: "Serah Terima BAST & Publikasi Transparansi",
            time: nowStr,
            note: `Berita Acara Serah Terima (${handoverData.bastNumber || 'BAST'}) telah disahkan dan data agregat masuk ke Dashboard Transparansi Publik.`
          }
        ]
      };
    }));

    const app = applications.find(a => a.ticketNumber === ticketNumber);
    if (app) {
      triggerWhatsAppAlert(
        app.phone,
        ticketNumber,
        `Penyerahan bantuan #${ticketNumber} telah SELESAI dan dokumen Berita Acara Serah Terima (BAST) telah diterbitkan. Terima kasih atas kerja sama masyarakat Desa Jarak.`
      );
    }

    showToast("BAST berhasil disahkan & Bantuan dipublikasikan ke Transparansi Terbuka!", "success");
  };

  // Reset database to initial seed
  const resetDatabase = () => {
    setApplications(INITIAL_APPLICATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY_APPS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    showToast("Data simulasi SAPA-JARAK berhasil di-reset ke data awal.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        applications,
        notifications,
        activeRole,
        setActiveRole,
        currentView,
        setCurrentView,
        activeTicketNumber,
        setActiveTicketNumber,
        activeWhatsAppModal,
        setActiveWhatsAppModal,
        lowBandwidthMode,
        setLowBandwidthMode,
        toastMessage,
        showToast,
        showAlert,
        showConfirm,
        showWhatsAppAlert,
        isNotifDrawerOpen,
        setIsNotifDrawerOpen,
        submitApplication,
        submitKasunSurvey,
        approveDesaFunding,
        updateProcurementProgress,
        completeHandoverBAST,
        resetDatabase,
        triggerWhatsAppAlert
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
