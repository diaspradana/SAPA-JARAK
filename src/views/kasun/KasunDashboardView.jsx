import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { DUSUN_LIST } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '../../components/ui/table';
import { 
  UserCheck, 
  MapPin, 
  FileSearch, 
  Clock, 
  ClipboardCheck, 
  RotateCcw,
  CheckCircle2,
  Building2,
  Calendar
} from 'lucide-react';

export default function KasunDashboardView() {
  const { 
    applications, 
    activeRole, 
    currentUser,
    setCurrentView, 
    setActiveTicketNumber 
  } = useApp();

  // Determine initial dusun based on logged in user or active role
  const getInitialDusunId = () => {
    if (currentUser?.dusunId) return currentUser.dusunId;
    const role = currentUser?.role || activeRole;
    if (role === 'kasun_jaraklor') return 'jaraklor';
    if (role === 'kasun_sagi') return 'sagi';
    if (role === 'kasun_kalasantimur' || role === 'kasun_kalasan') return 'kalasan';
    if (role === 'kasun_kalasanbarat' || role === 'kasun_simbar') return 'simbar';
    if (role === 'kasun_jarakkidul') return 'jarakkidul';
    return 'jaraklor';
  };

  const [selectedDusunId, setSelectedDusunId] = useState(getInitialDusunId());

  const currentDusun = DUSUN_LIST.find(d => d.id === selectedDusunId) || DUSUN_LIST[0];
  const kasunApps = applications.filter(a => a.dusunId === selectedDusunId);

  const newApps = kasunApps.filter(a => a.status === 'WAITING_KASUN' || a.status === 'SUBMITTED').length;
  const surveyedApps = kasunApps.filter(a => a.status === 'FORWARDED_TO_DESA' || a.status === 'FUNDING_APPROVED' || a.status === 'PROCUREMENT' || a.status === 'COMPLETED').length;
  const needActionApps = kasunApps.filter(a => a.status === 'RETURNED').length;

  const handleStartSurvey = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setCurrentView('kasun_verifikasi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in-0 duration-200">
      
      {/* Officer Header Card */}
      <Card className="border-border rounded-3xl shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <UserCheck size={28} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                  Kepala Dusun (Kasun) Wilayah
                </span>
                <span className="text-xs text-muted-foreground font-mono">Kode: {currentDusun.code}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1.5">
                Panel Verifikasi Survei Faktual — {currentUser?.name || currentDusun.kasunName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Wilayah Kerja: <b>Dusun {currentDusun.name}</b> (RT 01 s/d RT {String(currentDusun.rtCount).padStart(2, '0')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">Pilih Wilayah Dusun:</span>
              <select
                value={selectedDusunId}
                onChange={(e) => setSelectedDusunId(e.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-bold text-foreground shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {DUSUN_LIST.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dusun {d.name} ({d.kasunName.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Workload Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Perlu Survei</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-foreground">{newApps}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">Menunggu Peninjauan Kasun</p>
        </Card>

        <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Survei Selesai</span>
            <ClipboardCheck size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-foreground">{surveyedApps}</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Diteruskan ke Musyawarah Desa</p>
        </Card>

        <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Perlu Revisi</span>
            <RotateCcw size={18} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black font-mono text-foreground">{needActionApps}</div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">Catatan Pengembalian</p>
        </Card>

        <Card className="border-border rounded-2xl shadow-xs bg-card p-5 space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Masuk</span>
            <CheckCircle2 size={18} className="text-emerald-700" />
          </div>
          <div className="text-3xl font-black font-mono text-foreground">{kasunApps.length}</div>
          <p className="text-xs text-muted-foreground font-semibold">Semua Berkas di Dusun {currentDusun.name}</p>
        </Card>

      </div>

      {/* Task List Table */}
      <Card className="border-border rounded-3xl shadow-md overflow-hidden bg-card">
        <CardHeader className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-extrabold text-foreground">
              Daftar Berkas Pengajuan Warga — Dusun {currentDusun.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Klik "Mulai Survei" untuk mengisi asesmen faktual lapangan dan geotagging rumah warga.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground self-start sm:self-auto">
            {kasunApps.length} Berkas
          </span>
        </CardHeader>

        {kasunApps.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border">
                  <TableHead className="w-12 text-center font-mono">No</TableHead>
                  <TableHead>Nomor Tiket</TableHead>
                  <TableHead>Nama Calon Penerima</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>RT / RW</TableHead>
                  <TableHead>Status Permohonan</TableHead>
                  <TableHead>Skor Kelayakan</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kasunApps.map((app, idx) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors border-b border-border/60">
                    <TableCell className="text-center font-mono text-muted-foreground text-xs">{idx + 1}</TableCell>
                    
                    <TableCell className="font-mono font-bold text-foreground">
                      <button
                        onClick={() => handleStartSurvey(app.ticketNumber)}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                      >
                        #{app.ticketNumber}
                      </button>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-foreground text-sm">{app.beneficiaryName}</div>
                      <div className="text-xs text-muted-foreground">Pelapor: {app.reporterName}</div>
                    </TableCell>

                    <TableCell>
                      <span className={cn(
                        "text-xs px-2.5 py-0.5 rounded-md font-bold",
                        app.assistanceType === 'RTLH' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                      )}>
                        {app.assistanceType === 'RTLH' ? 'Rumah RTLH' : 'Alat Disabilitas'}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs sm:text-sm text-foreground font-mono font-semibold">
                      RT {app.rt} / RW {app.rw}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={app.status} size="sm" />
                    </TableCell>

                    <TableCell className="font-mono text-xs sm:text-sm">
                      {app.survey?.score ? (
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                          {app.survey.score} / 100 Poin
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Belum disurvei</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleStartSurvey(app.ticketNumber)}
                        className="h-9 px-3.5 text-xs font-bold gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                      >
                        <FileSearch size={14} />
                        <span>{app.survey ? 'Edit Survei' : 'Mulai Survei'}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Belum ada permohonan masuk di wilayah Dusun {currentDusun.name}.
          </div>
        )}
      </Card>

    </div>
  );
}
