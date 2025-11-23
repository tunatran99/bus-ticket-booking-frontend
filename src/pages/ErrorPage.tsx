import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Bus, Home } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function ErrorPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Bus className="size-24 text-muted-foreground" />
        </div>
        <h1 className="mb-4">404</h1>
        <h2 className="mb-4">{t('error.title')}</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t('error.message')}
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="size-4" />
          {t('error.backToHome')}
        </Button>
      </div>
    </div>
  );
}
