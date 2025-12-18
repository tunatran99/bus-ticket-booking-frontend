import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Loader2, Wand2, XCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { paymentsService, type PaymentSession } from '../services/payments.service';
import { getErrorMessage } from '../services/error';
import type { PassengerFormState } from '../types/passenger';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface BookingContextSnapshot {
  bookingReference: string;
  passengers: PassengerFormState[];
  contact: {
    phone: string;
    email?: string;
  };
  trip: {
    route?: string;
    company?: string;
    date?: string;
    arrival?: string;
    terminal?: string;
    seatType?: string;
    busPlate?: string;
  };
  total: number;
  seatCount: number;
  guestMode: boolean;
}

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  processing: { label: 'Awaiting payment', variant: 'secondary' },
  succeeded: { label: 'Payment completed', variant: 'default' },
  failed: { label: 'Payment failed', variant: 'destructive' },
  cancelled: { label: 'Payment cancelled', variant: 'outline' },
};

export function PaymentStatus() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const params = new URLSearchParams(location.search);
  const paymentIdFromQuery = params.get('paymentId') ?? undefined;
  const bookingReferenceFromQuery = params.get('bookingReference') ?? undefined;
  const routeState = location.state as
    | {
        paymentSession?: PaymentSession;
        bookingContext?: BookingContextSnapshot;
      }
    | undefined;

  const [session, setSession] = useState<PaymentSession | null>(routeState?.paymentSession ?? null);
  const [status, setStatus] = useState<string>(routeState?.paymentSession?.status ?? 'processing');
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const paymentId = paymentIdFromQuery ?? session?.paymentId;
  const bookingReference =
    bookingReferenceFromQuery ?? routeState?.bookingContext?.bookingReference;

  const cachedContext = useMemo(() => {
    if (routeState?.bookingContext) {
      return routeState.bookingContext;
    }
    if (bookingReference) {
      try {
        const raw = sessionStorage.getItem(`payment:context:${bookingReference}`);
        return raw ? (JSON.parse(raw) as BookingContextSnapshot) : null;
      } catch (storageError) {
        console.warn('Failed to parse payment context snapshot', storageError);
      }
    }
    return null;
  }, [routeState?.bookingContext, bookingReference]);

  useEffect(() => {
    if (!paymentId) {
      return;
    }
    let pollHandle: number | null = null;
    const fetchStatus = async () => {
      try {
        const latest = await paymentsService.getStatus(paymentId);
        setSession(latest);
        const normalized = latest.status === 'pending' ? 'processing' : latest.status;
        setStatus(normalized);
        setError(null);
        if (normalized === 'succeeded' || normalized === 'failed' || normalized === 'cancelled') {
          if (pollHandle) {
            window.clearInterval(pollHandle);
            pollHandle = null;
          }
        }
      } catch (fetchError) {
        setError(getErrorMessage(fetchError, 'Unable to refresh payment status.'));
      }
    };

    void fetchStatus();
    pollHandle = window.setInterval(fetchStatus, 4000);

    return () => {
      if (pollHandle) {
        window.clearInterval(pollHandle);
      }
    };
  }, [paymentId]);

  const amountLabel = useMemo(() => {
    if (!session) {
      return '--';
    }
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: session.currency || 'VND',
      }).format(session.amount);
    } catch (currencyError) {
      console.warn(currencyError);
      return `${session.amount} ${session.currency ?? 'VND'}`;
    }
  }, [session]);

  const statusMeta = STATUS_LABELS[status] ?? STATUS_LABELS.processing;
  const isFinal = status === 'succeeded' || status === 'failed' || status === 'cancelled';

  const handleOpenCheckout = () => {
    if (session?.checkoutUrl) {
      window.open(session.checkoutUrl, '_blank', 'noopener');
    }
  };

  const handleSimulate = async (nextStatus: 'succeeded' | 'failed') => {
    if (!paymentId) return;
    try {
      setIsSimulating(true);
      await paymentsService.simulateWebhook(paymentId, nextStatus);
      const latest = await paymentsService.getStatus(paymentId);
      setSession(latest);
      setStatus(latest.status === 'pending' ? 'processing' : latest.status);
    } catch (simulateError) {
      setError(getErrorMessage(simulateError, 'Unable to update payment.'));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleNextSteps = () => {
    if (status === 'succeeded') {
      void navigate(isAuthenticated ? '/my-tickets' : '/guest-booking', {
        state: bookingReference ? { bookingReference } : undefined,
      });
      return;
    }
    void navigate('/booking/passengers', {
      state: routeState?.bookingContext ?? cachedContext ?? null,
    });
  };

  if (!paymentId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-xl mx-auto text-center">
            <CardHeader>
              <CardTitle>Missing payment identifier</CardTitle>
              <CardDescription>
                Please return to the booking review step and try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/booking-review')}>
                {t('bookingReview.resumeCta')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Secure checkout</p>
              <h1 className="text-3xl font-semibold tracking-tight">Complete your payment</h1>
            </div>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Payment update failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-dashed border-slate-200 bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Payment progress</CardTitle>
                <CardDescription>
                  We are monitoring your PayOS session in real time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Amount due</p>
                    <p className="text-3xl font-semibold">{amountLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      Booking reference
                    </p>
                    <p className="text-lg font-mono">
                      {bookingReference ?? session?.bookingReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Payment ID</p>
                    <p className="text-sm font-mono text-slate-500">{paymentId}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="justify-start gap-2"
                    variant="secondary"
                    onClick={handleOpenCheckout}
                  >
                    <Wand2 className="size-4" />
                    Reopen PayOS checkout
                  </Button>
                  {!isFinal && (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isSimulating}
                        onClick={() => void handleSimulate('succeeded')}
                      >
                        <Check className="size-4" />
                        Mark as paid (demo)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isSimulating}
                        onClick={() => void handleSimulate('failed')}
                      >
                        <XCircle className="size-4" />
                        Simulate failure
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Live status</h3>
                    {!isFinal && (
                      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="size-4 animate-spin" /> Refreshing every few seconds
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: 'Payment initiated', active: true },
                      {
                        label: 'Awaiting confirmation',
                        active: status === 'processing' || status === 'succeeded',
                      },
                      {
                        label: status === 'succeeded' ? 'Tickets issued' : 'Resolution',
                        active: isFinal,
                      },
                    ].map((step, index) => (
                      <div key={step.label} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {step.active ? (
                            <div className="rounded-full bg-emerald-100 text-emerald-700 p-1">
                              <Check className="size-4" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-slate-100 text-slate-500 p-1">
                              <Loader2 className="size-4" />
                            </div>
                          )}
                          <span className="text-sm font-medium">Step {index + 1}</span>
                        </div>
                        <p className="text-base font-semibold">{step.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80">
              <CardHeader>
                <CardTitle>Booking snapshot</CardTitle>
                <CardDescription>
                  Keep this reference handy in case you need support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Route</p>
                  <p className="font-semibold">
                    {cachedContext?.trip.route ?? bookingReference ?? session?.bookingReference}
                  </p>
                  <p className="text-sm text-slate-500">
                    {cachedContext?.trip.company ?? 'BusTicket.vn'}
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Passengers</span>
                  <span className="font-medium">{cachedContext?.seatCount ?? '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-semibold capitalize">{statusMeta.label}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleNextSteps}>
                    {status === 'succeeded' ? 'View my tickets' : 'Update booking details'}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/routes')}>
                    Back to search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
