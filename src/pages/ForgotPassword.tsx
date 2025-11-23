import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Bus, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password reset - in real app, this would call an API
    setTimeout(() => {
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Logo and Back Button */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Bus className="size-8 text-primary" />
              <span className="text-2xl">BusTicket</span>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Login
              </Button>
            </Link>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="mb-2">{t('auth.forgotPassword')}</h1>
                <p className="text-muted-foreground">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              {/* Forgot Password Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6">
                <Link to="/login">
                  <Button variant="link" className="w-full">
                    Remember your password? Sign in
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <CheckCircle2 className="size-8 text-primary" />
                </div>
                <h1 className="mb-2">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to
                </p>
                <p className="text-muted-foreground mt-1">{email}</p>
              </div>

              <Alert className="mb-6">
                <Mail className="size-4" />
                <AlertDescription>
                  Didn't receive the email? Check your spam folder or try another email address.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try Another Email
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full gap-2">
                    <ArrowLeft className="size-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> The password reset link will expire in 24 hours. If you don't see the email, please contact support.
                </p>
              </div>
            </>
          )}
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
          <h2 className="mb-4">Secure Account Recovery</h2>
          <p className="text-white/90 max-w-md">
            Your account security is our priority. We'll help you regain access safely and quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
