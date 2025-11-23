import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function MyTickets() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('nav.myTickets')}</CardTitle>
            <CardDescription>View and manage your booked tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              This page is under development
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
