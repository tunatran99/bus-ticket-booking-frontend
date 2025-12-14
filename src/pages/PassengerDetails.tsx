import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Users, MapPin, Plus, Trash2, Phone } from 'lucide-react';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import type { ContactInfo, PassengerFormState, PassengerRouteState } from '../types/passenger';

const createPassenger = (seatLabel: string): PassengerFormState => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  seatLabel,
});

export function PassengerDetails() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: PassengerRouteState = (location.state as PassengerRouteState) ?? {};
  const { showDialog, dialog } = useFeedbackDialog();

  const initialSeatCount = locationState.passengers?.length ?? locationState.seatCount ?? 2;
  const seatLabels = useMemo(() => {
    return Array.from(
      { length: initialSeatCount },
      (_, index) => `1${String.fromCharCode(65 + index)}`,
    );
  }, [initialSeatCount]);

  const [passengers, setPassengers] = useState<PassengerFormState[]>(() => {
    if (locationState.passengers && locationState.passengers.length > 0) {
      return locationState.passengers.map((passenger, index) => ({
        ...passenger,
        id: passenger.id || `${passenger.seatLabel ?? 'PAX'}-${index}`,
      }));
    }
    return seatLabels.map((label) => createPassenger(label));
  });

  const [contact, setContact] = useState<ContactInfo>({
    phone: locationState.contact?.phone ?? '+84 912 345 678',
    email: locationState.contact?.email ?? 'contact@example.com',
  });

  const seatCount = passengers.length;

  const formatDate = (value?: string) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      dateStyle: 'long',
    }).format(new Date(value));
  };

  const handlePassengerChange = (id: string, field: keyof PassengerFormState, value: string) => {
    setPassengers((prev) => prev.map((pax) => (pax.id === id ? { ...pax, [field]: value } : pax)));
  };

  const handleAddPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      createPassenger(`2${String.fromCharCode(65 + prev.length)}`),
    ]);
  };

  const handleRemovePassenger = (id: string) => {
    if (passengers.length === 1) return;
    setPassengers((prev) => prev.filter((pax) => pax.id !== id));
  };

  const validateForm = () => {
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
        travelDate: locationState.travelDate ?? new Date().toISOString(),
        route: locationState.route ?? 'Hà Nội → Đà Nẵng',
        terminal: locationState.terminal,
        company: locationState.company,
        arrival: locationState.arrival,
        seatType: locationState.seatType,
        busPlate: locationState.busPlate,
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
                        onClick={() => handleRemovePassenger(passenger.id)}
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

            <Button variant="outline" className="gap-2" onClick={handleAddPassenger}>
              <Plus className="size-4" />
              {t('passengerForm.addPassenger')}
            </Button>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('bookingReview.tripSummary')}</CardTitle>
                <CardDescription>{locationState.route ?? 'Hà Nội → Đà Nẵng'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>{locationState.terminal ?? 'Bến xe Mỹ Đình · Gate G5'}</span>
                </div>
                <Separator />
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Departure</div>
                  <div className="font-semibold">
                    {formatDate(locationState.travelDate ?? new Date().toISOString())}
                  </div>
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
