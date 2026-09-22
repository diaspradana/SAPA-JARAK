import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import DesaValidationView from './DesaValidationView';
import DesaProcurementView from './DesaProcurementView';
import DesaHandoverView from './DesaHandoverView';
import DesaReportsView from './DesaReportsView';
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
  Building2, 
  Layers, 
  Hammer, 
  FileCheck2, 
  FileText, 
  BarChart3,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DesaDashboardView() {
  const { applications, setActiveTicketNumber } = useApp();
  
  const [activeTab, setActiveTab] = useState('overview');

  const totalApps = applications.length;
  const waitingValidation = applications.filter(a => a.status === 'FORWARDED_TO_DESA' || a.status === 'WAITING_KASUN').length;
  const approvedApps = applications.filter(a => a.status === 'FUNDING_APPROVED').length;
  const inProgress = applications.filter(a => a.status === 'PROCUREMENT' || a.status === 'HANDOVER').length;
  const completed = applications.filter(a => a.status === 'COMPLETED').length;

  const handleOpenValidation = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setActiveTab('validation');
  };

  const handleOpenProcurement = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setActiveTab('procurement');
  };

  const handleOpenHandover = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setActiveTab('handover');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs animate-in fade-in-0 duration-200" data-aos="fade-up" data-aos-duration="600">
      
      {/* Top Header Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold border border-primary/30 shadow-xs">
              <Building2 size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] px-2 py-0 font-bold">
                  Kantor Pemerintah Desa Jarak
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">Kec. Plosoklaten</span>
              </div>
              <h1 className="text-lg font-bold text-foreground mt-1">
                Panel Tata Kelola Bantuan Sosial & Validasi APBDes
              </h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'overview' ? "bg-background text-foreground shadow-xs border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 size={13} />
              <span>Ringkasan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('validation')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'validation' ? "bg-background text-foreground shadow-xs border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers size={13} />
              <span>Validasi & Dana</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('procurement')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'procurement' ? "bg-background text-foreground shadow-xs border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Hammer size={13} />
              <span>Pengadaan RAB</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('handover')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'handover' ? "bg-background text-foreground shadow-xs border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCheck2 size={13} />
              <span>BAST & Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'reports' ? "bg-background text-foreground shadow-xs border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText size={13} />
              <span>Laporan SPJ</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* SUBVIEWS */}
      {activeTab === 'validation' && <DesaValidationView onBack={() => setActiveTab('overview')} />}
      {activeTab === 'procurement' && <DesaProcurementView onBack={() => setActiveTab('overview')} />}
      {activeTab === 'handover' && <DesaHandoverView onBack={() => setActiveTab('overview')} />}
      {activeTab === 'reports' && <DesaReportsView onBack={() => setActiveTab('overview')} />}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in-0 duration-200">
          
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Pengajuan</span>
                <div className="text-2xl font-black font-mono text-foreground">{totalApps}</div>
                <p className="text-[11px] text-muted-foreground">5 Dusun Binaan</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Menunggu Validasi</span>
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{waitingValidation}</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Antrean Pemdes</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Disetujui Dana</span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{approvedApps}</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Siap Pengadaan</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Pengerjaan Fisik</span>
                <div className="text-2xl font-black font-mono text-foreground">{inProgress}</div>
                <p className="text-[11px] text-muted-foreground">Progres 0% - 100%</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs col-span-2 lg:col-span-1">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-emerald-400 block">Selesai (BAST)</span>
                <div className="text-2xl font-black font-mono text-primary dark:text-emerald-400">{completed}</div>
                <p className="text-[11px] text-muted-foreground font-semibold">Masuk Open Ledger</p>
              </CardContent>
            </Card>

          </div>

          {/* Table */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wide">
                Buku Induk Register Permohonan Bantuan Desa Jarak
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-border">
                {applications.length} Berkas Aktif
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>No. Tiket</TableHead>
                    <TableHead>Nama Penerima</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Dusun</TableHead>
                    <TableHead>Skor Kasun</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sumber Anggaran</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-bold text-primary dark:text-emerald-400 whitespace-nowrap">
                        #{app.ticketNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-bold text-foreground">{app.beneficiaryName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">NIK: {app.nik}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-bold text-[11px]">
                        <Badge variant={app.assistanceType === 'RTLH' ? 'success' : 'info'} className="text-[10px] px-1.5 py-0 font-bold">
                          {app.assistanceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-foreground">
                        Dusun {app.dusunName} (RT {app.rt})
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono">
                        {app.survey?.score ? (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0 font-bold">
                            {app.survey.score} Poin
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Belum survei</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-[11px]">
                        {app.funding?.source ? (
                          <div>
                            <span className="font-bold text-foreground">{app.funding.source}</span> <br />
                            <span className="text-primary dark:text-emerald-400">Rp {app.funding.budget.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Belum ditetapkan</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap space-x-1.5">
                        {app.status === 'FORWARDED_TO_DESA' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenValidation(app.ticketNumber)}
                            className="h-7 text-xs font-bold shadow-2xs"
                          >
                            Validasi & Dana
                          </Button>
                        )}
                        {(app.status === 'FUNDING_APPROVED' || app.status === 'PROCUREMENT') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenProcurement(app.ticketNumber)}
                            className="h-7 text-xs font-bold border border-border shadow-2xs"
                          >
                            Pengadaan
                          </Button>
                        )}
                        {app.status === 'HANDOVER' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenHandover(app.ticketNumber)}
                            className="h-7 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs"
                          >
                            Buat BAST
                          </Button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenHandover(app.ticketNumber)}
                            className="h-7 text-xs font-semibold border-border shadow-2xs"
                          >
                            Lihat BAST
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}
