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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-sm animate-in fade-in-0 duration-200" data-aos="fade-up" data-aos-duration="600">
      
      {/* Top Header Card */}
      <Card className="border-border/80 shadow-sm rounded-2xl">
        <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-700/20 shrink-0">
              <Building2 size={24} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-xs px-2.5 py-0.5 font-bold rounded-md">
                  Kantor Pemerintah Desa Jarak
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Kec. Plosoklaten</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                Panel Tata Kelola Bantuan Sosial & Validasi APBDes
              </h1>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'overview' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 size={15} />
              <span>Ringkasan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('validation')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'validation' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers size={15} />
              <span>Validasi & Dana</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('procurement')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'procurement' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Hammer size={15} />
              <span>Pengadaan RAB</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('handover')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'handover' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCheck2 size={15} />
              <span>BAST & Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2",
                activeTab === 'reports' ? "bg-background text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText size={15} />
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <Card className="border-border/80 shadow-xs rounded-xl">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Total Pengajuan</span>
                <div className="text-3xl font-black font-mono text-foreground">{totalApps}</div>
                <p className="text-xs text-muted-foreground">5 Dusun Binaan</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs rounded-xl">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Menunggu Validasi</span>
                <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{waitingValidation}</div>
                <p className="text-xs text-muted-foreground font-semibold">Antrean Pemdes</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs rounded-xl">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Disetujui Dana</span>
                <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{approvedApps}</div>
                <p className="text-xs text-muted-foreground font-semibold">Siap Pengadaan</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs rounded-xl">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Pengerjaan Fisik</span>
                <div className="text-3xl font-black font-mono text-foreground">{inProgress}</div>
                <p className="text-xs text-muted-foreground">Progres 0% - 100%</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs rounded-xl col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-5 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-emerald-400 block">Selesai (BAST)</span>
                <div className="text-3xl font-black font-mono text-primary dark:text-emerald-400">{completed}</div>
                <p className="text-xs text-muted-foreground font-semibold">Masuk Open Ledger</p>
              </CardContent>
            </Card>

          </div>

          {/* Table */}
          <Card className="border-border/80 shadow-xs overflow-hidden rounded-2xl">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">
                Buku Induk Register Permohonan Bantuan Desa Jarak
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono border-border px-2.5 py-0.5">
                {applications.length} Berkas Aktif
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs sm:text-sm font-bold">
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
                    <TableRow key={app.id} className="hover:bg-muted/40 transition-colors text-sm">
                      <TableCell className="font-mono font-bold text-primary dark:text-emerald-400 whitespace-nowrap text-sm">
                        #{app.ticketNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-bold text-foreground text-sm">{app.beneficiaryName}</div>
                        <div className="font-mono text-xs text-muted-foreground">NIK: {app.nik}</div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-bold">
                        <Badge variant={app.assistanceType === 'RTLH' ? 'success' : 'info'} className="text-xs px-2 py-0.5 font-bold">
                          {app.assistanceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-foreground font-medium text-xs sm:text-sm">
                        Dusun {app.dusunName} (RT {app.rt})
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono">
                        {app.survey?.score ? (
                          <Badge variant="success" className="text-xs px-2 py-0.5 font-bold">
                            {app.survey.score} Poin
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Belum survei</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        {app.funding?.source ? (
                          <div>
                            <span className="font-bold text-foreground text-xs">{app.funding.source}</span> <br />
                            <span className="text-primary dark:text-emerald-400 font-semibold">Rp {app.funding.budget.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Belum ditetapkan</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap space-x-2">
                        {app.status === 'FORWARDED_TO_DESA' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenValidation(app.ticketNumber)}
                            className="h-8 text-xs font-bold px-3 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                          >
                            Validasi & Dana
                          </Button>
                        )}
                        {(app.status === 'FUNDING_APPROVED' || app.status === 'PROCUREMENT') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenProcurement(app.ticketNumber)}
                            className="h-8 text-xs font-bold px-3 border border-border shadow-xs rounded-lg"
                          >
                            Pengadaan
                          </Button>
                        )}
                        {app.status === 'HANDOVER' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenHandover(app.ticketNumber)}
                            className="h-8 text-xs font-bold px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs rounded-lg"
                          >
                            Buat BAST
                          </Button>
                        )}
                        {app.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenHandover(app.ticketNumber)}
                            className="h-8 text-xs font-semibold px-3 border-border shadow-xs rounded-lg"
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
