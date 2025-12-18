import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Mail, Phone } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  notificationsService,
  type NotificationPreferences,
} from '../services/notifications.service';
import { getErrorMessage } from '../services/error';

export function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [prefLoading, setPrefLoading] = useState<boolean>(false);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [reminderInput, setReminderInput] = useState<string>('24');

  const syncPreferences = async (
    updates: Partial<Pick<NotificationPreferences, 'emailEnabled' | 'smsEnabled'>> & {
      reminderHoursBefore?: number;
    },
  ) => {
    setIsSavingPrefs(true);
    setPrefError(null);
    try {
      const updated = await notificationsService.updatePreferences(updates);
      setPreferences(updated);
      setReminderInput(String(updated.reminderHoursBefore));
    } catch (error) {
      setPrefError(getErrorMessage(error, 'Unable to save your notification preferences.'));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleTogglePreference = async (field: 'emailEnabled' | 'smsEnabled', value: boolean) => {
    await syncPreferences({ [field]: value });
  };

  const handleReminderSubmit = async () => {
    const parsed = Number(reminderInput);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 72) {
      setPrefError('Reminder window must be between 1 and 72 hours.');
      return;
    }
    if (parsed === preferences?.reminderHoursBefore) {
      return;
    }
    await syncPreferences({ reminderHoursBefore: parsed });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const loadPreferences = async () => {
      setPrefLoading(true);
      setPrefError(null);
      try {
        const data = await notificationsService.getPreferences();
        setPreferences(data);
        setReminderInput(String(data.reminderHoursBefore));
      } catch (error) {
        setPrefError(getErrorMessage(error, 'Unable to load notification preferences right now.'));
      } finally {
        setPrefLoading(false);
      }
    };
    void loadPreferences();
  }, [isAuthenticated]);

  const reminderDirty = preferences
    ? Number(reminderInput) !== preferences.reminderHoursBefore
    : false;

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

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose how we send confirmations and reminders.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {prefError && (
                  <Alert variant="destructive">
                    <AlertTitle>Update failed</AlertTitle>
                    <AlertDescription>{prefError}</AlertDescription>
                  </Alert>
                )}

                {prefLoading && !preferences ? (
                  <p className="text-sm text-muted-foreground">Loading your preferences…</p>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div>
                        <p className="font-medium">Email updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive booking confirmations and digital receipts.
                        </p>
                      </div>
                      <Switch
                        checked={preferences?.emailEnabled ?? true}
                        disabled={isSavingPrefs}
                        onCheckedChange={(checked) =>
                          handleTogglePreference('emailEnabled', checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2">
                      <div>
                        <p className="font-medium">SMS notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get time-sensitive alerts directly to your phone.
                        </p>
                      </div>
                      <Switch
                        checked={preferences?.smsEnabled ?? false}
                        disabled={isSavingPrefs}
                        onCheckedChange={(checked) => handleTogglePreference('smsEnabled', checked)}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">Reminder window</p>
                      <p className="text-sm text-muted-foreground">
                        We will nudge you before departure. Choose how many hours in advance.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          type="number"
                          min={1}
                          max={72}
                          value={reminderInput}
                          disabled={isSavingPrefs}
                          onChange={(event) => setReminderInput(event.target.value)}
                        />
                        <Button
                          variant="secondary"
                          disabled={isSavingPrefs || !reminderDirty}
                          onClick={handleReminderSubmit}
                        >
                          Save window
                        </Button>
                      </div>
                    </div>
                    {preferences && (
                      <p className="text-xs text-muted-foreground">
                        Last updated {new Date(preferences.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
