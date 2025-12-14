import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Wifi,
  Coffee,
  Snowflake,
  Tv,
  Utensils,
} from 'lucide-react';
import { tripsService, Trip } from '../services/trips.service';
import { Skeleton } from '../components/ui/skeleton';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import { getErrorMessage } from '../services/error';
import type { PassengerRouteState } from '../types/passenger';

interface TripDetailsState {
  numberOfTickets?: number | string;
  origin?: string;
  destination?: string;
}

export function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { showDialog, dialog } = useFeedbackDialog();
  const locationState = (location.state as TripDetailsState | undefined) ?? {};
  const { numberOfTickets, origin, destination } = locationState;

  const ticketCount = (() => {
    if (typeof numberOfTickets === 'number') {
      return numberOfTickets > 0 ? numberOfTickets : 1;
    }
    if (typeof numberOfTickets === 'string') {
      const parsed = parseInt(numberOfTickets, 10);
      return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    }
    return 1;
  })();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTrip = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await tripsService.getTripById(parseInt(id, 10));
      setTrip(response.data);
    } catch (error) {
      console.error('Error loading trip:', error);
      showDialog({
        title: 'Unable to load trip',
        description: getErrorMessage(error, 'Please try refreshing the page.'),
      });
    } finally {
      setLoading(false);
    }
  }, [id, showDialog]);

  useEffect(() => {
    void loadTrip();
  }, [loadTrip]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleBeginPassengerDetails = () => {
    if (!trip) return;

    const passengerState: PassengerRouteState = {
      seatCount: Math.min(ticketCount, trip.availableSeats),
      travelDate: trip.departureTime,
      arrival: trip.arrivalTime,
      route: trip.route?.name || `${origin ?? 'Origin'} → ${destination ?? 'Destination'}`,
      terminal: trip.route?.stops?.[0]?.locationName,
      company: trip.bus?.brand || trip.route?.name,
      seatType: trip.bus?.seatLayouts?.[0]?.seatType,
      busPlate: trip.bus?.licensePlate,
      pricePerTicket: Number(trip.basePrice),
    };

    void navigate('/booking/passengers', { state: passengerState });
  };

  const amenities = [
    { icon: Wifi, name: 'Free WiFi' },
    { icon: Coffee, name: 'Refreshments' },
    { icon: Snowflake, name: 'Air Conditioning' },
    { icon: Tv, name: 'Entertainment' },
    { icon: Utensils, name: 'Meals' },
  ];

  if (loading) {
    return (
      <Layout>
        {dialog}
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        {dialog}
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="mb-4">Trip not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const departure = formatDateTime(trip.departureTime);
  const arrival = trip.arrivalTime ? formatDateTime(trip.arrivalTime) : null;

  return (
    <Layout>
      {dialog}
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{trip.route?.name || 'Route'}</h3>
                  {trip.route?.description && (
                    <p className="text-muted-foreground">{trip.route.description}</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Distance</div>
                    <div className="font-semibold">{trip.route?.distance || 0} km</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Estimated Duration</div>
                    <div className="font-semibold">
                      {trip.route?.estimatedDuration
                        ? formatDuration(trip.route.estimatedDuration)
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {trip.route?.stops && trip.route.stops.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Stops</div>
                      <div className="space-y-2">
                        {trip.route.stops.map((stop, index) => (
                          <div key={stop.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{stop.locationName}</div>
                                {stop.address && (
                                  <div className="text-sm text-muted-foreground">
                                    {stop.address}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Departure</div>
                    <div className="text-2xl font-bold mb-1">{departure.time}</div>
                    <div className="text-muted-foreground">{departure.date}</div>
                    {trip.route?.stops && trip.route.stops.length > 0 && (
                      <div className="mt-2 text-sm">From: {trip.route.stops[0].locationName}</div>
                    )}
                  </div>

                  {arrival && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Arrival</div>
                        <div className="text-2xl font-bold mb-1">{arrival.time}</div>
                        <div className="text-muted-foreground">{arrival.date}</div>
                        {trip.route?.stops && trip.route.stops.length > 0 && (
                          <div className="mt-2 text-sm">
                            To: {trip.route.stops[trip.route.stops.length - 1].locationName}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bus Information */}
            {trip.bus && (
              <Card>
                <CardHeader>
                  <CardTitle>Bus Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">License Plate</div>
                      <Badge variant="secondary">{trip.bus.licensePlate}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Seats</div>
                      <div className="font-semibold">{trip.bus.totalSeats} seats</div>
                    </div>
                    {trip.bus.brand && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Brand</div>
                        <div className="font-semibold">{trip.bus.brand}</div>
                      </div>
                    )}
                    {trip.bus.model && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Model</div>
                        <div className="font-semibold">{trip.bus.model}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity, index) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <Icon className="size-5 text-primary" />
                        <span>{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="font-semibold mb-1">Cancellation Policy</div>
                  <p className="text-sm text-muted-foreground">
                    Free cancellation up to 24 hours before departure. 50% refund for cancellations
                    within 24 hours.
                  </p>
                </div>
                <Separator />
                <div>
                  <div className="font-semibold mb-1">Baggage Policy</div>
                  <p className="text-sm text-muted-foreground">
                    Each passenger is allowed one carry-on bag (max 7kg) and one checked bag (max
                    20kg).
                  </p>
                </div>
                <Separator />
                <div>
                  <div className="font-semibold mb-1">Check-in</div>
                  <p className="text-sm text-muted-foreground">
                    Please arrive at least 30 minutes before departure time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Price per ticket</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(Number(trip.basePrice))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Number of tickets</div>
                  <div className="font-semibold">{ticketCount}</div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Available seats</div>
                  <div className="font-semibold flex items-center gap-2">
                    <Users className="size-4" />
                    {trip.availableSeats}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="text-2xl font-bold">
                    {formatPrice(Number(trip.basePrice) * ticketCount)}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={trip.availableSeats < ticketCount}
                  onClick={handleBeginPassengerDetails}
                >
                  Book Now
                </Button>

                {trip.availableSeats < ticketCount && (
                  <p className="text-sm text-destructive text-center">Not enough seats available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {dialog}
    </Layout>
  );
}
