import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, MapPin, DollarSign, Users, ArrowRightLeft } from 'lucide-react';
import { routeSeedData, type RouteSeedEntry } from '../lib/routeSeed';
import type { PassengerRouteState } from '../types/passenger';

type RouteData = RouteSeedEntry;

interface RouteSelectionState {
  startProvince?: string;
  destinationProvince?: string;
  travelDate?: string;
  numberOfTickets?: number | string;
}

const normalizeProvince = (value?: string) => (value ?? '').trim().toLocaleLowerCase('vi-VN');

export function RouteSelection() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as RouteSelectionState) || {};
  const { startProvince, destinationProvince, travelDate, numberOfTickets } = locationState;
  const [origin, setOrigin] = useState<string | undefined>(startProvince);
  const [destination, setDestination] = useState<string | undefined>(destinationProvince);

  const requestedTickets = (() => {
    if (typeof numberOfTickets === 'number') {
      return numberOfTickets > 0 ? numberOfTickets : 1;
    }
    if (typeof numberOfTickets === 'string') {
      const parsed = parseInt(numberOfTickets, 10);
      return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    }
    return 1;
  })();

  const travelDateLabel =
    typeof travelDate === 'string' && travelDate ? new Date(travelDate).toLocaleDateString() : '—';
  const routeLabel = `${origin ?? '—'} → ${destination ?? '—'}`;

  const canSwap = Boolean(origin && destination);
  const handleSwapProvinces = () => {
    if (!canSwap) return;
    setOrigin(destination);
    setDestination(origin);
  };

  const buildDateTime = (time?: string) => {
    if (typeof travelDate !== 'string' || !time) return undefined;
    const datePart = travelDate.split('T')[0];
    const candidate = new Date(`${datePart}T${time}`);
    return Number.isNaN(candidate.getTime()) ? undefined : candidate.toISOString();
  };

  const handleSelectRoute = (route: RouteData) => {
    const passengerState: PassengerRouteState = {
      seatCount: requestedTickets,
      travelDate: buildDateTime(route.departureTime) ?? travelDate,
      arrival: buildDateTime(route.arrivalTime),
      route: routeLabel,
      terminal: `${route.company} · Platform A`,
      company: route.company,
      seatType: route.busType,
      pricePerTicket: route.price,
    };

    void navigate('/booking/passengers', { state: passengerState });
  };

  if (!origin || !destination) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4">No search criteria provided</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const routes = routeSeedData.filter(
    (route) =>
      normalizeProvince(route.origin) === normalizeProvince(origin) &&
      normalizeProvince(route.destination) === normalizeProvince(destination),
  );
  const hasRoutes = routes.length > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="mb-8">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                {t('routes.title')}
              </CardTitle>
              <CardDescription>
                {routeLabel} | {travelDateLabel} | {requestedTickets} {t('common.tickets')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              onClick={handleSwapProvinces}
              disabled={!canSwap}
            >
              <ArrowRightLeft className="size-4" />
              {t('routes.swapRoute')}
            </Button>
          </CardHeader>
        </Card>

        {/* Routes List */}
        <div className="space-y-4">
          {hasRoutes ? (
            routes.map((route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Company and Bus Type */}
                    <div className="md:col-span-3">
                      <h3 className="mb-2">{route.company}</h3>
                      <Badge variant="secondary">{route.busType}</Badge>
                    </div>

                    {/* Time and Duration */}
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-muted-foreground text-sm">
                            {t('routes.departure')}
                          </div>
                          <div>{route.departureTime}</div>
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-px bg-border flex-1"></div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="size-4" />
                            {route.duration}
                          </div>
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground text-sm">{t('routes.arrival')}</div>
                          <div>{route.arrivalTime}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Seats */}
                    <div className="md:col-span-3 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <DollarSign className="size-4 text-primary" />
                        <span className="text-primary">{formatPrice(route.price)}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        <span>
                          {route.seatsAvailable} {t('routes.seatsAvailable')}
                        </span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="md:col-span-2">
                      <Button
                        className="w-full"
                        disabled={route.seatsAvailable < requestedTickets}
                        onClick={() => handleSelectRoute(route)}
                      >
                        {t('routes.bookNow')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {t('tripSearch.results.noResults')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
