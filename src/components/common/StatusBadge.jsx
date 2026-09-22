import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileSearch, 
  Send, 
  Layers, 
  Hammer, 
  FileCheck2, 
  RotateCcw, 
  XCircle 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const STATUS_CONFIGS = {
  SUBMITTED: {
    label: "Pengajuan Diterima",
    variant: "neutral",
    icon: Clock
  },
  WAITING_KASUN: {
    label: "Menunggu Verifikasi Kasun",
    variant: "warning",
    icon: Clock
  },
  KASUN_SURVEY: {
    label: "Kasun Meninjau Lokasi",
    variant: "info",
    icon: FileSearch
  },
  FORWARDED_TO_DESA: {
    label: "Direkomendasikan ke Desa",
    variant: "success",
    icon: Send
  },
  VILLAGE_REVIEW: {
    label: "Diverifikasi Pemdes",
    variant: "info",
    icon: Layers
  },
  FUNDING_APPROVED: {
    label: "Bantuan & Anggaran Disetujui",
    variant: "success",
    icon: CheckCircle2
  },
  PROCUREMENT: {
    label: "Dalam Pengerjaan / Pengadaan",
    variant: "secondary",
    icon: Hammer
  },
  HANDOVER: {
    label: "Menunggu BAST",
    variant: "warning",
    icon: FileCheck2
  },
  COMPLETED: {
    label: "Selesai & Terealisasi",
    variant: "success",
    icon: CheckCircle2
  },
  RETURNED: {
    label: "Dikembalikan (Catatan)",
    variant: "warning",
    icon: RotateCcw
  },
  REJECTED: {
    label: "Tidak Memenuhi Kriteria",
    variant: "destructive",
    icon: XCircle
  }
};

export default function StatusBadge({ status, size = "md", showIcon = true, className }) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.SUBMITTED;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-0.5 gap-1.5 font-bold",
    lg: "text-xs px-3 py-1 gap-1.5 font-bold"
  }[size] || "text-xs px-2.5 py-0.5 gap-1.5 font-bold";

  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <Badge variant={config.variant} className={cn(sizeClasses, "shadow-2xs", className)}>
      {showIcon && <IconComponent size={iconSize} className="shrink-0" />}
      <span>{config.label}</span>
    </Badge>
  );
}
