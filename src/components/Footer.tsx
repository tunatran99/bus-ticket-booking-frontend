import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/routes', label: t('nav.routes') },
    { to: '/my-tickets', label: t('nav.myTickets') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  const supportLinks = [
    { to: '/help', label: t('footer.supportLinks.bookingGuide') },
    { to: '/faq', label: t('footer.supportLinks.paymentOptions') },
    { to: '/terms', label: t('footer.supportLinks.ticketPolicies') },
    { to: '/contact', label: t('footer.supportLinks.customerCare') },
    { to: '/travel-updates', label: t('footer.supportLinks.travelAlerts') },
  ];

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Bus className="size-6 text-primary" />
              <span className="font-semibold">BusTicket</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">{t('home.subtitle')}</p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">{t('footer.quickLinksTitle')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4">{t('footer.supportTitle')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {supportLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 mt-0.5 flex-shrink-0" />
                <span>{t('footer.contact.address')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 flex-shrink-0" />
                <a href="tel:1900123456" className="hover:text-primary transition-colors">
                  1900 123 456
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 flex-shrink-0" />
                <a
                  href="mailto:support@busticket.com"
                  className="hover:text-primary transition-colors"
                >
                  support@busticket.com
                </a>
              </li>
            </ul>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{t('home.support247')}</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BusTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
