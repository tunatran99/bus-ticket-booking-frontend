import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Calendar, Clock, MapPin, User as UserIcon, Users } from 'lucide-react';
import apiClient from '../services/api';

type ApiResponse<T> = {
  data: T;
};

type DashboardMePayload = {
  metrics: DashboardMetrics;
  recentTrips: TripItem[];
  user?: {
    role?: string;
  } | null;
};

interface AdminAnalytics {
  revenue: {
    total: number;
    pending: number;
    last30Days: number;
  };
  conversionRate: number;
  dailyTrend: Array<{ date: string; revenue: number; tickets: number }>;
  routeLeaderboard: Array<{ route: string; seats: number; revenue: number }>;
  recentBookings: Array<{
    bookingReference: string;
    route: string;
    status: string;
    total: number;
    updatedAt: string;
  }>;
  statusBreakdown: Array<{ status: string; count: number }>;
}

type DashboardAdminPayload = {
  metrics: AdminMetrics;
  recentUsers: RecentUserItem[];
  analytics?: AdminAnalytics;
};

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

const MetricTile = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-foreground">{value}</p>
    {helper && <p className="text-xs text-muted-foreground mt-1">{helper}</p>}
  </div>
);

const ConversionGauge = ({
  value,
  label,
  helper,
}: {
  value: number;
  label: string;
  helper?: string;
}) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percent = (clamped * 100).toFixed(1);
  const degrees = clamped * 360;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm flex items-center gap-6">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#2563eb ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`,
          }}
        />
        <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-foreground">{percent}%</span>
          <span className="text-[11px] font-medium text-muted-foreground">conversion</span>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <p className="text-base font-semibold text-foreground mt-1">{percent}%</p>
        {helper && <p className="text-sm text-muted-foreground mt-1">{helper}</p>}
      </div>
    </div>
  );
};

const RevenueTrendChart = ({
  data,
  formatPrice,
}: {
  data: AdminAnalytics['dailyTrend'];
  formatPrice: (value: number) => string;
}) => {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No revenue yet.</p>;
  }

  const width = 640;
  const height = 160;
  const maxValue = Math.max(...data.map((entry) => entry.revenue), 1);
  const steps = data.length > 1 ? data.length - 1 : 1;
  const pointTuples = data.map((entry, index) => {
    const x = (index / steps) * width;
    const y = height - (entry.revenue / maxValue) * height;
    return { x, y: Number.isFinite(y) ? y : height, label: entry.date, revenue: entry.revenue };
  });
  const points = pointTuples.map((tuple) => `${tuple.x},${tuple.y}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const totalRevenue = data.reduce((sum, entry) => sum + entry.revenue, 0);
  const avgRevenue = totalRevenue / data.length;
  const maxEntry = pointTuples.reduce((prev, current) =>
    current.revenue > prev.revenue ? current : prev,
  );
  const minEntry = pointTuples.reduce((prev, current) =>
    current.revenue < prev.revenue ? current : prev,
  );

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#revenueGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke="#2563eb"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pointTuples.map((tuple) => (
          <circle key={tuple.label} cx={tuple.x} cy={tuple.y} r={4} fill="#2563eb" />
        ))}
      </svg>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs text-muted-foreground">
        <div>
          <p className="uppercase tracking-[0.3em] text-slate-400">Peak</p>
          <p className="font-semibold text-foreground">
            {new Date(maxEntry.label).toLocaleDateString()} · {formatPrice(maxEntry.revenue)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-slate-400">Slowest</p>
          <p className="font-semibold text-foreground">
            {new Date(minEntry.label).toLocaleDateString()} · {formatPrice(minEntry.revenue)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-slate-400">Average</p>
          <p className="font-semibold text-foreground">{formatPrice(avgRevenue)}</p>
        </div>
        <div>
          <p className="uppercase tracking-[0.3em] text-slate-400">Total</p>
          <p className="font-semibold text-foreground">{formatPrice(totalRevenue)}</p>
        </div>
      </div>
    </div>
  );
};

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const meRes = await apiClient.get<ApiResponse<DashboardMePayload>>('/dashboard/me');
        const meData = meRes.data?.data;
        setMetrics(meData?.metrics ?? null);
        setTrips(meData?.recentTrips ?? []);

        // If the current user is admin, load admin dashboard metrics as well
        if (meData?.user?.role === 'admin') {
          const adminRes =
            await apiClient.get<ApiResponse<DashboardAdminPayload>>('/dashboard/admin');
          const adminData = adminRes.data?.data;
          setAdminMetrics(adminData?.metrics ?? null);
          setRecentUsers(adminData?.recentUsers ?? []);
          setAdminAnalytics(adminData?.analytics ?? null);
        } else {
          setAdminMetrics(null);
          setRecentUsers([]);
          setAdminAnalytics(null);
        }
      } catch (error) {
        // If anything fails, send user back to login so they can re-authenticate
        void navigate('/login');
      }
    };

    void loadData();
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

  const statusColorMap: Record<string, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-emerald-500',
    cancelled: 'bg-rose-500',
    expired: 'bg-slate-400',
  };

  const formatPercent = (value: number) =>
    `${Number.isFinite(value) ? (value * 100).toFixed(1) : '0.0'}%`;

  const totalStatusCount =
    adminAnalytics?.statusBreakdown?.reduce((sum, entry) => sum + entry.count, 0) ?? 0;

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
              <CardDescription>
                {t('dashboard.totalTicketsDesc') || 'All tickets you have booked'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.totalTickets ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.upcomingTrips') || 'Upcoming Trips'}</CardTitle>
              <CardDescription>
                {t('dashboard.upcomingTripsDesc') || 'Trips scheduled in the future'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.upcomingTrips ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.completedTrips') || 'Completed Trips'}</CardTitle>
              <CardDescription>
                {t('dashboard.completedTripsDesc') || 'Trips you have already taken'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics?.completedTrips ?? '-'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.cancelledTrips') || 'Cancelled Trips'}</CardTitle>
              <CardDescription>
                {t('dashboard.cancelledTripsDesc') || 'Trips you cancelled'}
              </CardDescription>
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
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.adminOverview') || 'Admin Overview'}</CardTitle>
                  <CardDescription>
                    {t('dashboard.adminOverviewDesc') || 'High-level overview of the user base.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                        <div className="text-2xl font-bold">{adminMetrics.totalUsers}</div>
                      </div>
                      <Users className="size-6 text-primary" />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/80 flex items-center justify-between">
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
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>

              {adminAnalytics && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue snapshot</CardTitle>
                      <CardDescription>Includes confirmed bookings only.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricTile
                          label="Total revenue"
                          value={formatPrice(adminAnalytics.revenue.total)}
                          helper="Lifetime confirmed bookings"
                        />
                        <MetricTile
                          label="Pending"
                          value={formatPrice(adminAnalytics.revenue.pending)}
                          helper="Awaiting payment completion"
                        />
                        <MetricTile
                          label="Last 30 days"
                          value={formatPrice(adminAnalytics.revenue.last30Days)}
                          helper="Rolling revenue window"
                        />
                        <MetricTile
                          label="Avg conversion"
                          value={formatPercent(adminAnalytics.conversionRate)}
                          helper="Bookings that became paid"
                        />
                      </div>
                      <ConversionGauge
                        value={adminAnalytics.conversionRate}
                        label="Checkout conversion"
                        helper="Share of booking attempts that turned into paid trips."
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly revenue trend</CardTitle>
                      <CardDescription>
                        Tickets confirmed across the last seven departures.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RevenueTrendChart
                        data={adminAnalytics.dailyTrend ?? []}
                        formatPrice={formatPrice}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Routes & pipeline</CardTitle>
                      <CardDescription>
                        Monitor corridor performance and booking health.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Top routes
                          </h4>
                          {adminAnalytics.routeLeaderboard.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No routes yet.</p>
                          ) : (
                            <ul className="space-y-3">
                              {adminAnalytics.routeLeaderboard.map((route) => (
                                <li
                                  key={route.route}
                                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                  <div>
                                    <p className="font-medium">{route.route}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {route.seats} seats confirmed
                                    </p>
                                  </div>
                                  <span className="font-semibold text-primary">
                                    {formatPrice(route.revenue)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Status breakdown
                          </h4>
                          {adminAnalytics.statusBreakdown.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No bookings yet.</p>
                          ) : (
                            adminAnalytics.statusBreakdown.map((item) => {
                              const width =
                                totalStatusCount > 0 ? (item.count / totalStatusCount) * 100 : 0;
                              return (
                                <div key={item.status} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="capitalize">{item.status}</span>
                                    <span>{item.count}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full ${statusColorMap[item.status] ?? 'bg-slate-300'}`}
                                      style={{ width: `${width}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <Separator />
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Recent bookings
                          </h4>
                          {adminAnalytics.recentBookings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No bookings just yet.</p>
                          ) : (
                            <ul className="space-y-2 text-sm">
                              {adminAnalytics.recentBookings.map((booking) => (
                                <li
                                  key={booking.bookingReference}
                                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                  <div>
                                    <p className="font-mono text-xs">{booking.bookingReference}</p>
                                    <p className="text-muted-foreground">{booking.route}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge
                                      variant={getStatusVariant(booking.status)}
                                      className="mb-1 capitalize"
                                    >
                                      {booking.status}
                                    </Badge>
                                    <div className="text-sm font-semibold text-primary">
                                      {formatPrice(booking.total)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(booking.updatedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
