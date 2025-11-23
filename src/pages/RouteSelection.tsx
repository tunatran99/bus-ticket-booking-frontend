import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, MapPin, DollarSign, Users } from 'lucide-react';

interface RouteData {
  id: string;
  company: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  busType: string;
}

export function RouteSelection() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { startProvince, destinationProvince, travelDate, numberOfTickets } = location.state || {};

  // Mock route data
  const routes: RouteData[] = [
    {
      id: '1',
      company: 'Express Bus Lines',
      departureTime: '06:00',
      arrivalTime: '12:00',
      duration: '6h 0m',
      price: 250000,
      seatsAvailable: 15,
      busType: 'VIP Sleeper'
    },
    {
      id: '2',
      company: 'Golden Dragon',
      departureTime: '08:30',
      arrivalTime: '14:45',
      duration: '6h 15m',
      price: 220000,
      seatsAvailable: 8,
      busType: 'Premium'
    },
    {
      id: '3',
      company: 'Vietnam Travel Bus',
      departureTime: '11:00',
      arrivalTime: '17:30',
      duration: '6h 30m',
      price: 200000,
      seatsAvailable: 22,
      busType: 'Standard'
    },
    {
      id: '4',
      company: 'Luxury Coach',
      departureTime: '14:00',
      arrivalTime: '20:15',
      duration: '6h 15m',
      price: 280000,
      seatsAvailable: 5,
      busType: 'VIP Sleeper'
    },
    {
      id: '5',
      company: 'Express Bus Lines',
      departureTime: '18:30',
      arrivalTime: '00:45',
      duration: '6h 15m',
      price: 240000,
      seatsAvailable: 12,
      busType: 'Premium'
    },
    {
      id: '6',
      company: 'Night Express',
      departureTime: '22:00',
      arrivalTime: '04:30',
      duration: '6h 30m',
      price: 230000,
      seatsAvailable: 18,
      busType: 'Sleeper'
    }
  ];

  if (!startProvince || !destinationProvince) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4">No search criteria provided</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              {t('routes.title')}
            </CardTitle>
            <CardDescription>
              {startProvince} → {destinationProvince} | {new Date(travelDate).toLocaleDateString()} | {numberOfTickets} {t('common.tickets')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Routes List */}
        <div className="space-y-4">
          {routes.map((route) => (
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
                        <div className="text-muted-foreground text-sm">{t('routes.departure')}</div>
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
                      <span>{route.seatsAvailable} {t('routes.seatsAvailable')}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="md:col-span-2">
                    <Button 
                      className="w-full"
                      disabled={route.seatsAvailable < parseInt(numberOfTickets)}
                    >
                      {t('routes.bookNow')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
