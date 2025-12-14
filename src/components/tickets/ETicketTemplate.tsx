import { useCallback, useRef } from 'react';
import { ArrowDownToLine, MapPin, Phone, TicketCheck } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from '../../contexts/LanguageContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export interface ETicketTemplateProps {
  ticket: {
    bookingReference: string;
    issuedBy: string;
    passenger: {
      name: string;
      id?: string;
    };
    seat: {
      label: string;
      type?: string;
      coach?: string;
    };
    route: {
      origin: string;
      destination: string;
    };
    bus: {
      name: string;
      plate?: string;
    };
    departure: {
      city: string;
      terminal?: string;
      time: string;
      gate?: string;
      boardingTime?: string;
    };
    arrival: {
      city: string;
      terminal?: string;
      time: string;
    };
    supportContact?: string;
  };
  onDownload?: () => void;
}

const TicketMetaRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}) => {
  if (!value) return null;
  return (
    <div className={cn('flex flex-col gap-1 rounded-xl border bg-muted/20 px-4 py-3', className)}>
      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </div>
  );
};

const formatDateTime = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export function ETicketTemplate({ ticket, onDownload }: ETicketTemplateProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const supportContact = ticket.supportContact ?? '1900 868 686';
  const ticketRef = useRef<HTMLElement | null>(null);
  const qrPayload = JSON.stringify({
    ref: ticket.bookingReference,
    passenger: ticket.passenger.name,
    seat: ticket.seat.label,
    route: `${ticket.route.origin}-${ticket.route.destination}`,
  });

  const metaRows = [
    { label: t('tickets.eTicket.passenger'), value: ticket.passenger.name },
    { label: t('tickets.eTicket.passengerId'), value: ticket.passenger.id },
    {
      label: t('tickets.eTicket.bus'),
      value: `${ticket.bus.name}${ticket.bus.plate ? ` · ${ticket.bus.plate}` : ''}`,
    },
    { label: t('tickets.eTicket.seat'), value: ticket.seat.label },
    { label: t('tickets.eTicket.seatType'), value: ticket.seat.type },
    { label: t('tickets.eTicket.coach'), value: ticket.seat.coach },
    { label: t('tickets.eTicket.gate'), value: ticket.departure.gate },
    { label: t('tickets.eTicket.boardingTime'), value: ticket.departure.boardingTime },
  ];

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const margin = 24;
    pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - margin * 2, pdfHeight - margin * 2);
    pdf.save(`${ticket.bookingReference}.pdf`);
    onDownload?.();
  }, [onDownload, ticket.bookingReference]);

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border bg-white shadow-2xl"
      ref={ticketRef}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(3,2,19,0.05),_transparent_45%)]"></div>
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary/30" />

      <div className="relative flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t('tickets.eTicket.issuedBy')} {ticket.issuedBy}
          </p>
          <h3 className="text-2xl font-semibold">{t('tickets.eTicket.title')}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-muted-foreground">
            {t('tickets.eTicket.bookingRef')}
          </p>
          <p className="text-3xl font-mono font-semibold tracking-wide">
            {ticket.bookingReference}
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-[2.3fr_0.7fr]">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-br from-muted/30 via-background to-background px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                {ticket.route.origin}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {t('tickets.eTicket.departure')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(ticket.departure.time, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{ticket.departure.terminal ?? ''}</p>
            </div>
            <div className="relative flex flex-col items-center justify-center text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-muted-foreground/40 to-muted-foreground/80" />
                <TicketCheck className="size-10" />
                <span className="h-px w-12 bg-gradient-to-l from-transparent via-muted-foreground/40 to-muted-foreground/80" />
              </div>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.4em]">
                {t('tickets.eTicket.route')}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                {ticket.route.destination}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {t('tickets.eTicket.arrival')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(ticket.arrival.time, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{ticket.arrival.terminal ?? ''}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metaRows.map((row) => (
              <TicketMetaRow
                key={`${row.label}-${row.value}`}
                label={row.label}
                value={row.value}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-2">
              <MapPin className="size-3" />
              {ticket.route.origin} → {ticket.route.destination}
            </Badge>
            {ticket.seat.type && <Badge>{ticket.seat.type}</Badge>}
            {ticket.bus.plate && (
              <Badge variant="outline" className="font-mono">
                {ticket.bus.plate}
              </Badge>
            )}
          </div>
        </div>

        <div className="relative border-t border-dashed lg:border-l lg:border-t-0">
          <div className="absolute -left-[10px] top-8 hidden size-5 rounded-full bg-background lg:block" />
          <div className="absolute -left-[10px] bottom-8 hidden size-5 rounded-full bg-background lg:block" />
          <div className="flex h-full flex-col justify-between gap-6 p-6">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>{t('tickets.eTicket.qrInstruction')}</span>
                <span className="font-mono">{ticket.seat.label}</span>
              </div>
              <div className="flex items-center justify-center rounded-xl border bg-white p-4">
                <div className="w-[70%] max-w-[120px]">
                  <QRCode
                    value={qrPayload}
                    size={105}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    bgColor="transparent"
                    fgColor="#030213"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-muted-foreground">
                {ticket.bookingReference}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{t('tickets.eTicket.support')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('tickets.eTicket.supportDesc')}
                  </p>
                  <p className="font-semibold tracking-wide">{supportContact}</p>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full gap-2" onClick={handleDownload}>
              <ArrowDownToLine className="size-4" />
              {t('tickets.eTicket.downloadAction')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
