import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, Check, UserCheck, Users, Building2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function RoleSwitcher() {
  const { activeRole, setActiveRole, setCurrentView, showToast } = useApp();

  const roles = [
    { id: 'public', label: 'Warga / Pelapor Publik', subtitle: 'Akses Portal & Pelacakan Tiket', icon: Users, defaultView: 'home', badge: 'Publik', badgeVariant: 'neutral' },
    { id: 'kasun_kalasan', label: 'Kasun Kalasan (Suwandi)', subtitle: 'Wilayah Dusun Kalasan (RT 01–06)', icon: UserCheck, defaultView: 'kasun_dashboard', badge: 'Kasun', badgeVariant: 'info' },
    { id: 'kasun_sagi', label: 'Kasun Sagi (Bambang S.)', subtitle: 'Wilayah Dusun Sagi (RT 01–08)', icon: UserCheck, defaultView: 'kasun_dashboard', badge: 'Kasun', badgeVariant: 'info' },
    { id: 'kasun_jaraklor', label: 'Kasun Jarak Lor (Agus P.)', subtitle: 'Wilayah Dusun Jarak Lor (RT 01–07)', icon: UserCheck, defaultView: 'kasun_dashboard', badge: 'Kasun', badgeVariant: 'info' },
    { id: 'kasun_jarakkidul', label: 'Kasun Jarak Kidul (Joko M.)', subtitle: 'Wilayah Dusun Jarak Kidul (RT 01–05)', icon: UserCheck, defaultView: 'kasun_dashboard', badge: 'Kasun', badgeVariant: 'info' },
    { id: 'kasun_simbar', label: 'Kasun Simbar (Eko W.)', subtitle: 'Wilayah Dusun Simbar (RT 01–04)', icon: UserCheck, defaultView: 'kasun_dashboard', badge: 'Kasun', badgeVariant: 'info' },
    { id: 'desa', label: 'Pemerintah Desa Jarak', subtitle: 'Kasi Kesejahteraan & Kades', icon: Building2, defaultView: 'desa_dashboard', badge: 'Pemdes', badgeVariant: 'success' }
  ];

  const currentRoleObj = roles.find(r => r.id === activeRole) || roles[0];

  const handleSelectRole = (role) => {
    setActiveRole(role.id);
    setCurrentView(role.defaultView);
    showToast(`Aktif sebagai: ${role.label}`, 'info');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-2.5 font-bold border-border/80 bg-background/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <span className="max-w-[140px] truncate text-[11px] font-bold text-foreground">
            {currentRoleObj.label}
          </span>
          <ChevronDown size={13} className="text-muted-foreground ml-0.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-1.5 shadow-xl border-border">
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground">
          Simulasi Peran Pengguna (3 Tingkat)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-0.5 max-h-72 overflow-y-auto pr-0.5">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            const Icon = r.icon;
            return (
              <DropdownMenuItem
                key={r.id}
                onClick={() => handleSelectRole(r)}
                className={`p-2 rounded-md flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-primary/10 text-primary font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon size={13} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold leading-tight text-foreground">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <Badge variant={r.badgeVariant} className="text-[9px] px-1.5 py-0 h-4">
                    {r.badge}
                  </Badge>
                  {isSelected && <Check size={13} className="text-primary stroke-[3]" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
