import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Mail, Phone } from 'lucide-react';

export function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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
                      {user?.name?.charAt(0).toUpperCase() ??
                        user?.email?.charAt(0).toUpperCase() ??
                        '?'}
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
                <CardDescription>{t('profilePage.bookingSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('ticketsPage.underDevelopment')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/route-selection')}
                  >
                    {t('home.searchRoutes')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
