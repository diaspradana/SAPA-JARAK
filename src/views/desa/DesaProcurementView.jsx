import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { ASSISTANCE_TYPES } from '../../data/desaConfig';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
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
  Plus, 
  Trash2, 
  Save,
  Hammer,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function DesaProcurementView({ onBack }) {
  const { 
    applications, 
    activeTicketNumber, 
    updateProcurementProgress
  } = useApp();

  const app = applications.find(a => a.ticketNumber === activeTicketNumber) || 
    applications.find(a => a.status === 'PROCUREMENT' || a.status === 'FUNDING_APPROVED') || 
    applications[0];

  const initialMaterials = app?.procurement?.rabMaterials?.length > 0 
    ? app.procurement.rabMaterials 
    : ASSISTANCE_TYPES.RTLH.materialDefaults.map(m => ({
        item: m.item,
        qty: m.qty,
        unit: m.unit,
        price: m.pricePerUnit * m.qty
      }));

  const [rabList, setRabList] = useState(initialMaterials);
  const [progress, setProgress] = useState(app?.procurement?.progress || 50);
  const [contractor, setContractor] = useState(app?.procurement?.contractor || "Swakelola Pokmas Desa Jarak");
  const [statusText, setStatusText] = useState(app?.procurement?.statusText || "Pengerjaan fisik berjalan lancar");
  const [photo50, setPhoto50] = useState(
    app?.photos?.progress50?.[0] || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80"
  );
  const [photo100, setPhoto100] = useState(
    app?.photos?.progress100?.[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80"
  );

  const calculateTotalRAB = () => {
    return rabList.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  };

  const handleAddMaterial = () => {
    setRabList([
      ...rabList,
      { item: "Material Tambahan", qty: 1, unit: "unit", price: 150000 }
    ]);
  };

  const handleRemoveMaterial = (index) => {
    setRabList(rabList.filter((_, i) => i !== index));
  };

  const handleSaveProgress = () => {
    if (!app) return;

    const data = {
      contractor,
      rabMaterials: rabList,
      totalCost: calculateTotalRAB(),
      progress: Number(progress),
      statusText,
      photo50,
      photo100
    };

    updateProcurementProgress(app.ticketNumber, data);
    if (onBack) onBack();
  };

  if (!app) {
    return (
      <Card className="p-8 text-center border-border/80">
        <CardContent>
          <p className="text-muted-foreground">Tidak ada pengajuan dalam tahap pengadaan.</p>
          <Button onClick={onBack} variant="outline" size="sm" className="mt-3 font-bold">
            Kembali ke Ringkasan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in-0 duration-200 text-xs">
      
      {/* Header */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono font-bold text-[11px] border-border bg-muted/40">
                  #{app.ticketNumber}
                </Badge>
                <StatusBadge status={app.status} size="sm" />
              </div>
              <h2 className="text-sm font-bold text-foreground mt-0.5">
                Pengadaan RAB & Pelaksanaan Pengerjaan Fisik
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSaveProgress}
              className="gap-1.5 font-bold shadow-xs text-xs"
            >
              <Save size={13} />
              <span>Simpan Pembaruan Progres</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: RAB Material Table */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-foreground">
                  Rencana Anggaran Biaya (RAB) Rinci
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">Material stimulan mitra toko bangunan desa</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMaterial}
                className="h-7 text-xs font-bold gap-1 border-border shadow-2xs"
              >
                <Plus size={12} />
                <span>Tambah Baris</span>
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama Komponen Material</TableHead>
                    <TableHead className="w-20">Volume</TableHead>
                    <TableHead className="w-20">Satuan</TableHead>
                    <TableHead className="w-32">Harga (Rp)</TableHead>
                    <TableHead className="w-10 text-center"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rabList.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.item}
                          onChange={(e) => {
                            const updated = [...rabList];
                            updated[idx].item = e.target.value;
                            setRabList(updated);
                          }}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const updated = [...rabList];
                            updated[idx].qty = Number(e.target.value);
                            setRabList(updated);
                          }}
                          className="h-7 text-xs font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...rabList];
                            updated[idx].unit = e.target.value;
                            setRabList(updated);
                          }}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...rabList];
                            updated[idx].price = Number(e.target.value);
                            setRabList(updated);
                          }}
                          className="h-7 text-xs font-mono font-bold"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMaterial(idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3.5 bg-muted/40 border-t border-border/60 flex items-center justify-between font-bold text-xs">
              <span className="text-foreground">Total Realisasi RAB:</span>
              <span className="font-mono text-sm text-primary dark:text-emerald-400">
                Rp {calculateTotalRAB().toLocaleString('id-ID')}
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Progress Tracker & Execution */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Pelaksanaan Lapangan</span>
              <CardTitle className="text-xs font-bold text-foreground">Progres Fisik & Pelaksana</CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              
              <div className="space-y-1.5">
                <Label htmlFor="contractor">Pelaksana Pekerjaan / Vendor:</Label>
                <Input
                  id="contractor"
                  type="text"
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-bold">
                  <Label>Persentase Kemajuan Fisik:</Label>
                  <span className="font-mono text-primary dark:text-emerald-400 font-black text-sm">{progress}%</span>
                </div>

                <Progress value={progress} className="h-2 bg-muted" />

                <div className="flex justify-between gap-1.5 pt-1">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={progress === val ? "default" : "outline"}
                      size="sm"
                      onClick={() => setProgress(val)}
                      className="h-6 text-[10px] px-2 font-mono flex-1 border-border"
                    >
                      {val}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusText">Status Catatan Pengerjaan:</Label>
                <Input
                  id="statusText"
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label>Dokumentasi Progres Lapangan:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-semibold">Foto 50%</span>
                    <div className="rounded-lg border border-border overflow-hidden aspect-video">
                      <img src={photo50} alt="50%" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-semibold">Foto 100% (Selesai)</span>
                    <div className="rounded-lg border border-border overflow-hidden aspect-video">
                      <img src={photo100} alt="100%" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
