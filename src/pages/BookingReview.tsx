import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { MapPin, Clock, Users, Shield, Wallet, Pencil, Phone, Mail, LogIn } from 'lucide-react';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import type { PassengerFormState, PassengerRouteState } from '../types/passenger';
import { bookingsService } from '../services/bookings.service';
import { getErrorMessage } from '../services/error';
import { ticketsService } from '../services/tickets.service';

const ROUTE_DELIMITERS = ['→', '->', ' - ', ' — ', ' to '];

const extractRouteCities = (routeLabel?: string) => {
  if (!routeLabel) {
    return { origin: 'Origin', destination: 'Destination' };
  }

  const normalized = routeLabel.replace(/\s+/g, ' ').trim();
  for (const delimiter of ROUTE_DELIMITERS) {
    if (normalized.includes(delimiter)) {
      const [rawOrigin, rawDestination] = normalized.split(delimiter);
      const origin = rawOrigin?.trim();
      const destination = rawDestination?.trim();
      if (origin && destination) {
        return { origin, destination };
      }
    }
  }

  return { origin: normalized, destination: 'Destination' };
};

const generateBookingReferenceFallback = () => {
  const randomSegment =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BT-${randomSegment}`;
};

export function BookingReview() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { showDialog, dialog } = useFeedbackDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: PassengerRouteState = (location.state as PassengerRouteState) ?? {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const guestMode = !isAuthenticated;

  const passengers: PassengerFormState[] = locationState.passengers ?? [];
  const contact = locationState.contact;
  const seatCountFromState = locationState.seatCount ?? passengers.length;
  const effectiveSeatCount = seatCountFromState > 0 ? seatCountFromState : passengers.length;
  const pricePerTicket = locationState.pricePerTicket ?? 0;

  const trip = {
    route: locationState.route,
    company: locationState.company,
    date: locationState.travelDate,
    arrival: locationState.arrival,
    terminal: locationState.terminal,
    seatType: locationState.seatType,
    busPlate: locationState.busPlate,
  };

  const pricing = {
    ticketPrice: pricePerTicket,
    serviceFee: 25000,
    insurance: 15000,
  };

  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(value);

  const formatDateTime = (value?: string) => {
    if (!value) return '--';
    const dt = new Date(value);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(dt);
  };

  const total = pricing.ticketPrice * effectiveSeatCount + pricing.serviceFee + pricing.insurance;

  if (!contact || passengers.length === 0 || !trip.route || !trip.date) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="max-w-xl text-center">
            <CardHeader>
              <CardTitle>{t('bookingReview.missingStateTitle')}</CardTitle>
              <CardDescription>{t('bookingReview.missingStateDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate('/booking/passengers', { state: locationState })}>
                {t('bookingReview.resumeCta')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/routes')}>
                {t('bookingReview.backToRoutes')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const passengerEditState: PassengerRouteState = {
    ...locationState,
    passengers,
    contact,
    seatCount: effectiveSeatCount,
  };

  const sendTicketEmailIfPossible = async (bookingReference: string) => {
    if (passengers.length === 0) return;
    const contactEmail = contact.email?.trim();
    if (!contactEmail) return;

    const mainPassenger = passengers[0];
    const passengerName = mainPassenger.name?.trim() || contactEmail;
    const passengerId = mainPassenger.idNumber?.trim();
    const seatLabel = mainPassenger.seatLabel?.trim() || 'Seat 1A';
    const { origin, destination } = extractRouteCities(trip.route);
    const departureTime = trip.date ?? new Date().toISOString();
    const arrivalTime = trip.arrival ?? departureTime;

    try {
      await ticketsService.sendTicketEmail({
        recipient: contactEmail,
        ticket: {
          bookingReference,
          issuedBy: trip.company ?? 'BusTicket.vn',
          passenger: {
            name: passengerName,
            id: passengerId,
          },
          seat: {
            label: seatLabel,
            type: trip.seatType,
            coach: trip.company,
          },
          route: {
            origin,
            destination,
          },
          bus: {
            name: trip.company ?? 'BusTicket Coach',
            plate: trip.busPlate || undefined,
          },
          departure: {
            city: origin,
            terminal: trip.terminal ?? `${origin} Central Station`,
            time: departureTime,
          },
          arrival: {
            city: destination,
            terminal: `${destination} Central Station`,
            time: arrivalTime,
          },
          supportContact: '1900 868 686',
        },
      });
    } catch (error) {
      console.error('Failed to send ticket email', error);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const createBookingRequest = guestMode
        ? (payload: Parameters<typeof bookingsService.createGuestBooking>[0]) =>
            bookingsService.createGuestBooking(payload)
        : (payload: Parameters<typeof bookingsService.createBooking>[0]) =>
            bookingsService.createBooking(payload);

      const confirmBookingRequest = guestMode
        ? (reference: string) =>
            bookingsService.confirmGuestBooking(reference, {
              phone: contact.phone,
              email: contact.email,
            })
        : (reference: string) => bookingsService.confirmBooking(reference);

      const response = await createBookingRequest({
        route: trip.route!,
        travelDate: trip.date!,
        arrival: trip.arrival,
        seatType: trip.seatType,
        seatCount: effectiveSeatCount,
        pricePerTicket: pricing.ticketPrice,
        contact,
        passengers,
      });
      const bookingReference = response.bookingReference ?? generateBookingReferenceFallback();
      const confirmed = response.bookingReference
        ? await confirmBookingRequest(bookingReference)
        : { status: 'pending' };
      await sendTicketEmailIfPossible(bookingReference);

      const referenceLine = bookingReference ? ` Reference: ${bookingReference}` : '';
      showDialog({
        title: t('bookingReview.confirmationSuccessTitle'),
        description: `${t('bookingReview.confirmationSuccessDescription')}${referenceLine} (${confirmed.status})`,
      });
    } catch (error: unknown) {
      showDialog({
        title: t('bookingReview.confirmationErrorTitle'),
        description: getErrorMessage(error, t('bookingReview.confirmationErrorDescription')),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {t('bookingReview.title')}
            </p>
            <h1 className="text-3xl font-semibold">{t('bookingReview.subtitle')}</h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/booking/passengers', { state: passengerEditState })}
            >
              <Pencil className="size-4" />
              {t('bookingReview.editDetails')}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showDialog({
                  title: t('bookingReview.saveDraft'),
                  description: t('bookingReview.comingSoon'),
                })
              }
            >
              {t('bookingReview.saveDraft')}
            </Button>
          </div>
        </div>

        {guestMode && (
          <Alert className="mb-6 border-dashed border-primary/40 bg-primary/5">
            <AlertTitle>
              {language === 'vi'
                ? 'Bạn đang đặt vé với tư cách khách'
                : 'You are booking as a guest'}
            </AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3 text-sm">
              <span>
                {language === 'vi'
                  ? 'Tạo tài khoản để lưu hành trình và truy cập dễ dàng mục My Tickets.'
                  : 'Create an account to save journeys and access them instantly from My Tickets.'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate('/signup')}
              >
                <LogIn className="size-3" />
                {language === 'vi' ? 'Đăng ký' : 'Create account'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('bookingReview.tripSummary')}</CardTitle>
                <CardDescription>{trip.company ?? 'N/A'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <MapPin className="size-10 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">{trip.route}</h3>
                    <p className="text-sm text-muted-foreground">{trip.terminal ?? 'N/A'}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground mb-1">Departure</div>
                    <div className="font-semibold">{formatDateTime(trip.date)}</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground mb-1">Arrival</div>
                    <div className="font-semibold">{formatDateTime(trip.arrival)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-1 capitalize">
                    <Clock className="size-3" /> {trip.seatType ?? 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {trip.busPlate ?? 'N/A'}
                  </Badge>
                  <Badge className="gap-1">
                    <Users className="size-3" /> {effectiveSeatCount} {t('common.tickets')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('bookingReview.passengers')}</CardTitle>
                <CardDescription>
                  {effectiveSeatCount} {t('common.tickets')} · {trip.seatType ?? 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passengers.map((passenger) => (
                  <div key={passenger.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold">
                          {passenger.name || t('passengerForm.fullName')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {passenger.idNumber || t('passengerForm.idNumber')}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {t('bookingReview.seatLabel')} {passenger.seatLabel || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {passenger.phone || t('passengerForm.phone')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('passengerForm.contactDetails')}</CardTitle>
                <CardDescription>{t('bookingReview.notice')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      {t('passengerForm.phone')}
                    </p>
                    <p className="font-semibold">{contact.phone}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      {t('passengerForm.email')}
                    </p>
                    <p className="font-semibold">{contact.email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('bookingReview.notes')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Shield className="size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Flexible changes</p>
                    <p className="text-sm text-muted-foreground">
                      Free changes up to 24h before departure. 50% refund afterward.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Clock className="size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Arrival guidance</p>
                    <p className="text-sm text-muted-foreground">
                      Please arrive 30 minutes early with your ID and e-ticket QR code.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('bookingReview.paymentSummary')}</CardTitle>
                <CardDescription>{t('bookingReview.notice')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      {t('bookingReview.ticketPrice')} × {effectiveSeatCount}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(pricing.ticketPrice * effectiveSeatCount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('bookingReview.serviceFee')}</span>
                    <span>{formatCurrency(pricing.serviceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('bookingReview.insurance')}</span>
                    <span>{formatCurrency(pricing.insurance)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>{t('bookingReview.totalDue')}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  <Wallet className="size-4" />
                  {isSubmitting ? t('bookingReview.processingCta') : t('bookingReview.confirmCta')}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t('bookingReview.notice')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {dialog}
    </Layout>
  );
}
