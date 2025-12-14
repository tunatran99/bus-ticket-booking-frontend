import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Shield, Award, Users, TrendingUp } from 'lucide-react';

export function About() {
  const { t } = useLanguage();

  const stats = [
    { label: t('about.statsYears'), value: '15+' },
    { label: t('about.statsRoutes'), value: '500+' },
    { label: t('about.statsCustomers'), value: '1M+' },
    { label: t('about.statsDepartures'), value: '2000+' },
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.values.safetyTitle'),
      description: t('about.values.safetyDesc'),
    },
    {
      icon: Award,
      title: t('about.values.qualityTitle'),
      description: t('about.values.qualityDesc'),
    },
    {
      icon: Users,
      title: t('about.values.customerTitle'),
      description: t('about.values.customerDesc'),
    },
    {
      icon: TrendingUp,
      title: t('about.values.innovationTitle'),
      description: t('about.values.innovationDesc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">{t('about.badge')}</Badge>
            <h1 className="mb-6">{t('nav.about')}</h1>
            <p className="text-lg text-muted-foreground">{t('about.heroSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-primary mb-2">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="mb-6">{t('about.storyTitle')}</h2>
              <div className="space-y-4 text-muted-foreground">
                {/* Story body can be localized later if needed */}
              </div>
            </div>
            <div className="order-first lg:order-last">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjM3OTI5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Our team"
                className="rounded-lg shadow-lg w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t('about.valuesTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('about.valuesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="mb-4">
                      <div className="inline-flex p-3 bg-primary/10 rounded-lg">
                        <Icon className="size-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="mb-6">{t('about.missionTitle')}</h2>
                  <p className="text-lg text-muted-foreground mb-8">{t('about.missionText')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div>
                      <h3 className="mb-2">{t('about.missionAccessibilityTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('about.missionAccessibilityText')}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2">{t('about.missionReliabilityTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('about.missionReliabilityText')}
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2">{t('about.missionExcellenceTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('about.missionExcellenceText')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
