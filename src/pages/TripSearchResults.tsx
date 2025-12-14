import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Clock,
  MapPin,
  DollarSign,
  Users,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { tripsService, Trip, type SearchTripsParams } from '../services/trips.service';
import { Skeleton } from '../components/ui/skeleton';

interface LocationState {
  origin?: string;
  destination?: string;
  date?: string;
  numberOfTickets?: string | number;
}

export function TripSearchResults() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as LocationState | undefined) || {};
  const { origin, destination, date, numberOfTickets } = locationState;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [busType, setBusType] = useState<'all' | 'regular' | 'vip' | 'sleeper'>('all');
  const [sortBy, setSortBy] = useState<
    'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'duration_asc' | 'duration_desc'
  >('time_asc');
  const amenityFilters = useMemo(
    () =>
      ['wifi', 'snacks', 'entertainment', 'charging', 'restroom', 'blanket'].map((value) => ({
        value,
        label: t(`tripSearch.filters.amenities.options.${value}`),
      })),
    [t],
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const getAmenityLabel = (value: string) => {
    const translated = t(`tripSearch.filters.amenities.options.${value}`);
    return translated || value;
  };

  const handleAmenityChange = (value: string, checked: boolean) => {
    setSelectedAmenities((prev) => {
      if (checked) {
        return prev.includes(value) ? prev : [...prev, value];
      }
      return prev.filter((item) => item !== value);
    });
  };

  const loadTrips = async () => {
    if (!origin || !destination || !date) {
      return;
    }
    setLoading(true);
    try {
      const params: SearchTripsParams = {
        origin,
        destination,
        date,
        page,
        limit,
        sortBy,
      };
      if (timeFrom) params.timeFrom = timeFrom;
      if (timeTo) params.timeTo = timeTo;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (busType && busType !== 'all') params.busType = busType;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities;

      const response = await tripsService.searchTrips(params);
      setTrips(response.data.trips);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!origin || !destination || !date) {
      void navigate('/');
      return;
    }
    void loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    origin,
    destination,
    date,
    page,
    timeFrom,
    timeTo,
    minPrice,
    maxPrice,
    busType,
    sortBy,
    selectedAmenities,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleTripClick = (tripId: number) => {
    void navigate(`/trips/${tripId}`, {
      state: { numberOfTickets, origin, destination, date },
    });
  };

  const clearFilters = () => {
    setTimeFrom('');
    setTimeTo('');
    setMinPrice('');
    setMaxPrice('');
    setBusType('all');
    setSortBy('time_asc');
    setSelectedAmenities([]);
    void loadTrips();
  };

  if (!origin || !destination || !date) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              {t('tripSearch.title')}
            </CardTitle>
            <CardDescription>
              {origin} → {destination} | {date ? new Date(date).toLocaleDateString() : 'N/A'} |{' '}
              {numberOfTickets || 1} {t('common.tickets')}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="size-5" />
                  {t('tripSearch.filters.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('tripSearch.filters.departureTime')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      placeholder={t('tripSearch.filters.from')}
                    />
                    <Input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      placeholder={t('tripSearch.filters.to')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('tripSearch.filters.priceRange')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t('tripSearch.filters.min')}
                    />
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t('tripSearch.filters.max')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('tripSearch.filters.busType')}</Label>
                  <Select
                    value={busType}
                    onValueChange={(v: string) => setBusType(v as typeof busType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('tripSearch.filters.all')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('tripSearch.filters.all')}</SelectItem>
                      <SelectItem value="regular">{t('tripSearch.filters.regular')}</SelectItem>
                      <SelectItem value="vip">{t('tripSearch.filters.vip')}</SelectItem>
                      <SelectItem value="sleeper">{t('tripSearch.filters.sleeper')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('tripSearch.filters.amenities.title')}</Label>
                  <div className="space-y-2">
                    {amenityFilters.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={selectedAmenities.includes(option.value)}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(option.value, checked === true)
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  {t('tripSearch.filters.clear')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {total}{' '}
                {total === 1
                  ? t('tripSearch.results.countOne')
                  : t('tripSearch.results.countOther')}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4" />
                <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_asc">
                      {t('tripSearch.sort.departureEarliest')}
                    </SelectItem>
                    <SelectItem value="time_desc">
                      {t('tripSearch.sort.departureLatest')}
                    </SelectItem>
                    <SelectItem value="price_asc">{t('tripSearch.sort.priceLowHigh')}</SelectItem>
                    <SelectItem value="price_desc">{t('tripSearch.sort.priceHighLow')}</SelectItem>
                    <SelectItem value="duration_asc">
                      {t('tripSearch.sort.durationShortest')}
                    </SelectItem>
                    <SelectItem value="duration_desc">
                      {t('tripSearch.sort.durationLongest')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trips List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">{t('tripSearch.results.noResults')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleTripClick(trip.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Route Info */}
                        <div className="md:col-span-4">
                          <h3 className="font-semibold mb-2">
                            {trip.route?.name || t('tripSearch.results.routeFallback')}
                          </h3>
                          {trip.bus && <Badge variant="secondary">{trip.bus.licensePlate}</Badge>}
                          {trip.bus?.amenities && trip.bus.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {trip.bus.amenities.map((amenity) => (
                                <Badge key={amenity} variant="outline" className="text-xs">
                                  {getAmenityLabel(amenity)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Time and Duration */}
                        <div className="md:col-span-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-muted-foreground text-sm">
                                {t('tripSearch.results.departure')}
                              </div>
                              <div className="font-semibold">{formatTime(trip.departureTime)}</div>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="h-px bg-border flex-1"></div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="size-4" />
                                {trip.route?.estimatedDuration
                                  ? formatDuration(trip.route.estimatedDuration)
                                  : t('tripSearch.results.unavailable')}
                              </div>
                              <div className="h-px bg-border flex-1"></div>
                            </div>
                            {trip.arrivalTime && (
                              <div className="text-center">
                                <div className="text-muted-foreground text-sm">
                                  {t('tripSearch.results.arrival')}
                                </div>
                                <div className="font-semibold">{formatTime(trip.arrivalTime)}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price and Seats */}
                        <div className="md:col-span-2 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <DollarSign className="size-4 text-primary" />
                            <span className="text-primary font-semibold">
                              {formatPrice(Number(trip.basePrice))}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Users className="size-4" />
                            <span>
                              {trip.availableSeats} {t('tripSearch.results.seats')}
                            </span>
                          </div>
                        </div>

                        {/* Book Button */}
                        <div className="md:col-span-2">
                          <Button
                            className="w-full"
                            disabled={
                              trip.availableSeats <
                              (numberOfTickets ? parseInt(String(numberOfTickets), 10) || 1 : 1)
                            }
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleTripClick(trip.id);
                            }}
                          >
                            {t('tripSearch.results.viewDetails')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm">
                  {t('tripSearch.results.pagination')
                    .replace('{page}', page.toString())
                    .replace('{totalPages}', totalPages.toString())}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
