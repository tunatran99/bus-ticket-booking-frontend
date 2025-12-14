import { Layout } from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useFeedbackDialog } from '../hooks/useFeedbackDialog';

export function Contact() {
  const { t } = useLanguage();
  const { showDialog, dialog } = useFeedbackDialog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showDialog({
      title: t('contact.formTitle'),
      description: t('contact.successAlert'),
      confirmLabel: t('common.close') || 'Close',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="mb-4">{t('nav.contact')}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('contact.heroSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact.infoCardTitle')}</CardTitle>
                  <CardDescription>{t('contact.infoCardDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1">{t('contact.phoneTitle')}</h3>
                      <p className="text-sm text-muted-foreground">1900 123 456</p>
                      <p className="text-sm text-muted-foreground">{t('contact.phoneHours')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1">{t('contact.emailTitle')}</h3>
                      <p className="text-sm text-muted-foreground">support@busticket.com</p>
                      <p className="text-sm text-muted-foreground">info@busticket.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1">{t('contact.officeTitle')}</h3>
                      <p className="text-sm text-muted-foreground">
                        123 Main Street
                        <br />
                        Hanoi, Vietnam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1">{t('contact.hoursTitle')}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {t('contact.hoursText')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact.formTitle')}</CardTitle>
                  <CardDescription>{t('contact.formDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('contact.firstName')}</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('contact.lastName')}</Label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.email')}</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('contact.phone')}</Label>
                        <Input id="phone" type="tel" placeholder="+84 123 456 789" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.subject')}</Label>
                      <Input id="subject" placeholder={t('contact.subjectPlaceholder')} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.message')}</Label>
                      <Textarea
                        id="message"
                        placeholder={t('contact.messagePlaceholder')}
                        className="min-h-[150px]"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full md:w-auto">
                      {t('contact.sendMessage')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Section */}
          <Card className="mt-8">
            <CardContent className="p-0">
              <div className="w-full h-[400px] bg-muted rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59587.95561107422!2d105.80443152167968!3d21.022775999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2zSGFub2ksIEhvw6BuIEtp4bq_bSwgVmlldG5hbQ!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {dialog}
    </Layout>
  );
}
