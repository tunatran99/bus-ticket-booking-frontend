import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Calendar, Clock, MapPin, User as UserIcon, Users } from 'lucide-react';
import apiClient from '../services/api';

interface DashboardMetrics {
  totalTickets: number;
  upcomingTrips: number;
  completedTrips: number;
  cancelledTrips: number;
}

interface TripItem {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: string;
  seats: number;
  price: number;
}

interface AdminMetrics {
  totalUsers: number;
  totalAdmins: number;
}

interface RecentUserItem {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const meRes = await apiClient.get('/dashboard/me');
        const meData = meRes.data.data;
        setMetrics(meData.metrics);
        setTrips(meData.recentTrips);

        // If the current user is admin, load admin dashboard metrics as well
        if (meData.user?.role === 'admin') {
          const adminRes = await apiClient.get('/dashboard/admin');
          const adminData = adminRes.data.data;
          setAdminMetrics(adminData.metrics);
          setRecentUsers(adminData.recentUsers);
        }
      } catch (error) {
        // If anything fails, send user back to login so they can re-authenticate
        navigate('/login');
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'default' as const;
      case 'completed':
        return 'secondary' as const;
      case 'cancelled':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2">{t('dashboard.title') || 'Dashboard'}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle') || 'Overview of your trips and account activity.'}
            </p>
          </div>
          {user && (
            <div className="text-right text-sm text-muted-foreground">
              <div>{user.name}</div>
              <div>{user.email}</div>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.totalTickets') || 'Total Tickets'}</CardTitle>
              <CardDescription>{t('dashboard.totalTicketsDesc') || 'All tickets you have booked'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.totalTickets ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.upcomingTrips') || 'Upcoming Trips'}</CardTitle>
              <CardDescription>{t('dashboard.upcomingTripsDesc') || 'Trips scheduled in the future'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.upcomingTrips ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.completedTrips') || 'Completed Trips'}</CardTitle>
              <CardDescription>{t('dashboard.completedTripsDesc') || 'Trips you have already taken'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.completedTrips ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cancelledTrips') || 'Cancelled Trips'}</CardTitle>
              <CardDescription>{t('dashboard.cancelledTripsDesc') || 'Trips you cancelled'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.cancelledTrips ?? '-'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent trips list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentTrips') || 'Recent Trips'}</CardTitle>
              <CardDescription>
                {t('dashboard.recentTripsDesc') || 'Your most recent bookings and their status.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trips.length === 0 ? (
                <p className="text-muted-foreground text-sm">No trips to display yet.</p>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <Card key={trip.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="size-4 text-primary" />
                              <span>{trip.from}</span>
                              <span className="text-muted-foreground">→</span>
                              <span>{trip.to}</span>
                              <Badge variant={getStatusVariant(trip.status)}>{trip.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {new Date(trip.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {trip.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <UserIcon className="size-3" />
                                {trip.seats} {t('common.tickets')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-primary mb-2">{formatPrice(trip.price)}</div>
                            <Button variant="outline" size="sm">
                              {t('dashboard.viewDetails') || 'View Details'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin-only widgets */}
          {adminMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.adminOverview') || 'Admin Overview'}</CardTitle>
                <CardDescription>
                  {t('dashboard.adminOverviewDesc') || 'High-level overview of the user base.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                      <div className="text-2xl font-bold">{adminMetrics.totalUsers}</div>
                    </div>
                    <Users className="size-6 text-primary" />
                  </div>
                  <div className="p-4 rounded-lg bg-muted flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Admin Users</div>
                      <div className="text-2xl font-bold">{adminMetrics.totalAdmins}</div>
                    </div>
                    <UserIcon className="size-6 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Recent Users</div>
                  {recentUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {recentUsers.map((u) => (
                        <li
                          key={u.userId}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div>
                            <div className="font-medium">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
