import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export default function ScoreMeter({ score = 0, maxScore = 100, breakdown = [], recommendation = "", compact = false }) {
  let progressVariant = "bg-primary";
  let badgeVariant = "success";
  let statusIcon = ShieldCheck;

  if (score >= 70) {
    progressVariant = "bg-emerald-600 dark:bg-emerald-500";
    badgeVariant = "success";
    statusIcon = ShieldCheck;
  } else if (score >= 50) {
    progressVariant = "bg-amber-600 dark:bg-amber-500";
    badgeVariant = "warning";
    statusIcon = AlertTriangle;
  } else {
    progressVariant = "bg-destructive";
    badgeVariant = "destructive";
    statusIcon = AlertTriangle;
  }

  const StatusIconComponent = statusIcon;
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 font-tabular">
        <div className="w-20">
          <Progress value={percentage} indicatorClassName={progressVariant} className="h-2" />
        </div>
        <span className="text-xs font-bold text-foreground">
          {score} <span className="text-muted-foreground font-normal">/ {maxScore}</span>
        </span>
      </div>
    );
  }

  return (
    <Card className="border border-border/80 shadow-xs">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Hasil Asesmen Skor Kelayakan Faktual
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black font-mono text-foreground">{score}</span>
              <span className="text-xs font-semibold text-muted-foreground">/ {maxScore} Poin</span>
            </div>
          </div>

          {recommendation && (
            <Badge variant={badgeVariant} className="px-2.5 py-1 text-xs gap-1.5 font-bold">
              <StatusIconComponent size={13} className="shrink-0" />
              <span>{recommendation}</span>
            </Badge>
          )}
        </div>

        {/* Shadcn Progress Bar */}
        <div className="space-y-1">
          <Progress value={percentage} indicatorClassName={progressVariant} className="h-2.5 bg-muted" />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono font-medium pt-0.5">
            <span>0 Poin</span>
            <span>Passing Grade: 50 Poin</span>
            <span>100 Poin</span>
          </div>
        </div>

        {/* Parameter Breakdown */}
        {breakdown && breakdown.length > 0 && (
          <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
            <span className="font-bold text-foreground text-[11px] uppercase tracking-wide block">
              Rincian Komponen Penilaian (4 Parameter PRD):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {breakdown.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg border border-border/60 text-foreground text-[11px]"
                >
                  <span className="font-medium text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-bold text-foreground bg-background px-1.5 py-0.5 rounded border border-border/40">
                    {item.score} / {item.max} ({item.weight})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground italic">
          * Sesuai PRD Pasal 11: Pembobotan otomatis kriteria faktual. Keputusan final disahkan melalui Musdes/Pemdes Jarak.
        </p>
      </CardContent>
    </Card>
  );
}
