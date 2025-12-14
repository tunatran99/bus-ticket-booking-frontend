import { useState } from 'react';
import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { bookingsService, type BookingRecord } from '../services/bookings.service';
import { getErrorMessage } from '../services/error';
import { Search, RefreshCw, Ticket, Phone, CalendarDays, Users } from 'lucide-react';

const statusVariant: Record<
  BookingRecord['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'outline',
  expired: 'destructive',
};

export function GuestLookup() {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabel: Record<BookingRecord['status'], string> = {
    pending: t('guestLookup.status.pending'),
    confirmed: t('guestLookup.status.confirmed'),
    cancelled: t('guestLookup.status.cancelled'),
    expired: t('guestLookup.status.expired'),
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '--';
    return new Date(value).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reference.trim() || (!phone.trim() && !email.trim())) {
      setError(t('guestLookup.errors.missingFields'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const booking = await bookingsService.lookupGuestBooking({
        bookingReference: reference.trim(),
        contact: {
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        },
      });
      setResult(booking);
    } catch (lookupError) {
      setError(getErrorMessage(lookupError, t('guestLookup.errors.lookupFailed')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {t('guestLookup.badge')}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight mb-3">{t('guestLookup.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('guestLookup.subtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="size-5 text-primary" />
                {t('guestLookup.formTitle')}
              </CardTitle>
              <CardDescription>{t('guestLookup.formDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
                <div className="space-y-2">
                  <Label htmlFor="reference">{t('guestLookup.referenceLabel')}</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value.toUpperCase())}
                    placeholder="BT-250101-ABCD"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('guestLookup.phoneLabel')}</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+84 xxx xxx xxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('guestLookup.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t('guestLookup.helper')}</p>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>{t('guestLookup.errors.title')}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" className="gap-2" disabled={isLoading}>
                    <Search className={isLoading ? 'size-4 animate-spin' : 'size-4'} />
                    {t('guestLookup.submitCta')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleReset}
                    disabled={isLoading || !result}
                  >
                    <RefreshCw className="size-4" />
                    {t('guestLookup.resetCta')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ticket className="size-5 text-primary" />
                {t('guestLookup.resultTitle')}
              </CardTitle>
              <CardDescription>{t('guestLookup.resultDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        {t('guestLookup.statusLabel')}
                      </p>
                      <Badge variant={statusVariant[result.status]}>
                        {statusLabel[result.status]}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {t('guestLookup.referenceLabel')}
                      </p>
                      <p className="font-mono text-lg">{result.bookingReference}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      {t('guestLookup.routeLabel')}
                    </p>
                    <p className="text-xl font-semibold">{result.route}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase">
                        <CalendarDays className="size-4" />
                        {t('guestLookup.departureLabel')}
                      </div>
                      <p className="font-semibold">{formatDateTime(result.travelDate)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase">
                        <CalendarDays className="size-4" />
                        {t('guestLookup.arrivalLabel')}
                      </div>
                      <p className="font-semibold">
                        {formatDateTime(result.arrival ?? result.travelDate)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase">
                      <Phone className="size-4" />
                      {t('guestLookup.contactLabel')}
                    </div>
                    <p className="font-semibold">{result.contact.phone}</p>
                    <p className="text-sm text-muted-foreground">{result.contact.email || '—'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground mb-2">
                      <Users className="size-4" />
                      {t('guestLookup.passengersTitle')}
                    </div>
                    <div className="space-y-2">
                      {result.passengers.map((passenger) => (
                        <div
                          key={`${passenger.idNumber}-${passenger.seatLabel}`}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{passenger.name}</p>
                              <p className="text-xs text-muted-foreground">{passenger.idNumber}</p>
                            </div>
                            <Badge variant="outline">{passenger.seatLabel}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{passenger.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <Ticket className="size-10 mx-auto mb-3 text-muted-foreground/60" />
                  <p className="text-lg font-semibold mb-1">{t('guestLookup.emptyStateTitle')}</p>
                  <p>{t('guestLookup.emptyStateDescription')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
