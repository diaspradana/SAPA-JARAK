import React from 'react';
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
  Building2
} from 'lucide-react';

export default function KasunDashboardView() {
  const { 
    applications, 
    activeRole, 
    setCurrentView, 
    setActiveTicketNumber 
  } = useApp();

  let activeDusunId = 'kalasan';
  if (activeRole === 'kasun_sagi') activeDusunId = 'sagi';
  else if (activeRole === 'kasun_jaraklor') activeDusunId = 'jaraklor';
  else if (activeRole === 'kasun_jarakkidul') activeDusunId = 'jarakkidul';
  else if (activeRole === 'kasun_simbar') activeDusunId = 'simbar';

  const currentDusun = DUSUN_LIST.find(d => d.id === activeDusunId) || DUSUN_LIST[0];
  const kasunApps = applications.filter(a => a.dusunId === activeDusunId);

  const newApps = kasunApps.filter(a => a.status === 'WAITING_KASUN' || a.status === 'SUBMITTED').length;
  const surveyedApps = kasunApps.filter(a => a.status === 'FORWARDED_TO_DESA' || a.status === 'FUNDING_APPROVED' || a.status === 'PROCUREMENT' || a.status === 'COMPLETED').length;
  const needActionApps = kasunApps.filter(a => a.status === 'RETURNED').length;

  const handleStartSurvey = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setCurrentView('kasun_verifikasi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs animate-in fade-in-0 duration-200" data-aos="fade-up" data-aos-duration="600">
      
      {/* Officer Header Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold border border-primary/30 shadow-xs">
              <UserCheck size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="text-[10px] px-2 py-0 font-bold">
                  Kepala Dusun (Kasun) Wilayah
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Kode: {currentDusun.code}</span>
              </div>
              <h1 className="text-lg font-bold text-foreground mt-1">
                Dashboard Verifikasi Faktual — {currentDusun.kasunName}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Wilayah Kerja: <b>Dusun {currentDusun.name}</b> (RT 01 s/d RT {String(currentDusun.rtCount).padStart(2, '0')})
              </p>
            </div>
          </div>

          <div className="text-muted-foreground text-xs bg-muted/40 px-3.5 py-2 rounded-lg border border-border/60">
            Total Berkas Masuk di Dusun: <b className="font-mono text-foreground font-bold">{kasunApps.length}</b>
          </div>
        </CardContent>
      </Card>

      {/* 4 Workload Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Survei Lapangan</span>
              <Clock size={15} className="text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-foreground">{newApps}</div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Menunggu Kunjungan Faktual</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Survei Selesai</span>
              <ClipboardCheck size={15} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-mono text-foreground">{surveyedApps}</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Diteruskan ke Pemdes</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Revisi Warga</span>
              <RotateCcw size={15} className="text-rose-500" />
            </div>
            <div className="text-2xl font-black font-mono text-foreground">{needActionApps}</div>
            <p className="text-[11px] text-muted-foreground">Catatan Pengembalian</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Register</span>
              <CheckCircle2 size={15} className="text-primary" />
            </div>
            <div className="text-2xl font-black font-mono text-foreground">{kasunApps.length}</div>
            <p className="text-[11px] text-muted-foreground">Dusun {currentDusun.name}</p>
          </CardContent>
        </Card>

      </div>

      {/* Task List Table */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
            Daftar Antrean Pengajuan — Dusun {currentDusun.name}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-mono border-border">
            Tahun Anggaran 2026
          </Badge>
        </CardHeader>

        {kasunApps.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nomor Tiket</TableHead>
                  <TableHead>Nama Calon Penerima</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>RT / RW</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skor Faktual</TableHead>
                  <TableHead className="text-right">Tindakan Kasun</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kasunApps.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-primary dark:text-emerald-400 whitespace-nowrap">
                      #{app.ticketNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-bold text-foreground">{app.beneficiaryName}</div>
                      <div className="text-[10px] text-muted-foreground">Pelapor: {app.reporterName}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={app.assistanceType === 'RTLH' ? 'success' : 'info'} className="text-[10px] px-1.5 py-0 font-bold">
                        {app.assistanceType}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground font-mono">
                      RT {app.rt} / RW {app.rw}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={app.status} size="sm" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono">
                      {app.survey?.score ? (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0 font-bold">
                          {app.survey.score} / 100
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Belum disurvei</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handleStartSurvey(app.ticketNumber)}
                        className="h-7 text-xs font-bold gap-1 shadow-2xs"
                      >
                        <FileSearch size={12} />
                        <span>{app.survey ? 'Edit Survei' : 'Mulai Survei'}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada pengajuan masuk di wilayah Dusun {currentDusun.name}.
          </div>
        )}
      </Card>

    </div>
  );
}
