import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import {
  Calendar,
  Shield,
  DollarSign,
  MousePointerClick,
  Headphones,
  Tag,
  Search,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProvinceSelect } from '../components/ProvinceSelect';

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [startProvince, setStartProvince] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const numberOfTickets = '1';

  const handleSearch = async () => {
    if (!startProvince || !destinationProvince || !travelDate) {
      setErrorMessage(t('home.fillFieldsWarning'));
      return;
    }
    setErrorMessage('');
    await navigate('/search', {
      state: {
        origin: startProvince,
        destination: destinationProvince,
        date: travelDate,
        numberOfTickets,
      },
    });
  };

  const features = [
    {
      icon: Shield,
      title: t('home.safeComfortable'),
      description: t('home.safeDesc'),
    },
    {
      icon: DollarSign,
      title: t('home.affordablePrices'),
      description: t('home.affordableDesc'),
    },
    {
      icon: MousePointerClick,
      title: t('home.easyBooking'),
      description: t('home.easyDesc'),
    },
    {
      icon: Headphones,
      title: t('home.support247'),
      description: t('home.supportDesc'),
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight">{t('home.title')}</h1>
              <p className="text-muted-foreground">{t('home.subtitle')}</p>
            </div>

            {/* Search Form */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <ProvinceSelect
                    label={t('home.startProvince')}
                    value={startProvince}
                    onChange={(province) => setStartProvince(province)}
                    placeholder={t('provincePicker.searchPlaceholder')}
                  />

                  <ProvinceSelect
                    label={t('home.destinationProvince')}
                    value={destinationProvince}
                    onChange={(province) => setDestinationProvince(province)}
                    placeholder={t('provincePicker.searchPlaceholder')}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      {t('home.travelDate')}
                    </Label>
                    <input
                      id="date"
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {errorMessage && <p className="text-sm text-destructive mb-2">{errorMessage}</p>}

                <Button onClick={handleSearch} className="w-full" size="lg">
                  <Search className="mr-2 size-4" />
                  {t('home.searchRoutes')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight">{t('home.promotions')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1512106374988-c95f566d39ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXNjb3VudCUyMHByb21vdGlvbiUyMHNhbGV8ZW58MXx8fHwxNzYzODgzMzY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Promotion"
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="size-5 text-primary" />
                  Ưu đãi 20% chuyến đầu
                </CardTitle>
                <CardDescription>
                  Giảm 20% cho lần đặt vé đầu tiên, áp dụng cho mọi tuyến đường.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1760386128700-d752f805c116?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidXMlMjB0cmF2ZWx8ZW58MXx8fHwxNzYzODgzMzY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Premium buses"
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="size-5 text-primary" />
                  Trải nghiệm xe cao cấp
                </CardTitle>
                <CardDescription>
                  Nâng hạng ghế VIP với không gian rộng và tiện nghi mà không tốn thêm phí.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1693741099475-6de58a36cbc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwbGFuZHNjYXBlJTIwaGlnaHdheXxlbnwxfHx8fDE3NjM4ODMzNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Travel rewards"
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="size-5 text-primary" />
                  Chương trình tích điểm
                </CardTitle>
                <CardDescription>
                  Tích lũy điểm mỗi lần đặt vé để đổi chuyến miễn phí hoặc nâng hạng dịch vụ.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight">{t('home.whyChooseUs')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="size-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
