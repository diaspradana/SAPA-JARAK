import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DUSUN_LIST, FUNDING_SOURCES } from '../../data/desaConfig';
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
  ArrowLeft, 
  Printer, 
  Filter, 
  FileSpreadsheet,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function DesaReportsView({ onBack }) {
  const { applications, showToast } = useApp();

  const [filterDusun, setFilterDusun] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterFunding, setFilterFunding] = useState('ALL');

  const filtered = applications.filter((app) => {
    const matchDusun = filterDusun === 'ALL' || app.dusunId === filterDusun;
    const matchType = filterType === 'ALL' || app.assistanceType === filterType;
    const matchFunding = filterFunding === 'ALL' || app.funding?.source === filterFunding;
    return matchDusun && matchType && matchFunding;
  });

  const totalBudget = filtered.reduce((acc, curr) => acc + (curr.funding?.budget || 0), 0);

  const handleExportCSV = () => {
    const headers = ["No Tiket", "Nama Penerima", "NIK", "Dusun", "RT", "Jenis Bantuan", "Status", "Sumber Dana", "Anggaran (Rp)", "Nomor BAST"];
    const rows = filtered.map(app => [
      app.ticketNumber,
      `"${app.beneficiaryName}"`,
      `"${app.nik}"`,
      app.dusunName,
      app.rt,
      app.assistanceType,
      app.status,
      app.funding?.source || "-",
      app.funding?.budget || 0,
      app.handover?.bastNumber || "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_SPJ_DesaJarak_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Berkas CSV berhasil diunduh.", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Header */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 border-border shadow-2xs"
            >
              <ArrowLeft size={15} />
            </Button>
            <div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-border bg-muted/40">
                Pertanggungjawaban Administrasi Desa
              </Badge>
              <h2 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                Rekapitulasi Pelaporan & Pertanggungjawaban (SPJ)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 font-bold border-border shadow-2xs text-xs"
            >
              <FileSpreadsheet size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Unduh Excel (CSV)</span>
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 font-bold shadow-xs text-xs"
            >
              <Printer size={13} />
              <span>Cetak SPJ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Toolbar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDusun}
              onChange={(e) => setFilterDusun(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Dusun</option>
              {DUSUN_LIST.map((d) => (
                <option key={d.id} value={d.id}>Dusun {d.name}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Jenis Bantuan</option>
              <option value="RTLH">Rehabilitasi RTLH</option>
              <option value="DISABILITAS">Alat Bantu Disabilitas</option>
            </select>

            <select
              value={filterFunding}
              onChange={(e) => setFilterFunding(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">Semua Sumber Dana</option>
              {FUNDING_SOURCES.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="text-muted-foreground text-xs font-medium">
            Total Anggaran Terpilih: <b className="text-primary dark:text-emerald-400 font-mono text-sm">Rp {totalBudget.toLocaleString('id-ID')}</b>
          </div>
        </CardContent>
      </Card>

      {/* Printable Report Sheet */}
      <Card className="printable-paper bg-white text-neutral-950 p-6 sm:p-8 space-y-5 rounded-xl border border-neutral-300 shadow-sm font-sans">
        
        {/* KOP LAPORAN DESA */}
        <div className="text-center border-b-2 border-neutral-900 pb-3 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 block">
            PEMERINTAH KABUPATEN KEDIRI • KECAMATAN PLOSOKLATEN
          </span>
          <h3 className="text-base sm:text-lg font-black uppercase text-neutral-950">
            PEMERINTAH DESA JARAK
          </h3>
          <p className="text-[10px] text-neutral-500">
            LAPORAN PERTANGGUNGJAWABAN (SPJ) PENYALURAN BANTUAN SOSIAL TAHUN 2026
          </p>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-neutral-300 font-tabular">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 text-[11px] uppercase font-bold">
                <th className="p-2 border-r border-neutral-300 w-8 text-center">No</th>
                <th className="p-2 border-r border-neutral-300">No. Tiket</th>
                <th className="p-2 border-r border-neutral-300">Nama Penerima & NIK</th>
                <th className="p-2 border-r border-neutral-300">Wilayah</th>
                <th className="p-2 border-r border-neutral-300">Kategori</th>
                <th className="p-2 border-r border-neutral-300">Sumber Dana</th>
                <th className="p-2 text-right">Alokasi Biaya</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, idx) => (
                <tr key={app.id} className="border-b border-neutral-200 hover:bg-neutral-50 text-neutral-900">
                  <td className="p-2 border-r border-neutral-200 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-neutral-200 font-mono font-bold">#{app.ticketNumber}</td>
                  <td className="p-2 border-r border-neutral-200">
                    <span className="font-bold block">{app.beneficiaryName}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">NIK: {app.nik}</span>
                  </td>
                  <td className="p-2 border-r border-neutral-200">
                    Dusun {app.dusunName} (RT {app.rt})
                  </td>
                  <td className="p-2 border-r border-neutral-200 font-semibold">{app.assistanceType}</td>
                  <td className="p-2 border-r border-neutral-200">{app.funding?.source || 'APBDes'}</td>
                  <td className="p-2 text-right font-mono font-bold">
                    Rp {app.funding?.budget ? app.funding.budget.toLocaleString('id-ID') : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-100 font-bold text-neutral-950 border-t-2 border-neutral-900">
                <td colSpan={6} className="p-2.5 text-right uppercase text-xs">Total Realisasi Anggaran (SPJ):</td>
                <td className="p-2.5 text-right font-mono text-sm">
                  Rp {totalBudget.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature Box */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs text-neutral-800">
          <div>
            <span className="block text-neutral-500">Mengetahui,</span>
            <span className="font-bold block text-neutral-950">Kepala Desa Jarak</span>
            <div className="h-14"></div>
            <span className="font-bold text-neutral-950 block underline">( SUKIRNO, S.Sos )</span>
          </div>

          <div>
            <span className="block text-neutral-500">Kediri, {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}</span>
            <span className="font-bold block text-neutral-950">Kasi Kesejahteraan Desa Jarak</span>
            <div className="h-14"></div>
            <span className="font-bold text-neutral-950 block underline">( AHMAD RIFAI, S.AP )</span>
          </div>
        </div>

      </Card>

    </div>
  );
}
