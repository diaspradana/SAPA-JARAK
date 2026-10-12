import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { DUSUN_LIST, FUNDING_SOURCES } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../components/ui/dialog';
import { 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  Eye, 
  Printer, 
  FileSpreadsheet,
  Coins,
  Users,
  Home,
  Accessibility
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TransparencyView() {
  const { applications, setCurrentView, setActiveTicketNumber, showToast } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDusun, setFilterDusun] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDetailModal, setSelectedDetailModal] = useState(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalApp, setDocModalApp] = useState(null);

  const filteredApps = applications.filter((app) => {
    const matchSearch = 
      app.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.beneficiaryMaskedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.dusunName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchDusun = filterDusun === 'ALL' || app.dusunId === filterDusun;
    const matchType = filterType === 'ALL' || app.assistanceType === filterType;
    const matchStatus = filterStatus === 'ALL' || (
      filterStatus === 'COMPLETED' ? app.status === 'COMPLETED' :
      filterStatus === 'IN_PROGRESS' ? (app.status === 'PROCUREMENT' || app.status === 'HANDOVER' || app.status === 'FUNDING_APPROVED') :
      app.status === filterStatus
    );

    return matchSearch && matchDusun && matchType && matchStatus;
  });

  const totalAllocatedBudget = applications.reduce((acc, curr) => {
    if (curr.funding?.budget) return acc + curr.funding.budget;
    return acc;
  }, 48500000);

  const handleExportCSV = () => {
    const headers = ["No. Tiket", "Kategori", "Penerima (Anonim)", "Dusun", "RT/RW", "Status", "Alokasi Anggaran (Rp)", "Sumber Dana"];
    const rows = filteredApps.map(a => [
      a.ticketNumber,
      a.assistanceType,
      a.beneficiaryMaskedName,
      a.dusunName,
      `${a.rt}/${a.rw}`,
      a.status,
      a.funding?.budget || 0,
      a.funding?.source || 'Belum Ditetapkan'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Bansos_Desa_Jarak_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Berkas Rekap CSV berhasil diunduh.", "success");
  };

  const handleOpenDocModal = (app) => {
    setDocModalApp(app);
    setDocModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in-0 duration-200">
      
      {/* Header Banner */}
      <Card className="border-border rounded-3xl shadow-md bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                Keterbukaan Informasi Publik Desa Jarak
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1.5">
                Transparansi Penyaluran Bantuan Sosial
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="default"
                onClick={handleExportCSV}
                className="h-11 px-4 gap-2 font-bold border-border rounded-xl shadow-xs text-xs sm:text-sm"
              >
                <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Unduh Rekap CSV</span>
              </Button>

              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={16} />
                <span>Data Pribadi Terlindungi</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Sistem mencatat seluruh permohonan RTLH dan alat disabilitas secara terbuka agar warga dapat memantau keadilan distribusi bantuan di 5 dusun Desa Jarak.
          </p>

          {/* 4 Financial Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Anggaran Tersalurkan</span>
              <div className="text-2xl font-black text-foreground font-mono">
                Rp {(totalAllocatedBudget / 1000000).toFixed(0)} Juta
              </div>
              <span className="text-xs text-muted-foreground">Tahun Anggaran 2026</span>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Penerima Manfaat</span>
              <div className="text-2xl font-black text-foreground font-mono">
                {applications.length + 31} Warga
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Terdata Faktual</span>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Rehabilitasi RTLH</span>
              <div className="text-2xl font-black text-foreground font-mono">
                {applications.filter(a => a.assistanceType === 'RTLH').length + 14} Unit
              </div>
              <span className="text-xs text-muted-foreground">Swakelola Desa</span>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Alat Disabilitas</span>
              <div className="text-2xl font-black text-foreground font-mono">
                {applications.filter(a => a.assistanceType === 'DISABILITAS').length + 17} Unit
              </div>
              <span className="text-xs text-muted-foreground">Diserahkan Resmi</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Control Bar */}
      <Card className="border-border rounded-2xl shadow-xs bg-card p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search size={16} />
            </div>
            <Input
              type="text"
              placeholder="Cari tiket, nama penerima, atau dusun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 text-xs sm:text-sm font-mono rounded-xl border-border"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDusun}
              onChange={(e) => setFilterDusun(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground shadow-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <option value="ALL">Semua Dusun</option>
              {DUSUN_LIST.map((d) => (
                <option key={d.id} value={d.id}>Dusun {d.name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground shadow-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="RTLH">Rumah RTLH</option>
              <option value="DISABILITAS">Alat Disabilitas</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 rounded-xl border border-input bg-background px-3 text-xs sm:text-sm text-foreground shadow-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Selesai (BAST)</option>
              <option value="IN_PROGRESS">Sedang Dikerjakan</option>
              <option value="WAITING_KASUN">Menunggu Survei</option>
            </select>

            {(searchQuery || filterDusun !== 'ALL' || filterType !== 'ALL' || filterStatus !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterDusun('ALL');
                  setFilterType('ALL');
                  setFilterStatus('ALL');
                }}
                className="h-11 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
              >
                Reset Filter
              </Button>
            )}
          </div>

        </div>
      </Card>

      {/* Table Data */}
      <Card className="border-border rounded-3xl shadow-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="w-12 text-center font-mono">No</TableHead>
                <TableHead>Nomor Tiket</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penerima Bantuan</TableHead>
                <TableHead>Wilayah Dusun</TableHead>
                <TableHead>Status Permohonan</TableHead>
                <TableHead>Alokasi Anggaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                    Tidak ada data permohonan yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app, idx) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors border-b border-border/60">
                    <TableCell className="text-center font-mono text-muted-foreground text-xs">{idx + 1}</TableCell>
                    
                    <TableCell className="font-mono font-bold text-foreground">
                      <button
                        onClick={() => {
                          setActiveTicketNumber(app.ticketNumber);
                          setCurrentView('lacak');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
                      >
                        #{app.ticketNumber}
                      </button>
                    </TableCell>

                    <TableCell>
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-md font-bold",
                        app.assistanceType === 'RTLH' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                      )}>
                        {app.assistanceType === 'RTLH' ? 'Rumah RTLH' : 'Alat Disabilitas'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-foreground text-sm">{app.beneficiaryMaskedName}</div>
                      <span className="text-xs text-muted-foreground">Pelapor: {app.reporterName}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-foreground text-xs sm:text-sm">Dusun {app.dusunName}</span>
                      <span className="text-xs text-muted-foreground block font-mono">RT {app.rt} / RW {app.rw}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={app.status} size="sm" />
                    </TableCell>

                    <TableCell className="font-mono text-xs sm:text-sm font-bold text-foreground">
                      {app.funding ? (
                        <div>
                          <span>Rp {app.funding.budget.toLocaleString('id-ID')}</span>
                          <span className="text-xs text-muted-foreground block font-sans font-normal">{app.funding.source}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Menunggu Survei Kasun</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetailModal(app)}
                          className="h-8 px-3 text-xs gap-1 font-bold border-border rounded-lg"
                        >
                          <Eye size={13} />
                          <span>Rincian</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDocModal(app)}
                          className="h-8 w-8 text-emerald-700 hover:text-emerald-800 rounded-lg p-0"
                          title="Cetak Surat Resmi"
                        >
                          <Printer size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Menampilkan <b>{filteredApps.length}</b> dari total <b>{applications.length}</b> permohonan bantuan</span>
          <span>Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri</span>
        </div>
      </Card>

      {/* Quick Detail Dialog Modal */}
      {selectedDetailModal && (
        <Dialog open={Boolean(selectedDetailModal)} onOpenChange={(open) => !open && setSelectedDetailModal(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <span className="text-sm font-mono font-bold text-emerald-700">
                  #{selectedDetailModal.ticketNumber}
                </span>
                <StatusBadge status={selectedDetailModal.status} size="sm" />
              </div>
              <DialogTitle className="text-lg font-extrabold text-foreground pt-1">
                Rincian Realisasi Bantuan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Kategori: <b>{selectedDetailModal.assistanceType === 'RTLH' ? 'Rehabilitasi RTLH' : 'Alat Disabilitas'}</b> • Dusun {selectedDetailModal.dusunName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border space-y-1">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider block">
                  Penerima Bantuan:
                </span>
                <div className="font-extrabold text-foreground text-base">{selectedDetailModal.beneficiaryMaskedName}</div>
                <div className="text-muted-foreground text-xs">
                  Dusun {selectedDetailModal.dusunName}, RT {selectedDetailModal.rt} / RW {selectedDetailModal.rw} ({selectedDetailModal.address})
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground text-xs block">Keterangan Kondisi:</span>
                <p className="p-3.5 rounded-xl bg-muted/30 border border-border text-foreground leading-relaxed text-xs sm:text-sm">
                  {selectedDetailModal.description}
                </p>
              </div>

              {selectedDetailModal.funding && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xs block">Alokasi Anggaran & Sumber Dana:</span>
                  <div className="flex justify-between font-mono font-bold text-foreground text-sm sm:text-base">
                    <span>{selectedDetailModal.funding.source}</span>
                    <span>Rp {selectedDetailModal.funding.budget.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  const t = selectedDetailModal.ticketNumber;
                  setSelectedDetailModal(null);
                  setActiveTicketNumber(t);
                  setCurrentView('lacak');
                }}
                className="w-full h-11 font-bold text-sm gap-2 border-border rounded-xl"
              >
                <span>Buka Riwayat Penanganan Lengkap</span>
                <ExternalLink size={14} />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Official Government Printable Document Modal */}
      <OfficialDocumentModal
        isOpen={docModalOpen}
        onClose={() => { setDocModalOpen(false); setDocModalApp(null); }}
        app={docModalApp}
        documentType={docModalApp?.status === 'COMPLETED' ? 'BAST' : 'TANDA_TERIMA'}
      />

    </div>
  );
}
