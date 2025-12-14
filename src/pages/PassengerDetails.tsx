import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Users, MapPin, Trash2, Phone, Loader2, RefreshCw, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import type { ContactInfo, PassengerFormState, PassengerRouteState } from '../types/passenger';
import { SeatMap, DEFAULT_SEAT_ORDER } from '../components/SeatMap';
import { bookingsService } from '../services/bookings.service';

const createPassenger = (seatLabel: string): PassengerFormState => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  seatLabel,
});

const seatOrderMap = new Map(DEFAULT_SEAT_ORDER.map((seatId, index) => [seatId, index]));

const sortSeats = (seats: string[]) =>
  [...seats].sort(
    (a, b) =>
      (seatOrderMap.get(a) ?? Number.MAX_SAFE_INTEGER) -
      (seatOrderMap.get(b) ?? Number.MAX_SAFE_INTEGER),
  );

const buildPassengersFromSeats = (
  seatIds: string[],
  existingPassengers: PassengerFormState[] = [],
): PassengerFormState[] => {
  if (seatIds.length === 0) return [];
  const existingMap = new Map(
    existingPassengers.map((passenger) => [passenger.seatLabel, passenger]),
  );
  return seatIds.map((seatLabel, index) => {
    const existing = existingMap.get(seatLabel);
    if (existing) {
      return existing.id ? existing : { ...existing, id: `${seatLabel}-${index}` };
    }
    return createPassenger(seatLabel);
  });
};

export function PassengerDetails() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: PassengerRouteState = (location.state as PassengerRouteState) ?? {};
  const { showDialog, dialog } = useFeedbackDialog();
  const routeName = locationState.route ?? 'Hà Nội → Đà Nẵng';
  const travelDateValue = locationState.travelDate ?? new Date().toISOString();
  const busPlate = locationState.busPlate;
  const seatType = locationState.seatType;

  const ticketLimit = Math.max(1, locationState.seatCount ?? locationState.passengers?.length ?? 2);
  const initialSeatSelection = useMemo(() => {
    const seatLabelsFromState = (locationState.passengers ?? [])
      .map((passenger) => passenger.seatLabel)
      .filter((label): label is string => Boolean(label));
    if (seatLabelsFromState.length > 0) {
      return sortSeats(seatLabelsFromState);
    }
    return sortSeats(DEFAULT_SEAT_ORDER.slice(0, ticketLimit));
  }, [locationState.passengers, ticketLimit]);

  const [selectedSeats, setSelectedSeats] = useState<string[]>(initialSeatSelection);
  const [passengers, setPassengers] = useState<PassengerFormState[]>(() =>
    buildPassengersFromSeats(initialSeatSelection, locationState.passengers),
  );

  const [contact, setContact] = useState<ContactInfo>({
    phone: locationState.contact?.phone ?? '+84 912 345 678',
    email: locationState.contact?.email ?? 'contact@example.com',
  });
  const [reservedSeatIds, setReservedSeatIds] = useState<string[]>([]);
  const [isSyncingSeats, setIsSyncingSeats] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const seatCount = passengers.length;
  const guestMode = !isAuthenticated;

  const syncSeatLocks = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!routeName || !travelDateValue) {
        return;
      }
      if (!options?.silent) {
        setIsSyncingSeats(true);
      }
      try {
        const snapshot = await bookingsService.getSeatAvailability({
          route: routeName,
          travelDate: travelDateValue,
          busPlate,
          seatType,
        });
        if (!isMountedRef.current) {
          return;
        }
        setReservedSeatIds(snapshot.reservedSeatIds);
        setAvailabilityError(null);
        setLastSyncedAt(Date.now());
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }
        console.error(error);
        setAvailabilityError(
          language === 'vi'
            ? 'Không thể cập nhật trạng thái ghế. Vui lòng thử lại.'
            : 'Unable to update seat availability. Please try again.',
        );
      } finally {
        if (!options?.silent && isMountedRef.current) {
          setIsSyncingSeats(false);
        }
      }
    },
    [routeName, travelDateValue, busPlate, seatType, language],
  );

  useEffect(() => {
    if (!routeName || !travelDateValue) {
      return;
    }
    void syncSeatLocks();
    const intervalId = window.setInterval(() => {
      void syncSeatLocks({ silent: true });
    }, 15000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [routeName, travelDateValue, syncSeatLocks]);

  useEffect(() => {
    if (reservedSeatIds.length === 0) {
      return;
    }
    setSelectedSeats((prevSeats) => {
      const filtered = prevSeats.filter((seat) => !reservedSeatIds.includes(seat));
      if (filtered.length === prevSeats.length) {
        return prevSeats;
      }
      setPassengers((prev) => buildPassengersFromSeats(filtered, prev));
      showDialog({
        title: t('passengerForm.title'),
        description:
          language === 'vi'
            ? 'Một số ghế bạn chọn đã được giữ chỗ bởi người khác. Vui lòng chọn lại.'
            : 'Some seats you selected were just reserved. Please choose again.',
      });
      return filtered;
    });
  }, [reservedSeatIds, language, showDialog, t]);

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) {
      return language === 'vi' ? 'Đang lấy dữ liệu ghế...' : 'Fetching seat data...';
    }
    const formatted = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(lastSyncedAt));
    return language === 'vi' ? `Cập nhật lúc ${formatted}` : `Updated at ${formatted}`;
  }, [lastSyncedAt, language]);

  const formatDate = (value?: string) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      dateStyle: 'long',
    }).format(new Date(value));
  };

  const handlePassengerChange = (id: string, field: keyof PassengerFormState, value: string) => {
    setPassengers((prev) => prev.map((pax) => (pax.id === id ? { ...pax, [field]: value } : pax)));
  };

  const handleSeatSelectionChange = useCallback((seatIds: string[]) => {
    const normalized = sortSeats(seatIds);
    setSelectedSeats(normalized);
    setPassengers((prev) => buildPassengersFromSeats(normalized, prev));
  }, []);

  const handleRemovePassenger = (seatLabel: string) => {
    if (passengers.length === 1) return;
    handleSeatSelectionChange(selectedSeats.filter((seat) => seat !== seatLabel));
  };

  const validateForm = () => {
    if (passengers.length === 0) {
      return language === 'vi'
        ? 'Vui lòng chọn ít nhất một ghế.'
        : 'Please select at least one seat.';
    }
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        return t('passengerForm.validation.name');
      }
      if (!passenger.idNumber.trim()) {
        return t('passengerForm.validation.id');
      }
      if (!passenger.phone.trim()) {
        return t('passengerForm.validation.phone');
      }
    }
    if (!contact.phone.trim()) {
      return t('passengerForm.validation.phone');
    }
    return null;
  };

  const handleContinue = () => {
    const validationError = validateForm();
    if (validationError) {
      showDialog({ title: t('passengerForm.title'), description: validationError });
      return;
    }

    void navigate('/booking-review', {
      state: {
        passengers,
        contact,
        seatCount,
        travelDate: travelDateValue,
        route: routeName,
        terminal: locationState.terminal,
        company: locationState.company,
        arrival: locationState.arrival,
        seatType,
        busPlate,
        pricePerTicket: locationState.pricePerTicket,
      },
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {t('passengerForm.title')}
            </p>
            <h1 className="text-3xl font-semibold">{t('passengerForm.subtitle')}</h1>
          </div>
          <Badge variant="secondary" className="gap-1 text-base">
            <Users className="size-4" />
            {t('passengerForm.seatCountLabel')}: {seatCount}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-2">
            {guestMode && (
              <Alert className="border-dashed border-primary/40 bg-primary/5">
                <AlertTitle>
                  {language === 'vi' ? 'Thanh toán với tư cách khách' : 'Guest checkout active'}
                </AlertTitle>
                <AlertDescription className="flex flex-wrap items-center gap-3 text-sm">
                  <span>
                    {language === 'vi'
                      ? 'Đăng nhập để lưu thông tin hành khách và xem vé trong mục My Tickets.'
                      : 'Sign in to save passenger profiles and manage trips inside My Tickets.'}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate('/login')}
                  >
                    <LogIn className="size-3" />
                    {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Seat selection</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? `Chọn ${ticketLimit} ghế. Các ghế đã đặt sẽ hiển thị là không khả dụng.`
                    : `Choose ${ticketLimit} seats. Reserved seats appear unavailable.`}
                </CardDescription>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {isSyncingSeats ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    ) : (
                      <span
                        className="inline-flex size-2 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      ></span>
                    )}
                    <span>{lastSyncedLabel}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => syncSeatLocks()}
                    disabled={isSyncingSeats}
                  >
                    <RefreshCw className="size-3" />
                    {language === 'vi' ? 'Làm mới' : 'Refresh'}
                  </Button>
                </div>
                {availabilityError && (
                  <p className="text-xs font-medium text-destructive">{availabilityError}</p>
                )}
              </CardHeader>
              <CardContent>
                <SeatMap
                  selectedSeatIds={selectedSeats}
                  maxSelectable={ticketLimit}
                  onSelectionChange={handleSeatSelectionChange}
                  reservedSeatIds={reservedSeatIds}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('passengerForm.contactDetails')}</CardTitle>
                <CardDescription>
                  {language === 'vi'
                    ? 'Chúng tôi sẽ dùng thông tin này để gửi vé điện tử và thông báo thay đổi.'
                    : 'We will use this contact to send e-tickets and updates.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">{t('passengerForm.phone')}</Label>
                  <Input
                    id="contact-phone"
                    value={contact.phone}
                    onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t('passengerForm.email')}</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <Card key={passenger.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t('passengerForm.passengerCard')} #{index + 1}
                      </CardTitle>
                      <CardDescription>
                        {t('passengerForm.seatLabel')} {passenger.seatLabel}
                      </CardDescription>
                    </div>
                    {passengers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePassenger(passenger.seatLabel)}
                        aria-label={t('passengerForm.removePassenger')}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${passenger.id}`}>
                          {t('passengerForm.fullName')}
                        </Label>
                        <Input
                          id={`name-${passenger.id}`}
                          value={passenger.name}
                          onChange={(e) =>
                            handlePassengerChange(passenger.id, 'name', e.target.value)
                          }
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`id-${passenger.id}`}>{t('passengerForm.idNumber')}</Label>
                        <Input
                          id={`id-${passenger.id}`}
                          value={passenger.idNumber}
                          onChange={(e) =>
                            handlePassengerChange(passenger.id, 'idNumber', e.target.value)
                          }
                          placeholder="012345678"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${passenger.id}`}>{t('passengerForm.phone')}</Label>
                        <Input
                          id={`phone-${passenger.id}`}
                          value={passenger.phone}
                          onChange={(e) =>
                            handlePassengerChange(passenger.id, 'phone', e.target.value)
                          }
                          placeholder="+84 xxx xxx xxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-${passenger.id}`}>{t('passengerForm.email')}</Label>
                        <Input
                          id={`email-${passenger.id}`}
                          type="email"
                          value={passenger.email}
                          onChange={(e) =>
                            handlePassengerChange(passenger.id, 'email', e.target.value)
                          }
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('bookingReview.tripSummary')}</CardTitle>
                <CardDescription>{routeName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>{locationState.terminal ?? 'Bến xe Mỹ Đình · Gate G5'}</span>
                </div>
                <Separator />
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Departure</div>
                  <div className="font-semibold">{formatDate(travelDateValue)}</div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  <span className="font-semibold">{contact.phone}</span>
                </div>
                <Separator />
                <div className="text-muted-foreground text-xs">
                  {language === 'vi'
                    ? 'Thông tin hành khách có thể được kiểm tra khi lên xe. Hãy đảm bảo chính xác.'
                    : 'Passenger IDs may be verified at boarding. Please ensure accuracy.'}
                </div>
                <Button className="w-full" size="lg" onClick={handleContinue}>
                  {t('passengerForm.continueCta')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {dialog}
    </Layout>
  );
}
