import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User, Mail, Phone, Calendar, MapPin, Clock } from 'lucide-react';

export function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Mock booking history
  const bookings = [
    {
      id: '1',
      from: 'Hà Nội',
      to: 'Hồ Chí Minh',
      date: '2025-11-25',
      time: '08:00',
      status: 'upcoming',
      seats: 2,
      price: 500000
    },
    {
      id: '2',
      from: 'Đà Nẵng',
      to: 'Hội An',
      date: '2025-11-20',
      time: '14:30',
      status: 'completed',
      seats: 1,
      price: 150000
    },
    {
      id: '3',
      from: 'Hồ Chí Minh',
      to: 'Vũng Tàu',
      date: '2025-11-15',
      time: '10:00',
      status: 'completed',
      seats: 3,
      price: 450000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8">{t('profile.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="size-24 mb-4">
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{user?.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="size-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="size-4" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  {t('profile.edit')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.bookingHistory')}</CardTitle>
                <CardDescription>Your recent bus ticket bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="size-4 text-primary" />
                              <span>{booking.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span>{booking.to}</span>
                              <Badge variant={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(booking.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {booking.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="size-3" />
                                {booking.seats} {t('common.tickets')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-primary mb-2">
                              {formatPrice(booking.price)}
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
