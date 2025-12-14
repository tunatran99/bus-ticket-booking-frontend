import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { MapPin, Clock, Users, Shield, Wallet, Pencil, Phone, Mail } from 'lucide-react';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import type { PassengerFormState, PassengerRouteState } from '../types/passenger';
import { bookingsService } from '../services/bookings.service';
import { getErrorMessage } from '../services/error';

export function BookingReview() {
  const { t, language } = useLanguage();
  const { showDialog, dialog } = useFeedbackDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: PassengerRouteState = (location.state as PassengerRouteState) ?? {};
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await bookingsService.createBooking({
        route: trip.route!,
        travelDate: trip.date!,
        arrival: trip.arrival,
        seatType: trip.seatType,
        seatCount: effectiveSeatCount,
        pricePerTicket: pricing.ticketPrice,
        contact,
        passengers,
      });

      const referenceLine = response.bookingReference
        ? ` Reference: ${response.bookingReference}`
        : '';
      showDialog({
        title: t('bookingReview.confirmationSuccessTitle'),
        description: `${t('bookingReview.confirmationSuccessDescription')}${referenceLine}`,
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
