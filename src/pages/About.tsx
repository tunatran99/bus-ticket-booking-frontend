import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Shield, Award, Users, TrendingUp } from 'lucide-react';

export function About() {
  const { t } = useLanguage();

  const stats = [
    { label: 'Years in Business', value: '15+' },
    { label: 'Routes Available', value: '500+' },
    { label: 'Happy Customers', value: '1M+' },
    { label: 'Daily Departures', value: '2000+' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Your safety is our top priority. All our buses are regularly maintained and our drivers are professionally trained.'
    },
    {
      icon: Award,
      title: 'Quality Service',
      description: 'We strive to provide the best travel experience with comfortable buses and excellent customer service.'
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Our customers are at the heart of everything we do. We listen to feedback and continuously improve.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We embrace technology to make booking and traveling easier, faster, and more convenient.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">About Us</Badge>
            <h1 className="mb-6">{t('nav.about')}</h1>
            <p className="text-lg text-muted-foreground">
              Leading the way in comfortable and reliable bus transportation across Vietnam since 2010.
            </p>
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
              <h2 className="mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2010, BusTicket started with a simple mission: to make bus travel across Vietnam 
                  safe, comfortable, and accessible to everyone. What began as a small operation with just 5 buses 
                  has grown into one of Vietnam's most trusted bus booking platforms.
                </p>
                <p>
                  Today, we partner with over 100 bus operators across the country, offering more than 500 routes 
                  and serving over 1 million satisfied customers annually. Our platform has revolutionized the way 
                  Vietnamese people book their bus tickets, making it easier and more convenient than ever before.
                </p>
                <p>
                  We're proud to be at the forefront of Vietnam's transportation industry, constantly innovating 
                  and improving our services to meet the evolving needs of our customers.
                </p>
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
            <h2 className="mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape the way we serve our customers.
            </p>
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
                  <h2 className="mb-6">Our Mission</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    To connect people across Vietnam through safe, comfortable, and affordable bus travel, 
                    while providing an exceptional booking experience that makes every journey memorable.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div>
                      <h3 className="mb-2">Accessibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Making bus travel accessible to everyone, everywhere in Vietnam.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2">Reliability</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensuring every journey is safe, on-time, and stress-free.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2">Excellence</h3>
                      <p className="text-sm text-muted-foreground">
                        Continuously improving our service to exceed expectations.
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
