import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Bus, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/my-tickets', label: t('nav.myTickets') },
    { to: '/routes', label: t('nav.routes') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Bus className="size-6" />
            <span>BusTicket</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Button onClick={handleAuthClick} variant="ghost" className="gap-2">
                  <User className="size-4" />
                  {user?.name}
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="icon">
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthClick}>
                {t('auth.login')}
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    {isAuthenticated ? (
                      <>
                        <Button
                          onClick={handleAuthClick}
                          variant="ghost"
                          className="w-full justify-start gap-2 mb-2"
                        >
                          <User className="size-4" />
                          {user?.name}
                        </Button>
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <LogOut className="size-4" />
                          {t('auth.logout')}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleAuthClick} className="w-full">
                        {t('auth.login')}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
