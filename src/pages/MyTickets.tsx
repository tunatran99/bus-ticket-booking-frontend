import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../components/ui/utils';
import { ETicketTemplate } from '../components/tickets/ETicketTemplate';
import { bookingsService, type BookingRecord } from '../services/bookings.service';
import { getErrorMessage } from '../services/error';
import { Calendar, Loader2, MapPin, RefreshCcw, Ticket } from 'lucide-react';

const ROUTE_DELIMITERS = ['→', '->', ' — ', ' - ', ' to '];

const extractRouteCities = (routeLabel?: string) => {
  if (!routeLabel) {
    return { origin: 'Origin', destination: 'Destination' };
  }
  const normalized = routeLabel.replace(/\s+/g, ' ').trim();
  for (const delimiter of ROUTE_DELIMITERS) {
    if (normalized.includes(delimiter)) {
      const [origin, destination] = normalized.split(delimiter);
      if (origin && destination) {
        return { origin: origin.trim(), destination: destination.trim() };
      }
    }
  }
  return { origin: normalized, destination: 'Destination' };
};

const statusLabel: Record<BookingRecord['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const statusVariant: Record<
  BookingRecord['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'outline',
  expired: 'destructive',
};

const isCancelable = (booking: BookingRecord) =>
  booking.status === 'pending' || booking.status === 'confirmed';

export function MyTickets() {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingRef, setCancellingRef] = useState<string | null>(null);

  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsService.listBookings();
      setBookings(data);
      setSelectedBooking((prev) => prev ?? data[0] ?? null);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load bookings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (reference: string) => {
    setCancellingRef(reference);
    try {
      const updated = await bookingsService.cancelBooking(reference);
      setBookings((prev) =>
        prev.map((booking) => (booking.bookingReference === reference ? updated : booking)),
      );
      setSelectedBooking((prev) => (prev && prev.bookingReference === reference ? updated : prev));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to cancel booking'));
    } finally {
      setCancellingRef(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(value);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const selectedTicket = useMemo(() => {
    if (!selectedBooking) return null;
    const firstPassenger = selectedBooking.passengers[0];
    const { origin, destination } = extractRouteCities(selectedBooking.route);
    return {
      bookingReference: selectedBooking.bookingReference,
      issuedBy: selectedBooking.company ?? 'BusTicket.vn',
      passenger: {
        name: firstPassenger?.name || selectedBooking.contact.email || 'Passenger',
        id: firstPassenger?.idNumber,
      },
      seat: {
        label: firstPassenger?.seatLabel || 'Seat 1A',
        type: selectedBooking.seatType,
        coach: selectedBooking.company,
      },
      route: {
        origin,
        destination,
      },
      bus: {
        name: selectedBooking.company ?? 'BusTicket Coach',
        plate: selectedBooking.busPlate,
      },
      departure: {
        city: origin,
        terminal: selectedBooking.terminal ?? `${origin} Station`,
        time: selectedBooking.travelDate,
      },
      arrival: {
        city: destination,
        terminal: selectedBooking.terminal ?? `${destination} Station`,
        time: selectedBooking.arrival ?? selectedBooking.travelDate,
      },
      supportContact: selectedBooking.contact.phone || selectedBooking.contact.email,
    };
  }, [selectedBooking]);

  const renderListSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="py-6">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="mt-4 h-4 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {t('nav.myTickets')}
            </p>
            <h1 className="text-3xl font-semibold">{t('ticketsPage.description')}</h1>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void loadBookings()}
            disabled={loading}
          >
            <RefreshCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            {loading ? (
              renderListSkeleton()
            ) : bookings.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No bookings yet</CardTitle>
                  <CardDescription>
                    Your confirmed tickets will appear here once you complete a booking.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isActive = selectedBooking?.bookingReference === booking.bookingReference;
                  return (
                    <Card
                      key={booking.bookingReference}
                      className={cn(
                        'cursor-pointer transition-shadow hover:shadow-lg',
                        isActive && 'border-primary shadow-lg',
                      )}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <CardContent className="space-y-4 py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{booking.route}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="size-4" />
                              {formatDateTime(booking.travelDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusVariant[booking.status]}>
                              {statusLabel[booking.status]}
                            </Badge>
                            <p className="mt-1 text-lg font-semibold">
                              {formatCurrency(booking.total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ref {booking.bookingReference}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4" />
                          <span>{booking.terminal ?? 'Pickup TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ticket className="size-4" />
                          <span>
                            {booking.seatCount} {t('common.tickets')} ·{' '}
                            {booking.seatType ?? 'Standard'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View ticket
                          </Button>
                          {isCancelable(booking) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleCancel(booking.bookingReference);
                              }}
                              disabled={cancellingRef === booking.bookingReference}
                            >
                              {cancellingRef === booking.bookingReference ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                'Cancel'
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedBooking && selectedBooking.status === 'confirmed' && selectedTicket ? (
              <Card>
                <CardHeader>
                  <CardTitle>E-ticket preview</CardTitle>
                  <CardDescription>
                    Booking reference {selectedBooking.bookingReference} — sent to{' '}
                    {selectedBooking.contact.email ?? selectedBooking.contact.phone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ETicketTemplate
                    ticket={selectedTicket}
                    onDownload={() => console.log('Ticket downloaded')}
                  />
                </CardContent>
              </Card>
            ) : selectedBooking ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Ticket details</CardTitle>
                  <CardDescription>
                    This booking is currently {statusLabel[selectedBooking.status].toLowerCase()}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    {selectedBooking.status === 'pending'
                      ? 'We are finalizing your booking. You will receive an e-ticket once it is confirmed.'
                      : 'No e-ticket is available for this booking yet.'}
                  </p>
                  {selectedBooking.expiresAt && (
                    <p>
                      Expires at: <strong>{formatDateTime(selectedBooking.expiresAt)}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a booking</CardTitle>
                  <CardDescription>
                    Choose a booking from the list to view its e-ticket details.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
