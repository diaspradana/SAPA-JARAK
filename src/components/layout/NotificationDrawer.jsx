import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, MessageSquare, ExternalLink, ArrowRight, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

export default function NotificationDrawer() {
  const { 
    notifications, 
    isNotifDrawerOpen, 
    setIsNotifDrawerOpen, 
    setCurrentView, 
    setActiveTicketNumber,
    setActiveWhatsAppModal
  } = useApp();

  if (!isNotifDrawerOpen) return null;

  const handleOpenTicket = (ticketNumber) => {
    setActiveTicketNumber(ticketNumber);
    setCurrentView('lacak');
    setIsNotifDrawerOpen(false);
  };

  const handleOpenModal = (notif) => {
    setActiveWhatsAppModal(notif);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in-0 duration-200 text-xs">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsNotifDrawerOpen(false)} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Log Gateway WhatsApp Desa</h3>
                <p className="text-[11px] text-muted-foreground">Pemberitahuan perubahan status ke warga</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotifDrawerOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </Button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground space-y-2">
                <Bell size={32} className="mx-auto opacity-40 text-muted-foreground" />
                <p className="text-xs font-semibold">Belum ada riwayat pesan gateway</p>
                <p className="text-[11px] text-muted-foreground">Notifikasi otomatis terkirim saat berkas diverifikasi</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Card key={notif.id} className="border-border/80 shadow-xs hover:border-primary/40 transition-colors">
                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <Badge variant="success" className="text-[10px] px-1.5 py-0 font-bold">
                        Ke: {notif.recipient}
                      </Badge>
                      <span className="text-muted-foreground font-mono font-medium">
                        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(notif.timestamp))}
                      </span>
                    </div>

                    <p className="text-foreground text-xs leading-relaxed bg-muted/50 p-2.5 rounded-md border border-border/50 font-sans">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleOpenModal(notif)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold gap-1 text-[11px] p-0 h-auto"
                      >
                        Buka Tampilan WA <ExternalLink size={11} />
                      </Button>

                      {notif.ticketNumber && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenTicket(notif.ticketNumber)}
                          className="text-primary font-bold gap-1 text-[11px] h-6 px-2"
                        >
                          Lacak #{notif.ticketNumber} <ArrowRight size={11} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="p-3 border-t border-border bg-muted/30 text-[10px] text-muted-foreground text-center">
            Sesuai PRD Bab 19: Notifikasi otomatis WhatsApp Gateway Desa Jarak.
          </div>

        </div>
      </div>
    </div>
  );
}
