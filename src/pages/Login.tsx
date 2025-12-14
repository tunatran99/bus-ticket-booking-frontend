import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Bus, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { startGoogleLoginPopup } from '../services/googleAuth';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';
import { getErrorMessage } from '../services/error';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showDialog, dialog } = useFeedbackDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic custom validation before hitting the API
    if (!email.trim() || !password.trim()) {
      setError(t('loginPage.errors.requiredFields'));
      return;
    }

    // Optional: simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('loginPage.errors.invalidEmail'));
      return;
    }

    if (password.length < 8) {
      setError(t('loginPage.errors.passwordTooShort'));
      return;
    }

    try {
      await login(email, password);
      await navigate('/');
    } catch (error) {
      const message = getErrorMessage(error, t('loginPage.errors.invalidCredentials'));
      showDialog({ title: t('auth.login'), description: message });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await startGoogleLoginPopup();
      await login('', '', true);
      await navigate('/');
    } catch (error) {
      const message = getErrorMessage(error, t('loginPage.errors.invalidCredentials'));
      showDialog({ title: t('loginPage.googleButton'), description: message });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Bus className="size-8 text-primary" />
            <span className="text-2xl">BusTicket</span>
          </Link>

          <div className="mb-8">
            <h1 className="mb-2">{t('auth.login')}</h1>
            <p className="text-muted-foreground">{t('loginPage.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-muted-foreground hover:text-foreground z-20"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded border-input" />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg">
              {t('auth.loginButton')}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('loginPage.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-6">
              <Button variant="outline" type="button" onClick={handleGoogleLogin}>
                <svg className="size-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('loginPage.googleButton')}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/signup" className="text-primary hover:underline">
              {t('auth.signup')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative bg-muted">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1759882608768-168d4c3a91c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXMlMjB0cmF2ZWwlMjBqb3VybmV5fGVufDF8fHx8MTc2Mzg4MzgwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Bus travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="mb-4">Travel Comfortably Across Vietnam</h2>
          <p className="text-white/90 max-w-md">
            Book your bus tickets easily and enjoy safe, comfortable journeys to your destination.
          </p>
        </div>
      </div>
      {dialog}
    </div>
  );
}
