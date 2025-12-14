import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import { Plus, Edit2, Trash2, Search, Bus, Grid3x3 } from 'lucide-react';
import apiClient from '../services/api';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { useLanguage } from '../contexts/LanguageContext';

type SeatType = 'regular' | 'vip' | 'sleeper';
type SeatPosition = 'window' | 'aisle' | 'middle';

interface SeatLayout {
  seatNumber: string;
  row: number;
  column: string;
  seatType: SeatType;
  position?: SeatPosition;
  basePrice: number;
  isActive: boolean;
}

interface Bus {
  id: number;
  licensePlate: string;
  brand?: string;
  model?: string;
  totalSeats: number;
  status: string;
  notes?: string;
  seatLayouts?: SeatLayout[];
}

export function AdminBusesPage() {
  const { t } = useLanguage();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSeatLayoutOpen, setIsSeatLayoutOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState<number | null>(null);
  const [seatLayout, setSeatLayout] = useState<SeatLayout[]>([]);
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    totalSeats: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredBuses(buses);
      return;
    }
    const q = query.toLowerCase();
    setFilteredBuses(
      buses.filter(
        (bus) =>
          bus.licensePlate.toLowerCase().includes(q) ||
          bus.brand?.toLowerCase().includes(q) ||
          bus.model?.toLowerCase().includes(q),
      ),
    );
  }, [query, buses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/buses');
      const busesData = (res.data || []) as Bus[];
      setBuses(busesData);
      setFilteredBuses(busesData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.buses.errors.loadFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedBus(null);
    setFormData({
      licensePlate: '',
      brand: '',
      model: '',
      totalSeats: '',
      status: 'active',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      licensePlate: bus.licensePlate,
      brand: bus.brand || '',
      model: bus.model || '',
      totalSeats: bus.totalSeats.toString(),
      status: bus.status,
      notes: bus.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openSeatLayoutDialog = async (bus: Bus) => {
    setSelectedBus(bus);
    try {
      const res = await apiClient.get(`/admin/buses/${bus.id}`);
      const busData = res.data as Bus;
      setSeatLayout(busData.seatLayouts || []);
      setIsSeatLayoutOpen(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.buses.errors.loadLayoutFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        licensePlate: formData.licensePlate,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        totalSeats: parseInt(formData.totalSeats),
        status: formData.status,
        notes: formData.notes || undefined,
      };

      if (selectedBus) {
        await apiClient.patch(`/admin/buses/${selectedBus.id}`, payload);
        toast.success(t('admin.buses.success.updated'));
      } else {
        await apiClient.post('/admin/buses', payload);
        toast.success(t('admin.buses.success.created'));
      }

      setIsDialogOpen(false);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.buses.errors.saveFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const handleSaveSeatLayout = async () => {
    if (!selectedBus) return;

    try {
      await apiClient.post(`/admin/buses/${selectedBus.id}/seat-layout`, {
        seatLayouts: seatLayout,
      });
      toast.success(t('admin.buses.success.layoutUpdated'));
      setIsSeatLayoutOpen(false);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.buses.errors.saveLayoutFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const openDeleteDialog = (id: number) => {
    setBusToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!busToDelete) return;

    try {
      await apiClient.delete(`/admin/buses/${busToDelete}`);
      toast.success(t('admin.buses.success.deleted'));
      setDeleteDialogOpen(false);
      setBusToDelete(null);
      await loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        t('admin.buses.errors.deleteFailed') +
          ': ' +
          (apiError.response?.data?.message || errorMessage),
      );
    }
  };

  const generateSeatLayout = (rows: number, seatsPerRow: number) => {
    const layouts: SeatLayout[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let row = 1; row <= rows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const column = columns[col] || col.toString();
        layouts.push({
          seatNumber: `${row}${column}`,
          row,
          column,
          seatType: 'regular',
          position:
            col === 0 || col === seatsPerRow - 1
              ? 'window'
              : col === Math.floor(seatsPerRow / 2)
                ? 'middle'
                : 'aisle',
          basePrice: 500000,
          isActive: true,
        });
      }
    }

    setSeatLayout(layouts);
  };

  const updateSeat = <K extends keyof SeatLayout>(
    index: number,
    field: K,
    value: SeatLayout[K],
  ) => {
    setSeatLayout((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getSeatTypeColor = (type: SeatType) => {
    switch (type) {
      case 'vip':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'sleeper':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  // Group seats by row for display
  const seatsByRow = seatLayout.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    },
    {} as Record<number, SeatLayout[]>,
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-xl font-semibold">{t('admin.buses.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.buses.subtitle')}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t('admin.buses.createBus')}
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
                  placeholder={t('admin.buses.searchPlaceholder')}
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buses list */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.buses.buses')}</CardTitle>
            <CardDescription>{t('admin.buses.allBuses')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t('admin.buses.loading')}</p>
            ) : filteredBuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.buses.noBuses')}</p>
            ) : (
              <div className="space-y-4">
                {filteredBuses.map((bus) => (
                  <div
                    key={bus.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bus className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{bus.licensePlate}</h3>
                          {(bus.brand || bus.model) && (
                            <p className="text-sm text-muted-foreground">
                              {bus.brand} {bus.model}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            bus.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {bus.status === 'active'
                            ? t('admin.buses.activeStatus')
                            : bus.status === 'maintenance'
                              ? t('admin.buses.maintenanceStatus')
                              : t('admin.buses.retiredStatus')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {t('admin.buses.totalSeatsLabel')}: {bus.totalSeats}
                        </span>
                        {bus.seatLayouts && bus.seatLayouts.length > 0 && (
                          <span>
                            {t('admin.buses.layoutConfigured')}: {bus.seatLayouts.length}{' '}
                            {t('admin.buses.seatsConfigured')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void openSeatLayoutDialog(bus)}
                        title={t('admin.buses.configureSeatLayout')}
                      >
                        <Grid3x3 className="h-4 w-4 mr-1" />
                        {t('admin.buses.seatLayout')}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(bus)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(bus.id)}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedBus ? t('admin.buses.editBus') : t('admin.buses.createNewBus')}
              </DialogTitle>
              <DialogDescription>
                {selectedBus
                  ? t('admin.buses.updateDescription')
                  : t('admin.buses.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('admin.buses.licensePlate')} *</Label>
                <Input
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="29A-12345"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.buses.brand')}</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Mercedes"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.buses.model')}</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Sprinter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.buses.totalSeats')} *</Label>
                  <Input
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    placeholder="40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.buses.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('admin.buses.activeStatus')}</SelectItem>
                      <SelectItem value="maintenance">
                        {t('admin.buses.maintenanceStatus')}
                      </SelectItem>
                      <SelectItem value="retired">{t('admin.buses.retiredStatus')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('admin.buses.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('admin.buses.cancel')}
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!formData.licensePlate || !formData.totalSeats}
              >
                {selectedBus ? t('admin.buses.update') : t('admin.buses.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Seat Layout Dialog */}
        <Dialog open={isSeatLayoutOpen} onOpenChange={setIsSeatLayoutOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t('admin.buses.seatLayoutTitle')} - {selectedBus?.licensePlate}
              </DialogTitle>
              <DialogDescription>{t('admin.buses.seatLayoutDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rows = prompt('Number of rows?', '10');
                      const seatsPerRow = prompt('Seats per row?', '4');
                      if (rows && seatsPerRow) {
                        generateSeatLayout(parseInt(rows), parseInt(seatsPerRow));
                      }
                    }}
                  >
                    {t('admin.buses.generateLayout')}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300"></div>
                    <span>{t('admin.buses.regular')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300"></div>
                    <span>{t('admin.buses.vip')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-300"></div>
                    <span>{t('admin.buses.sleeper')}</span>
                  </div>
                </div>
              </div>

              {/* Visual Seat Layout */}
              <div className="border rounded-lg p-6 bg-muted/30">
                <div className="text-center mb-4 font-medium">{t('admin.buses.frontOfBus')}</div>
                <div className="space-y-2">
                  {Object.entries(seatsByRow)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([row, seats]) => (
                      <div key={row} className="flex items-center gap-2">
                        <div className="w-12 text-sm font-medium text-center">
                          {t('admin.buses.row')} {row}
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-1">
                          {seats.map((seat, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'w-16 h-12 border rounded flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity',
                                getSeatTypeColor(seat.seatType),
                                !seat.isActive && 'opacity-50',
                              )}
                              onClick={() => {
                                const seatIndex = seatLayout.findIndex(
                                  (s) => s.seatNumber === seat.seatNumber,
                                );
                                if (seatIndex >= 0) {
                                  const dialog = document.createElement('div');
                                  dialog.className =
                                    'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
                                  dialog.innerHTML = `
                                    <div class="bg-white p-4 rounded-lg max-w-md w-full">
                                      <h3 class="font-semibold mb-4">Edit Seat ${seat.seatNumber}</h3>
                                      <div class="space-y-2">
                                        <label class="block text-sm">Seat Type</label>
                                        <select id="seatType" class="w-full p-2 border rounded">
                                          <option value="regular" ${seat.seatType === 'regular' ? 'selected' : ''}>Regular</option>
                                          <option value="vip" ${seat.seatType === 'vip' ? 'selected' : ''}>VIP</option>
                                          <option value="sleeper" ${seat.seatType === 'sleeper' ? 'selected' : ''}>Sleeper</option>
                                        </select>
                                        <label class="block text-sm">Base Price</label>
                                        <input type="number" id="basePrice" value="${seat.basePrice}" class="w-full p-2 border rounded" />
                                        <label class="flex items-center gap-2">
                                          <input type="checkbox" id="isActive" ${seat.isActive ? 'checked' : ''} />
                                          <span>Active</span>
                                        </label>
                                      </div>
                                      <div class="flex gap-2 mt-4">
                                        <button id="save" class="flex-1 bg-primary text-white p-2 rounded">Save</button>
                                        <button id="cancel" class="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
                                      </div>
                                    </div>
                                  `;
                                  document.body.appendChild(dialog);
                                  dialog.querySelector('#cancel')?.addEventListener('click', () => {
                                    document.body.removeChild(dialog);
                                  });
                                  dialog.querySelector('#save')?.addEventListener('click', () => {
                                    const type = (
                                      dialog.querySelector('#seatType') as HTMLSelectElement
                                    ).value as SeatType;
                                    const price = parseFloat(
                                      (dialog.querySelector('#basePrice') as HTMLInputElement)
                                        .value,
                                    );
                                    const active = (
                                      dialog.querySelector('#isActive') as HTMLInputElement
                                    ).checked;
                                    updateSeat(seatIndex, 'seatType', type);
                                    updateSeat(seatIndex, 'basePrice', price);
                                    updateSeat(seatIndex, 'isActive', active);
                                    document.body.removeChild(dialog);
                                  });
                                }
                              }}
                            >
                              <div className="text-xs font-medium">{seat.seatNumber}</div>
                              <div className="text-xs">{seat.basePrice.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="text-center mt-4 font-medium">{t('admin.buses.backOfBus')}</div>
              </div>

              {/* Seat List Editor */}
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-medium mb-3">{t('admin.buses.seatDetails')}</h4>
                <div className="space-y-2">
                  {seatLayout.map((seat, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <span className="w-20 font-medium">{seat.seatNumber}</span>
                      <Select
                        value={seat.seatType}
                        onValueChange={(value) => updateSeat(index, 'seatType', value as SeatType)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">{t('admin.buses.regular')}</SelectItem>
                          <SelectItem value="vip">{t('admin.buses.vip')}</SelectItem>
                          <SelectItem value="sleeper">{t('admin.buses.sleeper')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={seat.basePrice}
                        onChange={(e) =>
                          updateSeat(index, 'basePrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-32"
                        placeholder="Price"
                      />
                      <input
                        type="checkbox"
                        checked={seat.isActive}
                        onChange={(e) => updateSeat(index, 'isActive', e.target.checked)}
                        className="rounded"
                      />
                      <Label className="text-xs">{t('admin.buses.active')}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSeatLayoutOpen(false)}>
                {t('admin.buses.cancel')}
              </Button>
              <Button
                onClick={() => void handleSaveSeatLayout()}
                disabled={seatLayout.length === 0}
              >
                {t('admin.buses.saveLayout')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.buses.deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('admin.buses.deleteConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBusToDelete(null)}>
                {t('admin.buses.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('admin.buses.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
