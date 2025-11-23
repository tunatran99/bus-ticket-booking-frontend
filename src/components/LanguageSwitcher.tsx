import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
      className="gap-2"
    >
      <Globe className="size-4" />
      <span>{language === 'en' ? 'VI' : 'EN'}</span>
    </Button>
  );
}
