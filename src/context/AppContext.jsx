import React, { createContext, useContext, useState, useEffect } from 'react';
import { DUSUN_LIST, STATUS_STAGES } from '../data/desaConfig';
import { 
  showToast as swalToast, 
  showAlert as swalAlert, 
  showConfirm as swalConfirm, 
  showWhatsAppAlert as swalWhatsAppAlert 
} from '../utils/sweetalert';

const AppContext = createContext();

const STORAGE_KEY_ROLE = 'sapa_jarak_role_v1';
const STORAGE_KEY_USER = 'sapa_jarak_user_v1';
const STORAGE_KEY_LOWBW = 'sapa_jarak_lowbw_v1';
const STORAGE_KEY_THEME = 'sapa_jarak_theme_v1';
const API_BASE_URL = '/api';

const API_STATUS_MAP = {
  DRAFT: 'SUBMITTED',
  SUBMITTED: 'WAITING_KASUN',
  WAITING_KASUN_VERIFICATION: 'WAITING_KASUN',
  KASUN_VERIFICATION: 'KASUN_SURVEY',
  RETURNED_WITH_NOTES: 'RETURNED',
  FORWARDED_TO_VILLAGE: 'FORWARDED_TO_DESA',
  VILLAGE_REVIEW: 'VILLAGE_REVIEW',
  APPROVED: 'FUNDING_APPROVED',
  FUNDING_ALLOCATED: 'FUNDING_APPROVED',
  PROCUREMENT_IN_PROGRESS: 'PROCUREMENT',
  READY_FOR_HANDOVER: 'HANDOVER',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

function mapServerApplication(application) {
  const beneficiary = application.beneficiary || {};
  const hamlet = application.hamlet || {};
  const hamletConfig = DUSUN_LIST.find((item) => (
    item.code.toLowerCase() === String(hamlet.code || '').toLowerCase()
    || item.name.toLowerCase() === String(hamlet.name || '').toLowerCase()
  ));
  const verification = application.latest_verification || application.latestVerification || {};
  const checklist = verification.parameters_checklist || {};
  const funding = application.funding || {};
  const procurement = application.procurement || {};
  const handover = application.handover || {};
  const auditLogs = application.audit_logs || application.auditLogs || [];
  const documents = application.documents || [];
  const timeline = auditLogs.map((entry) => {
    const newValues = entry.new_values || {};
    const status = API_STATUS_MAP[newValues.status] || newValues.status || entry.action;
    return {
      status,
      title: entry.action === 'APPLICATION_SUBMITTED' ? 'Pengajuan Diterima' : `Aktivitas: ${entry.action || 'Pembaruan data'}`,
      time: entry.created_at || '',
      note: newValues.reason || newValues.notes || newValues.meta?.reason || ''
    };
  });
  const ticketNumber = String(application.ticket_number || '').replace(/^#/, '');

  return {
    id: application.id,
    ticketNumber,
    assistanceType: application.assistance_type,
    dusunId: hamletConfig?.id || String(hamlet.id || ''),
    dusunName: hamlet.name || '',
    rt: beneficiary.rt || '',
    rw: beneficiary.rw || '',
    address: beneficiary.address || '',
    beneficiaryName: beneficiary.name || '',
    beneficiaryMaskedName: beneficiary.name ? `${beneficiary.name.slice(0, 1)}${'*'.repeat(Math.max(3, beneficiary.name.length - 1))}` : '',
    nik: beneficiary.nik || '',
    kkNumber: beneficiary.kk_number || '',
    phone: application.reporter_phone || beneficiary.phone || '',
    isUnregistered: Boolean(beneficiary.is_unregistered),
    reporterName: application.reporter_name || '',
    reporterPhone: application.reporter_phone || '',
    reporterRelation: application.reporter_relationship || '',
    description: application.description || '',
    status: API_STATUS_MAP[application.status] || application.status || 'SUBMITTED',
    submittedAt: application.submitted_at || application.created_at,
    surveyScheduledAt: application.survey_scheduled_at
      ? String(application.survey_scheduled_at).slice(0, 10)
      : '',
    survey: verification.id ? {
      verifiedBy: verification.verifier?.name || 'Petugas Kasun',
      verifiedAt: verification.verified_at,
      coordinates: { lat: verification.latitude, lng: verification.longitude },
      notes: verification.notes || '',
      scoringParams: checklist.input || checklist,
      score: verification.calculated_score,
      recommendation: verification.recommendation || ''
    } : null,
    funding: funding.id ? {
      source: funding.source,
      budget: Number(funding.allocated_budget || 0),
      approvedAt: funding.approved_at,
      dtksMatched: Boolean(beneficiary.dtks_status),
      dtksDesil: beneficiary.dtks_status || ''
    } : null,
    procurement: procurement.id ? {
      contractor: procurement.contractor_or_vendor || '',
      rabMaterials: (procurement.rab_items || []).map((item) => ({
        ...item,
        qty: item.quantity ?? item.qty,
        price: item.total ?? item.price
      })),
      totalCost: Number(procurement.total_rab || 0),
      progress: Number(procurement.progress_percentage || 0),
      statusText: procurement.field_notes || ''
    } : null,
    handover: handover.id ? {
      bastNumber: handover.bast_number,
      handoverDate: handover.handover_date,
      recipientSigned: Boolean(handover.signature_recipient_svg),
      officerSigned: Boolean(handover.signature_official_svg)
    } : null,
    photos: {
      initial: documents.filter((document) => document.document_type === 'FOTO_KONDISI_AWAL').map((document) => document.public_url).filter(Boolean),
      survey: documents.filter((document) => document.document_type === 'FOTO_SURVEI_KASUN').map((document) => document.public_url).filter(Boolean)
    },
    timeline
  };
}

function getApplicationsEndpoint(user) {
  const apiRole = user?.apiRole
    || (user?.role === 'public' ? 'public' : user?.role?.startsWith('kasun') ? 'kasun' : null);
  if (apiRole === 'public') return `${API_BASE_URL}/warga/applications`;
  if (apiRole === 'kasun') return `${API_BASE_URL}/kasun/queue`;
  return `${API_BASE_URL}/desa/dashboard`;
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const validationMessage = payload.errors
      ? Object.values(payload.errors).flat().join(' ')
      : '';
    throw new Error(validationMessage || payload.message || `Permintaan server gagal (${response.status}).`);
  }
  return payload;
}

function mapServerUser(apiUser, token) {
  let mappedRole = apiUser.role;
  if (apiUser.role === 'kasun') {
    const hCode = (apiUser.hamlet?.code || '').toLowerCase();
    const uName = (apiUser.name || '').toLowerCase();
    if (hCode === 'jl' || uName.includes('jarak lor') || uName.includes('putro')) mappedRole = 'kasun_jaraklor';
    else if (hCode === 'sg' || uName.includes('sagi') || uName.includes('miftahudin')) mappedRole = 'kasun_sagi';
    else if (hCode === 'kls' || uName.includes('kalasan timur') || uName.includes('septian')) mappedRole = 'kasun_kalasan';
    else if (hCode === 'sb' || uName.includes('kalasan barat') || uName.includes('simbar') || uName.includes('rindi')) mappedRole = 'kasun_simbar';
    else if (hCode === 'jk' || uName.includes('jarak kidul')) mappedRole = 'kasun_jarakkidul';
    else mappedRole = 'kasun';
  } else if (['kasi_kesra', 'kades', 'sekdes', 'admin'].includes(apiUser.role)) {
    mappedRole = 'desa';
  } else {
    mappedRole = 'public';
  }

  return {
    id: `user-${apiUser.id}`,
    serverId: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    nik: apiUser.nik || '',
    kkNumber: apiUser.kk_number || '',
    rt: apiUser.rt || '',
    rw: apiUser.rw || '',
    address: apiUser.address || '',
    role: mappedRole,
    apiRole: apiUser.role,
    position: {
      kades: 'Kepala Desa',
      sekdes: 'Sekretaris Desa',
      kasi_kesra: 'Petugas Verifikasi',
      admin: 'Administrator Sistem',
      kasun: 'Kepala Dusun',
      public: 'Warga'
    }[apiUser.role] || 'Petugas Desa',
    roleLabel: mappedRole === 'desa'
      ? ({
        kades: 'Kepala Desa Jarak',
        sekdes: 'Sekretaris Desa',
        kasi_kesra: 'Petugas Verifikasi',
        admin: 'Administrator Sistem'
      }[apiUser.role] || 'Pemerintah Desa Jarak')
      : (mappedRole.startsWith('kasun') ? `Kepala Dusun (${apiUser.hamlet?.name || 'Dusun'})` : 'Warga Masyarakat'),
    dusunName: apiUser.hamlet?.name || null,
    dusunId: DUSUN_LIST.find((dusun) => dusun.code.toLowerCase() === apiUser.hamlet?.code?.toLowerCase())?.id || null,
    hamletId: apiUser.hamlet_id || apiUser.hamlet?.id || null,
    token,
    avatarInitials: (apiUser.name || '').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  };
}

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

  const [applications, setApplications] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [registeredUsers] = useState([]);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [demoAccountsError, setDemoAccountsError] = useState('');

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role) return u.role;
      }
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

  const [currentView, setCurrentView] = useState(() => {
    // If a warga user was already logged in, start at their dashboard
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.role === 'public') return 'warga_dashboard';
        if (u?.role?.startsWith('kasun')) return 'kasun_dashboard';
        if (u?.role === 'desa' || u?.role === 'admin') return 'desa_dashboard';
      }
    } catch {}
    return 'home';
  });
  const [wargaView, setWargaView] = useState('beranda'); // internal warga dashboard sub-view
  const [loginRole, setLoginRole] = useState('warga'); // 'warga' | 'kasun' | 'desa'
  const [activeTicketNumber, setActiveTicketNumber] = useState(null);
  const [activeWhatsAppModal, setActiveWhatsAppModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.token) return undefined;

    let active = true;
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentUser.token}`
      }
    })
      .then(parseApiResponse)
      .then((payload) => {
        if (!active) return;
        const serverUser = mapServerUser(payload.data, currentUser.token);
        setCurrentUser(serverUser);
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(serverUser));
        } catch (error) {
          console.error('Gagal menyimpan cache sesi akun:', error);
        }
      })
      .catch((error) => {
        if (active) console.error('Gagal memuat profil akun dari server:', error);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.token]);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/auth/demo-accounts`, { headers: { Accept: 'application/json' } })
      .then(parseApiResponse)
      .then((payload) => {
        if (active && Array.isArray(payload.data)) {
          setDemoAccounts(payload.data);
          setDemoAccountsError('');
        }
      })
      .catch((error) => {
        if (active) setDemoAccountsError(error.message || 'Akun contoh tidak dapat dimuat dari server.');
      });
    return () => {
      active = false;
    };
  }, []);

  const openLogin = (role = 'warga') => {
    setLoginRole(role);
    setCurrentView('login');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  const openRegisterAccount = () => {
    setCurrentView('register');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

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

  useEffect(() => {
    if (!currentUser?.token) {
      setSyncStatus('idle');
      setSyncError('');
      return undefined;
    }

    let active = true;
    let loading = false;
    let timer;
    setApplications([]);
    const sync = async () => {
      if (loading) return;
      loading = true;
      setSyncStatus((status) => status === 'synced' ? status : 'syncing');
      try {
        const response = await fetch(getApplicationsEndpoint(currentUser), {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        const payload = await parseApiResponse(response);
        if (!Array.isArray(payload.data)) {
          throw new Error('Format data pengajuan dari server tidak sesuai.');
        }
        if (active) {
          setApplications(payload.data.map(mapServerApplication));
          setSyncStatus('synced');
          setSyncError('');
          setLastSyncedAt(new Date().toISOString());
        }
      } catch (error) {
        if (active) {
          setApplications([]);
          setSyncStatus('error');
          setSyncError(error.message || 'Gagal menyinkronkan data dari server.');
        }
      } finally {
        loading = false;
      }
    };

    sync();
    timer = window.setInterval(sync, 15000);
    window.addEventListener('focus', sync);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', sync);
    };
  }, [currentUser?.token, currentUser?.apiRole]);

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

  const serverRequest = async (path, options = {}) => {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (options.body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
    if (currentUser?.token) headers.Authorization = `Bearer ${currentUser.token}`;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : (isFormData ? options.body : JSON.stringify(options.body))
    });
    return parseApiResponse(response);
  };

  const fetchManagedAccounts = async (category) => {
    const accountsPayload = await serverRequest(`/admin/managed-accounts/${encodeURIComponent(category)}`);
    const hamletsPayload = category === 'kasun'
      ? await serverRequest('/admin/hamlets')
      : { data: [] };
    return {
      users: accountsPayload.data,
      hamlets: hamletsPayload.data
    };
  };

  const createManagedAccount = async (category, account) => (
    serverRequest(`/admin/managed-accounts/${encodeURIComponent(category)}`, {
      method: 'POST',
      body: account
    })
  );

  const updateManagedAccount = async (category, id, account) => (
    serverRequest(`/admin/managed-accounts/${encodeURIComponent(category)}/${id}`, {
      method: 'PUT',
      body: account
    })
  );

  const deleteManagedAccount = async (category, id) => (
    serverRequest(`/admin/managed-accounts/${encodeURIComponent(category)}/${id}`, {
      method: 'DELETE'
    })
  );

  const refreshApplications = async () => {
    if (!currentUser?.token) {
      throw new Error('Sesi akun belum terhubung ke server. Silakan masuk menggunakan akun server.');
    }
    setSyncStatus('syncing');
    try {
      const payload = await serverRequest(getApplicationsEndpoint(currentUser).replace(API_BASE_URL, ''));
      if (!Array.isArray(payload.data)) throw new Error('Format data pengajuan dari server tidak sesuai.');
      const syncedApplications = payload.data.map(mapServerApplication);
      setApplications(syncedApplications);
      setSyncStatus('synced');
      setSyncError('');
      setLastSyncedAt(new Date().toISOString());
      return syncedApplications;
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error.message);
      throw error;
    }
  };

  const trackApplication = async (ticketNumber) => {
    const ticket = String(ticketNumber || '').trim().replace(/^#/, '');
    if (!ticket) throw new Error('Masukkan nomor tiket untuk melacak pengajuan.');
    const payload = await serverRequest(`/public/applications/track/${encodeURIComponent(ticket)}`);
    return mapServerApplication(payload.data);
  };

  const updateKasunVisitSchedule = async (ticketNumber, scheduledAt) => {
    const application = getServerApplication(ticketNumber);
    const payload = await serverRequest(`/kasun/applications/${application.id}/schedule`, {
      method: 'PUT',
      body: { scheduled_at: scheduledAt || null }
    });
    const savedSchedule = payload.data.survey_scheduled_at
      ? String(payload.data.survey_scheduled_at).slice(0, 10)
      : '';
    setApplications((previous) => previous.map((item) => (
      item.ticketNumber === ticketNumber
        ? { ...item, surveyScheduledAt: savedSchedule }
        : item
    )));
    await refreshAfterServerWrite('Jadwal survei berhasil disimpan ke server.');
  };

  const updateProfile = async (profile) => {
    const payload = await serverRequest('/warga/profile', {
      method: 'PUT',
      body: {
        name: profile.name,
        email: profile.email || null,
        phone: profile.phone,
        nik: profile.nik || null,
        kk_number: profile.kkNumber || null,
        rt: profile.rt || null,
        rw: profile.rw || null,
        address: profile.address || null
      }
    });
    const updatedUser = mapServerUser(payload.data, currentUser?.token);
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    showToast(payload.message || 'Profil berhasil diperbarui di server.', 'success');
    return updatedUser;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const payload = await serverRequest('/auth/password', {
      method: 'PUT',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword
      }
    });
    return payload;
  };

  const refreshAfterServerWrite = async (successMessage) => {
    showToast(successMessage, 'success');
    try {
      await refreshApplications();
    } catch (error) {
      showToast(`Perubahan sudah diterima server, tetapi daftar terbaru gagal dimuat: ${error.message}`, 'warning');
    }
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

  const requestApplicationOtp = async (phone, name) => serverRequest('/public/otp/request', {
    method: 'POST',
    body: { phone, name }
  });

  const submitApplication = async (formData, photoFiles = []) => {
    const dusun = DUSUN_LIST.find((item) => item.id === formData.dusunId);
    if (!dusun) throw new Error('Dusun yang dipilih tidak dikenali.');

    const hamletPayload = await serverRequest('/public/hamlets');
    const hamlet = (hamletPayload.data || []).find((item) => (
      String(item.code).toLowerCase() === dusun.code.toLowerCase()
      || String(item.name).toLowerCase() === dusun.name.toLowerCase()
    ));
    if (!hamlet) throw new Error(`Data Dusun ${dusun.name} belum tersedia di server.`);

    const documentIds = [];
    for (const file of photoFiles) {
      if (!(file instanceof File)) continue;
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('document_type', 'FOTO_KONDISI_AWAL');
      uploadData.append('visibility', 'PUBLIC_MASKED');
      uploadData.append('blur_type', 'pixelate');
      const uploaded = await serverRequest('/documents/upload', { method: 'POST', body: uploadData });
      documentIds.push(uploaded.data.id);
    }

    const payload = await serverRequest('/public/applications', {
      method: 'POST',
      body: {
        beneficiary_name: formData.beneficiaryName,
        nik: formData.nik || null,
        kk_number: formData.kkNumber || null,
        beneficiary_phone: formData.phone || formData.reporterPhone,
        hamlet_id: hamlet.id,
        rt: formData.rt || '01',
        rw: formData.rw || '01',
        address: formData.address || `RT ${formData.rt || '01'} / RW ${formData.rw || '01'}, Dusun ${dusun.name}, Desa Jarak`,
        is_unregistered: Boolean(formData.isUnregistered),
        assistance_type: formData.assistanceType,
        reporter_name: formData.reporterName,
        reporter_phone: formData.reporterPhone,
        reporter_relationship: formData.reporterRelation || 'Diri Sendiri',
        description: formData.description,
        needs_description: formData.description,
        otp: formData.otp,
        document_ids: documentIds
      }
    });

    const created = {
      id: payload.data.id || payload.data.ticket_number,
      ticketNumber: String(payload.data.ticket_number || '').replace(/^#/, ''),
      assistanceType: formData.assistanceType,
      dusunId: dusun.id,
      dusunName: dusun.name,
      rt: formData.rt || '01',
      rw: formData.rw || '01',
      address: formData.address || '',
      beneficiaryName: formData.beneficiaryName,
      beneficiaryMaskedName: `${formData.beneficiaryName?.slice(0, 1) || 'W'}***`,
      nik: formData.nik || '',
      kkNumber: formData.kkNumber || '',
      phone: formData.phone || formData.reporterPhone,
      reporterName: formData.reporterName,
      reporterPhone: formData.reporterPhone,
      description: formData.description,
      status: API_STATUS_MAP[payload.data.status] || 'WAITING_KASUN',
      submittedAt: payload.data.submitted_at,
      photos: { initial: [], survey: [] },
      timeline: []
    };
    setApplications((previous) => [created, ...previous.filter((app) => app.ticketNumber !== created.ticketNumber)]);
    showToast(`Pengajuan tersimpan di server. Nomor tiket: #${created.ticketNumber}`, 'success');
    return created;
  };

  const getServerApplication = (ticketNumber) => {
    const application = applications.find((item) => item.ticketNumber === ticketNumber);
    if (!application || !Number.isInteger(Number(application.id))) {
      throw new Error('Berkas ini belum tersinkron ke server. Muat ulang dashboard dan coba lagi.');
    }
    return application;
  };

  const submitKasunSurvey = async (ticketNumber, surveyData) => {
    const application = getServerApplication(ticketNumber);
    for (const file of surveyData.surveyFiles || []) {
      if (!(file instanceof File)) continue;
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('application_id', String(application.id));
      uploadData.append('document_type', 'FOTO_SURVEI_KASUN');
      uploadData.append('visibility', 'PUBLIC_MASKED');
      uploadData.append('blur_type', 'pixelate');
      await serverRequest('/documents/upload', { method: 'POST', body: uploadData });
    }
    await serverRequest(`/kasun/applications/${application.id}/survey`, {
      method: 'POST',
      body: {
        latitude: surveyData.coordinates?.lat,
        longitude: surveyData.coordinates?.lng,
        parameters: surveyData.scoringParams || {},
        recommendation: surveyData.isReturned ? 'DIKEMBALIKAN' : 'LAYAK',
        notes: surveyData.isReturned
          ? `${surveyData.notes}\nCatatan perbaikan: ${surveyData.returnNotes}`
          : surveyData.notes,
        signature_svg: surveyData.signatureSvg || null
      }
    });
    await refreshAfterServerWrite('Hasil survei Kasun berhasil disimpan ke server.');
  };

  const approveDesaFunding = async (ticketNumber, fundingData) => {
    const application = getServerApplication(ticketNumber);
    await serverRequest(`/desa/applications/${application.id}/validate`, {
      method: 'POST',
      body: {
        decision: 'APPROVED',
        source: fundingData.source,
        allocated_budget: Number(fundingData.budget),
        notes: fundingData.notes
      }
    });
    await refreshAfterServerWrite('Keputusan dan alokasi bantuan berhasil disimpan ke server.');
  };

  const updateProcurementProgress = async (ticketNumber, procurementData) => {
    const application = getServerApplication(ticketNumber);
    await serverRequest(`/desa/applications/${application.id}/procurement`, {
      method: 'POST',
      body: {
        rab_items: (procurementData.rabMaterials || []).map((item) => ({
          item: item.item,
          quantity: item.qty,
          unit: item.unit,
          total: Number(item.price || 0)
        })),
        total_rab: Number(procurementData.totalCost || 0),
        progress_percentage: Number(procurementData.progress || 0),
        contractor_or_vendor: procurementData.contractor || '',
        field_notes: procurementData.statusText || ''
      }
    });
    await refreshAfterServerWrite(`Progres ${procurementData.progress}% berhasil disimpan ke server.`);
  };

  const completeHandoverBAST = async (ticketNumber, handoverData) => {
    const application = getServerApplication(ticketNumber);
    await serverRequest(`/desa/applications/${application.id}/handover`, {
      method: 'POST',
      body: {
        bast_number: handoverData.bastNumber,
        handover_date: handoverData.handoverDate || new Date().toISOString().slice(0, 10),
        recipient_name: application.beneficiaryName,
        signature_recipient_svg: handoverData.recipientSignature || null,
        signature_official_svg: handoverData.officerSignature || null,
        notes: handoverData.notes || 'Serah terima resmi telah dilakukan.'
      }
    });
    await refreshAfterServerWrite('BAST berhasil disimpan dan status diperbarui di server.');
  };

  // Authentication: Login
  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim();
    const cleanPw = (password || '').trim();

    if (!cleanId || !cleanPw) {
      showToast('Mohon masukkan email / no HP dan kata sandi.', 'warning');
      return { success: false, message: 'Mohon isi semua bidang.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login: cleanId, password: cleanPw })
      });
      const payload = await parseApiResponse(response);
      const foundUser = mapServerUser(payload.data.user, payload.data.access_token);

      setCurrentUser(foundUser);
      setActiveRole(foundUser.role);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
      localStorage.setItem(STORAGE_KEY_ROLE, foundUser.role);
      setCurrentView(foundUser.role.startsWith('kasun')
        ? 'kasun_dashboard'
        : foundUser.role === 'public' ? 'warga_dashboard' : 'desa_dashboard');
      showToast(`Berhasil masuk! Selamat datang, ${foundUser.name}.`, 'success');
      return { success: true, user: foundUser };
    } catch (error) {
      const message = error.message || 'Server tidak dapat dihubungi. Periksa koneksi MySQL dan Laravel.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Authentication: register warga or invited village administrator.
  const register = async (formData) => {
    if (!formData.name || !formData.phone || !formData.password) {
      showToast('Mohon lengkapi data wajib (Nama, No HP, Kata Sandi).', 'warning');
      return { success: false, message: 'Data tidak lengkap.' };
    }

    const isAdmin = formData.accountType === 'admin_desa';
    const cleanPhone = formData.phone.trim();
    const cleanEmail = formData.email ? formData.email.trim() : (
      isAdmin
        ? `admin.${cleanPhone.replace(/\D/g, '')}@jarak-kediri.desa.id`
        : `warga.${cleanPhone.replace(/\D/g, '')}@jarak-kediri.desa.id`
    );
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: cleanPhone,
          email: cleanEmail,
          password: formData.password,
          account_type: isAdmin ? 'admin_desa' : 'warga',
          role: isAdmin ? 'admin' : 'public',
          auth_code: formData.authCode,
          nik: formData.nik,
          kk_number: formData.kkNumber,
          rt: formData.rt,
          rw: formData.rw,
          address: formData.address
        })
      });
      const payload = await parseApiResponse(response);
      const user = mapServerUser(payload.data.user, payload.data.access_token);
      setCurrentUser(user);
      setActiveRole(user.role);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_ROLE, user.role);
      setCurrentView(user.role === 'public' ? 'warga_dashboard' : 'desa_dashboard');
      showToast(payload.message || `Pendaftaran berhasil. Selamat datang, ${user.name}.`, 'success');
      return { success: true, user };
    } catch (error) {
      const message = error.message || 'Server tidak dapat dihubungi. Periksa koneksi MySQL dan Laravel.';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Authentication: Logout
  const logout = async () => {
    try {
      if (currentUser?.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Accept': 'application/json'
          }
        });
      }
    } catch (e) {
      // ignore offline
    }
    setApplications([]);
    setCurrentUser(null);
    setActiveRole('public');
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.setItem(STORAGE_KEY_ROLE, 'public');
    setCurrentView('home');
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const refreshServerData = async () => {
    try {
      await refreshApplications();
      showToast('Data terbaru berhasil dimuat dari server.', 'success');
    } catch (error) {
      showToast(`Data server gagal dimuat: ${error.message}`, 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        applications,
        syncStatus,
        syncError,
        lastSyncedAt,
        refreshApplications,
        fetchManagedAccounts,
        createManagedAccount,
        updateManagedAccount,
        deleteManagedAccount,
        trackApplication,
        updateKasunVisitSchedule,
        updateProfile,
        updatePassword,
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
        wargaView,
        setWargaView,
        requestApplicationOtp,
        submitApplication,
        submitKasunSurvey,
        approveDesaFunding,
        updateProcurementProgress,
        completeHandoverBAST,
        refreshServerData,
        triggerWhatsAppAlert,
        currentUser,
        setCurrentUser,
        registeredUsers,
        demoAccounts,
        demoAccountsError,
        officialKasunAccounts: demoAccounts.filter((account) => account.role === 'kasun'),
        officialDesaAccounts: demoAccounts.filter((account) => ['kades', 'kasi_kesra', 'sekdes', 'admin'].includes(account.role)),
        loginRole,
        setLoginRole,
        openLogin,
        openRegisterAccount,
        login,
        register,
        logout
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
