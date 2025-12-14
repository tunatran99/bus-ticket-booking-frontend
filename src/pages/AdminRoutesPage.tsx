import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import { Plus, Edit2, Trash2, Search, MapPin, ArrowRight, GripVertical } from 'lucide-react';
import apiClient from '../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface RouteStop {
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  order: number;
  minutesFromStart: number;
  isPickup: boolean;
  isDropoff: boolean;
}

interface Route {
  id: number;
  name: string;
  description?: string;
  distance: number;
  estimatedDuration: number;
  isActive: boolean;
  stops: RouteStop[];
}

export function AdminRoutesPage() {
  const { t } = useLanguage();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    distance: '',
    estimatedDuration: '',
    isActive: true,
    stops: [] as RouteStop[],
  });

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredRoutes(routes);
      return;
    }
    const q = query.toLowerCase();
    setFilteredRoutes(
      routes.filter(
        (route) =>
          route.name.toLowerCase().includes(q) ||
          route.description?.toLowerCase().includes(q) ||
          route.stops.some((stop) => stop.locationName.toLowerCase().includes(q)),
      ),
    );
  }, [query, routes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/routes');
      const routesData = (res.data || []) as Route[];
      setRoutes(routesData);
      setFilteredRoutes(routesData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.routes.errors.loadFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedRoute(null);
    setFormData({
      name: '',
      description: '',
      distance: '',
      estimatedDuration: '',
      isActive: true,
      stops: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      description: route.description || '',
      distance: route.distance.toString(),
      estimatedDuration: route.estimatedDuration.toString(),
      isActive: route.isActive,
      stops: route.stops.map((stop) => ({ ...stop })),
    });
    setIsDialogOpen(true);
  };

  const addStop = () => {
    const newOrder = formData.stops.length;
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        {
          locationName: '',
          address: '',
          order: newOrder,
          minutesFromStart: newOrder * 30,
          isPickup: true,
          isDropoff: true,
        },
      ],
    });
  };

  const removeStop = (index: number) => {
    const newStops = formData.stops
      .filter((_, i) => i !== index)
      .map((stop, i) => ({ ...stop, order: i }));
    setFormData({ ...formData, stops: newStops });
  };

  const updateStop = (
    index: number,
    field: keyof RouteStop,
    value: string | number | boolean | undefined,
  ) => {
    const newStops = [...formData.stops];
    newStops[index] = { ...newStops[index], [field]: value as never };
    setFormData({ ...formData, stops: newStops });
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.stops.length - 1)
    ) {
      return;
    }

    const newStops = [...formData.stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];

    // Update order numbers
    newStops.forEach((stop, i) => {
      stop.order = i;
      stop.minutesFromStart = i * 30; // Recalculate based on new order
    });

    setFormData({ ...formData, stops: newStops });
  };

  const handleSave = async () => {
    try {
      if (formData.stops.length < 2) {
        toast.error(t('admin.routes.errors.minStops'));
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        distance: parseInt(formData.distance),
        estimatedDuration: parseInt(formData.estimatedDuration),
        isActive: formData.isActive,
        stops: formData.stops.map((stop) => ({
          ...stop,
          minutesFromStart: parseInt(stop.minutesFromStart.toString()),
        })),
      };

      if (selectedRoute) {
        await apiClient.patch(`/admin/routes/${selectedRoute.id}`, payload);
        toast.success(t('admin.routes.success.updated'));
      } else {
        await apiClient.post('/admin/routes', payload);
        toast.success(t('admin.routes.success.created'));
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.routes.errors.saveFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const openDeleteDialog = (id: number) => {
    setRouteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!routeToDelete) return;

    try {
      await apiClient.delete(`/admin/routes/${routeToDelete}`);
      toast.success(t('admin.routes.success.deleted'));
      setDeleteDialogOpen(false);
      setRouteToDelete(null);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.routes.errors.deleteFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-xl font-semibold">{t('admin.routes.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.routes.subtitle')}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.routes.createRoute')}
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
                  placeholder={t('admin.routes.searchPlaceholder')}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes list */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.routes.routes')}</CardTitle>
            <CardDescription>{t('admin.routes.allRoutes')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t('admin.routes.loading')}</p>
            ) : filteredRoutes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.routes.noRoutes')}</p>
            ) : (
              <div className="space-y-4">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{route.name}</h3>
                          {route.isActive ? (
                            <Badge className="bg-green-100 text-green-700">
                              {t('admin.routes.activeBadge')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t('admin.routes.inactiveBadge')}</Badge>
                          )}
                        </div>
                        {route.description && (
                          <p className="text-sm text-muted-foreground mb-2">{route.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Distance: {route.distance} km</span>
                          <span>Duration: {route.estimatedDuration} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(route)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(route.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {route.stops.map((stop, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{stop.locationName}</span>
                            {stop.isPickup && stop.isDropoff && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                {t('admin.routes.both')}
                              </Badge>
                            )}
                            {stop.isPickup && !stop.isDropoff && (
                              <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
                                {t('admin.routes.pickup')}
                              </Badge>
                            )}
                            {!stop.isPickup && stop.isDropoff && (
                              <Badge variant="outline" className="ml-1 text-xs bg-green-50">
                                {t('admin.routes.dropoff')}
                              </Badge>
                            )}
                          </div>
                          {idx < route.stops.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRoute ? t('admin.routes.editRoute') : t('admin.routes.createNewRoute')}
              </DialogTitle>
              <DialogDescription>
                {selectedRoute
                  ? t('admin.routes.updateDescription')
                  : t('admin.routes.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.routes.routeName')} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Hà Nội - Hồ Chí Minh"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.routes.distance')} *</Label>
                  <Input
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="1700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.routes.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Route description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.routes.estimatedDuration')} *</Label>
                  <Input
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDuration: e.target.value })
                    }
                    placeholder="1200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label className="font-normal">{t('admin.routes.active')}</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {t('admin.routes.stops')} * ({t('admin.routes.stopsRequired')})
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStop}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t('admin.routes.addStop')}
                  </Button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.stops.map((stop, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {t('admin.routes.stop')} {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveStop(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveStop(index, 'down')}
                            disabled={index === formData.stops.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeStop(index)}
                            disabled={formData.stops.length <= 2}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('admin.routes.locationName')} *</Label>
                          <Input
                            value={stop.locationName}
                            onChange={(e) => updateStop(index, 'locationName', e.target.value)}
                            placeholder="e.g., Bến xe Miền Đông"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('admin.routes.address')}</Label>
                          <Input
                            value={stop.address || ''}
                            onChange={(e) => updateStop(index, 'address', e.target.value)}
                            placeholder="Full address"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('admin.routes.minutesFromStart')}</Label>
                          <Input
                            type="number"
                            value={stop.minutesFromStart}
                            onChange={(e) =>
                              updateStop(index, 'minutesFromStart', parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('admin.routes.latitude')}</Label>
                          <Input
                            type="number"
                            step="any"
                            value={stop.latitude || ''}
                            onChange={(e) =>
                              updateStop(index, 'latitude', parseFloat(e.target.value) || undefined)
                            }
                            placeholder="Optional"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('admin.routes.longitude')}</Label>
                          <Input
                            type="number"
                            step="any"
                            value={stop.longitude || ''}
                            onChange={(e) =>
                              updateStop(
                                index,
                                'longitude',
                                parseFloat(e.target.value) || undefined,
                              )
                            }
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={stop.isPickup}
                            onChange={(e) => updateStop(index, 'isPickup', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-xs font-normal">
                            {t('admin.routes.pickupAllowed')}
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={stop.isDropoff}
                            onChange={(e) => updateStop(index, 'isDropoff', e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-xs font-normal">
                            {t('admin.routes.dropoffAllowed')}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('admin.routes.cancel')}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={
                  !formData.name ||
                  !formData.distance ||
                  !formData.estimatedDuration ||
                  formData.stops.length < 2
                }
              >
                {selectedRoute ? t('admin.routes.update') : t('admin.routes.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.routes.deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.routes.deleteConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRouteToDelete(null)}>
                {t('admin.routes.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('admin.routes.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
