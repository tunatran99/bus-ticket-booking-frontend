import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Bus, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';

export function Navigation() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      void navigate('/profile');
    } else {
      void navigate('/login');
    }
    setOpen(false);
  };

  const handleLogout = () => {
    void logout();
    void navigate('/');
    setOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/my-tickets', label: t('nav.myTickets') },
    { to: '/guest-booking', label: t('nav.guestLookup') },
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
                {user?.role === 'admin' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">{t('admin.common.users')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/routes">{t('admin.common.routes')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/buses">{t('admin.common.buses')}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/trips">{t('admin.common.trips')}</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button onClick={handleAuthClick} variant="ghost" className="gap-2">
                  <User className="size-4" />
                  {user?.name}
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="icon">
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthClick}>{t('auth.login')}</Button>
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
                  {isAuthenticated && user?.role === 'admin' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        {t('admin.common.admin')}
                      </div>
                      <Link
                        to="/admin/users"
                        onClick={() => setOpen(false)}
                        className="block text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
                      >
                        {t('admin.common.users')}
                      </Link>
                      <Link
                        to="/admin/routes"
                        onClick={() => setOpen(false)}
                        className="block text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
                      >
                        {t('admin.common.routes')}
                      </Link>
                      <Link
                        to="/admin/buses"
                        onClick={() => setOpen(false)}
                        className="block text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
                      >
                        {t('admin.common.buses')}
                      </Link>
                      <Link
                        to="/admin/trips"
                        onClick={() => setOpen(false)}
                        className="block text-muted-foreground hover:text-foreground transition-colors py-2 px-2"
                      >
                        {t('admin.common.trips')}
                      </Link>
                    </div>
                  )}
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
