import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { CalendarIcon, Plus, Edit2, Trash2, Search, Clock, Bus, Route } from 'lucide-react';
import apiClient from '../services/api';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { useLanguage } from '../contexts/LanguageContext';

type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface Trip {
  id: number;
  routeId: number;
  busId: number;
  departureTime: string;
  arrivalTime?: string;
  status: TripStatus;
  basePrice: number;
  availableSeats: number;
  route?: {
    id: number;
    name: string;
    stops?: Array<{ locationName: string; order: number }>;
  };
  bus?: {
    id: number;
    licensePlate: string;
    totalSeats: number;
  };
}

interface Route {
  id: number;
  name: string;
  stops: Array<{ locationName: string; order: number }>;
}

interface Bus {
  id: number;
  licensePlate: string;
  totalSeats: number;
  status: string;
}

// Date formatting helper
const formatDate = (date: Date | string, formatStr: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (formatStr === 'PPp') {
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  if (formatStr === 'PPP') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString();
};

export function AdminTripsPage() {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    routeId: '',
    busId: '',
    departureTime: '',
    departureDate: new Date(),
    departureHour: '08',
    departureMinute: '00',
    basePrice: '',
    status: 'scheduled' as TripStatus,
  });

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredTrips(trips);
      return;
    }
    const q = query.toLowerCase();
    setFilteredTrips(
      trips.filter(
        (trip) =>
          trip.route?.name.toLowerCase().includes(q) ||
          trip.bus?.licensePlate.toLowerCase().includes(q) ||
          trip.departureTime.toLowerCase().includes(q),
      ),
    );
  }, [query, trips]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, routesRes, busesRes] = await Promise.all([
        apiClient.get('/admin/trips'),
        apiClient.get('/admin/routes'),
        apiClient.get('/admin/buses'),
      ]);

      setTrips((tripsRes.data || []) as Trip[]);
      setRoutes((routesRes.data || []) as Route[]);
      setBuses((busesRes.data || []) as Bus[]);
      setFilteredTrips((tripsRes.data || []) as Trip[]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.trips.errors.loadFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedTrip(null);
    setFormData({
      routeId: '',
      busId: '',
      departureTime: '',
      departureDate: new Date(),
      departureHour: '08',
      departureMinute: '00',
      basePrice: '',
      status: 'scheduled',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (trip: Trip) => {
    setSelectedTrip(trip);
    const departureDate = new Date(trip.departureTime);
    setFormData({
      routeId: trip.routeId.toString(),
      busId: trip.busId.toString(),
      departureTime: trip.departureTime,
      departureDate,
      departureHour: departureDate.getHours().toString().padStart(2, '0'),
      departureMinute: departureDate.getMinutes().toString().padStart(2, '0'),
      basePrice: trip.basePrice.toString(),
      status: trip.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const departureDateTime = new Date(formData.departureDate);
      departureDateTime.setHours(
        parseInt(formData.departureHour),
        parseInt(formData.departureMinute),
        0,
        0,
      );

      const payload = {
        routeId: parseInt(formData.routeId),
        busId: parseInt(formData.busId),
        departureTime: departureDateTime.toISOString(),
        basePrice: parseFloat(formData.basePrice),
        status: formData.status,
      };

      if (selectedTrip) {
        await apiClient.patch(`/admin/trips/${selectedTrip.id}`, payload);
        toast.success(t('admin.trips.success.updated'));
      } else {
        await apiClient.post('/admin/trips', payload);
        toast.success(t('admin.trips.success.created'));
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.trips.errors.saveFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const openDeleteDialog = (id: number) => {
    setTripToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tripToDelete) return;

    try {
      await apiClient.delete(`/admin/trips/${tripToDelete}`);
      toast.success(t('admin.trips.success.deleted'));
      setDeleteDialogOpen(false);
      setTripToDelete(null);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.trips.errors.deleteFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const getStatusBadge = (status: TripStatus) => {
    const variants: Record<TripStatus, { className: string; labelKey: string }> = {
      scheduled: { className: 'bg-blue-100 text-blue-700', labelKey: 'admin.trips.scheduled' },
      in_progress: {
        className: 'bg-yellow-100 text-yellow-700',
        labelKey: 'admin.trips.inProgress',
      },
      completed: { className: 'bg-green-100 text-green-700', labelKey: 'admin.trips.completed' },
      cancelled: { className: 'bg-red-100 text-red-700', labelKey: 'admin.trips.cancelled' },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{t(variant.labelKey)}</Badge>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-xl font-semibold">{t('admin.trips.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.trips.subtitle')}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.trips.createTrip')}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('admin.trips.searchPlaceholder')}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips list */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.trips.trips')}</CardTitle>
            <CardDescription>{t('admin.trips.allTrips')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t('admin.trips.loading')}</p>
            ) : filteredTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.trips.noTrips')}</p>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{trip.route?.name || 'Unknown Route'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {trip.bus?.licensePlate || 'Unknown Bus'}
                          </span>
                        </div>
                        {getStatusBadge(trip.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(trip.departureTime, 'PPp')}</span>
                        </div>
                        <span>
                          {t('admin.trips.price')}: {trip.basePrice.toLocaleString()} VND
                        </span>
                        <span>
                          {t('admin.trips.availableSeats')}: {trip.availableSeats}/
                          {trip.bus?.totalSeats || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(trip)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(trip.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedTrip ? t('admin.trips.editTrip') : t('admin.trips.createNewTrip')}
              </DialogTitle>
              <DialogDescription>
                {selectedTrip
                  ? t('admin.trips.updateDescription')
                  : t('admin.trips.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('admin.trips.route')}</Label>
                <Select
                  value={formData.routeId}
                  onValueChange={(value: string) => setFormData({ ...formData, routeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.trips.selectRoute')} />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id.toString()}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.trips.bus')}</Label>
                <Select
                  value={formData.busId}
                  onValueChange={(value: string) => setFormData({ ...formData, busId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.trips.selectBus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {buses
                      .filter((bus) => bus.status === 'active')
                      .map((bus) => (
                        <SelectItem key={bus.id} value={bus.id.toString()}>
                          {bus.licensePlate} ({bus.totalSeats} seats)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.trips.departureDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.departureDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.departureDate ? (
                          formatDate(formData.departureDate, 'PPP')
                        ) : (
                          <span>{t('admin.trips.pickDate')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.departureDate}
                        onSelect={(date: Date | undefined) =>
                          date && setFormData({ ...formData, departureDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t('admin.trips.departureTime')}</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.departureHour}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, departureHour: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select
                      value={formData.departureMinute}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, departureMinute: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.trips.basePrice')}</Label>
                <Input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.trips.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as TripStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">{t('admin.trips.scheduled')}</SelectItem>
                    <SelectItem value="in_progress">{t('admin.trips.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('admin.trips.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('admin.trips.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('admin.trips.cancel')}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!formData.routeId || !formData.busId || !formData.basePrice}
              >
                {selectedTrip ? t('admin.trips.update') : t('admin.trips.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.trips.deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.trips.deleteConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTripToDelete(null)}>
                {t('admin.trips.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('admin.trips.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
