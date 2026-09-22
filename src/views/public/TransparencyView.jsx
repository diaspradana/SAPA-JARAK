import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import OfficialDocumentModal from '../../components/common/OfficialDocumentModal';
import { DUSUN_LIST, FUNDING_SOURCES } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
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
  X, 
  FileCheck2, 
  Building2, 
  Download, 
  Printer, 
  FileSpreadsheet,
  ArrowUpDown,
  Filter
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Header */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-border bg-muted/40 text-foreground">
                Open Ledger & Akuntabilitas Publik
              </Badge>
              <h1 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                Transparansi Bantuan Sosial Desa Jarak
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5 font-bold border-border shadow-2xs text-xs"
              >
                <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Ekspor CSV / Excel</span>
              </Button>

              <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-semibold text-[11px] border border-border">
                <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Standar Privasi Anonim Terproteksi</span>
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-xs max-w-3xl">
            Seluruh data realisasi bantuan sosial RTLH dan Alat Bantu Disabilitas disajikan secara agregat dan terbuka untuk menjamin akuntabilitas penyaluran anggaran desa.
          </p>

          {/* 4 Financial Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Realisasi Dana</span>
              <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                Rp {(totalAllocatedBudget / 1000000).toFixed(0)} Juta
              </div>
              <span className="text-[10px] text-muted-foreground">Tahun Anggaran 2026</span>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Penerima Manfaat</span>
              <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                {applications.length + 31} Warga
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Terdaftar Faktual</span>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Rehabilitasi RTLH</span>
              <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                {applications.filter(a => a.assistanceType === 'RTLH').length + 14} Unit
              </div>
              <span className="text-[10px] text-muted-foreground">Swakelola Desa</span>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-lg border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Alat Disabilitas</span>
              <div className="text-lg sm:text-xl font-black text-foreground font-mono">
                {applications.filter(a => a.assistanceType === 'DISABILITAS').length + 17} Unit
              </div>
              <span className="text-[10px] text-muted-foreground">Realisasi Lapangan</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Control Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={14} />
            </div>
            <Input
              type="text"
              placeholder="Cari nomor tiket, nama inisial, atau dusun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-mono text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDusun}
              onChange={(e) => setFilterDusun(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Dusun (5 Wilayah)</option>
              {DUSUN_LIST.map((d) => (
                <option key={d.id} value={d.id}>Dusun {d.name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="RTLH">Rehabilitasi RTLH</option>
              <option value="DISABILITAS">Alat Bantu Disabilitas</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Selesai (BAST)</option>
              <option value="IN_PROGRESS">Dalam Proses / Pengerjaan</option>
              <option value="WAITING_KASUN">Menunggu Survei Kasun</option>
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
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Reset Filter
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Table Data */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 text-center font-mono">No</TableHead>
                <TableHead>Register Tiket</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Penerima Manfaat</TableHead>
                <TableHead>Wilayah Dusun</TableHead>
                <TableHead>Status Alur</TableHead>
                <TableHead>Alokasi Anggaran</TableHead>
                <TableHead className="text-right">Aksi Dokumen</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Tidak ada data permohonan yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app, idx) => (
                  <TableRow key={app.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                    
                    <TableCell className="font-mono font-bold text-foreground">
                      <button
                        onClick={() => {
                          setActiveTicketNumber(app.ticketNumber);
                          setCurrentView('lacak');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:text-primary hover:underline"
                      >
                        #{app.ticketNumber}
                      </button>
                    </TableCell>

                    <TableCell>
                      <Badge variant={app.assistanceType === 'RTLH' ? 'success' : 'info'} className="text-[10px] px-1.5 py-0 font-bold">
                        {app.assistanceType}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-foreground">{app.beneficiaryMaskedName}</div>
                      <span className="text-[10px] text-muted-foreground">Pelapor: {app.reporterName}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-foreground">Dusun {app.dusunName}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">RT {app.rt} / RW {app.rw}</span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={app.status} size="sm" />
                    </TableCell>

                    <TableCell className="font-mono font-semibold text-foreground">
                      {app.funding ? (
                        <div>
                          <span>Rp {app.funding.budget.toLocaleString('id-ID')}</span>
                          <span className="text-[10px] text-muted-foreground block">{app.funding.source}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Asesmen Kasun</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetailModal(app)}
                          className="h-7 px-2 text-[11px] gap-1 font-bold border-border shadow-2xs"
                        >
                          <Eye size={12} />
                          <span>Rincian</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDocModal(app)}
                          className="h-7 px-2 text-[11px] gap-1 font-bold text-primary hover:text-primary"
                          title="Cetak Dokumen Resmi"
                        >
                          <Printer size={12} />
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
        <div className="p-3.5 bg-muted/30 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Menampilkan <b>{filteredApps.length}</b> dari total <b>{applications.length}</b> permohonan bantuan</span>
          <span>Sesuai UU Keterbukaan Informasi Publik (KIP) & SOP Desa Jarak</span>
        </div>
      </Card>

      {/* Quick Detail Dialog Modal */}
      {selectedDetailModal && (
        <Dialog open={Boolean(selectedDetailModal)} onOpenChange={(open) => !open && setSelectedDetailModal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <Badge variant="outline" className="text-[10px] font-mono font-bold border-border">
                  #{selectedDetailModal.ticketNumber}
                </Badge>
                <StatusBadge status={selectedDetailModal.status} size="sm" />
              </div>
              <DialogTitle className="text-base font-bold text-foreground pt-1">
                Rincian Realisasi Bantuan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Kategori: <b>{selectedDetailModal.assistanceType}</b> • Dusun {selectedDetailModal.dusunName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                  Identitas Penerima (Privasi Dilindungi):
                </span>
                <div className="font-bold text-foreground text-sm">{selectedDetailModal.beneficiaryMaskedName}</div>
                <div className="text-muted-foreground text-[11px]">
                  Alamat: Dusun {selectedDetailModal.dusunName}, RT {selectedDetailModal.rt} / RW {selectedDetailModal.rw} ({selectedDetailModal.address})
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground text-[11px] block">Keterangan Kondisi:</span>
                <p className="p-2.5 rounded-lg bg-muted/30 border border-border/50 text-foreground leading-relaxed">
                  {selectedDetailModal.description}
                </p>
              </div>

              {selectedDetailModal.funding && (
                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] block">Alokasi Anggaran & Sumber Dana:</span>
                  <div className="flex justify-between font-mono font-bold text-foreground">
                    <span>{selectedDetailModal.funding.source}</span>
                    <span>Rp {selectedDetailModal.funding.budget.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const t = selectedDetailModal.ticketNumber;
                  setSelectedDetailModal(null);
                  setActiveTicketNumber(t);
                  setCurrentView('lacak');
                }}
                className="font-bold text-xs gap-1.5 border-border"
              >
                <span>Buka Riwayat Lengkap</span>
                <ExternalLink size={12} />
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
