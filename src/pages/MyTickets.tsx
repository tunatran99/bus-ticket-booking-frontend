import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ETicketTemplate } from '../components/tickets/ETicketTemplate';

export function MyTickets() {
  const { t } = useLanguage();
  const sampleTicket = {
    bookingReference: 'BT251207-9XPQZL',
    issuedBy: 'BusTicket.vn',
    passenger: {
      name: 'Nguyễn Minh Anh',
      id: 'VN-9283',
    },
    seat: {
      label: '12A',
      type: 'Sleeper',
      coach: 'Coach 2',
    },
    route: {
      origin: 'Hà Nội (My Đình)',
      destination: 'Đà Nẵng (Trung Tâm)',
    },
    bus: {
      name: 'Premium Sleeper Express',
      plate: '30F-123.45',
    },
    departure: {
      city: 'Hà Nội',
      terminal: 'My Đình Station - Platform 5',
      time: '2025-12-20T20:30:00+07:00',
      gate: 'G5',
      boardingTime: '20:10',
    },
    arrival: {
      city: 'Đà Nẵng',
      terminal: 'Danang Central Station',
      time: '2025-12-21T06:30:00+07:00',
    },
    supportContact: '1900 868 686',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('nav.myTickets')}</CardTitle>
            <CardDescription>{t('ticketsPage.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('ticketsPage.underDevelopment')}
            </p>
            <ETicketTemplate
              ticket={sampleTicket}
              onDownload={() => console.log('Download ticket coming soon')}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
