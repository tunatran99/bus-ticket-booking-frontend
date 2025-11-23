import { Phone } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function HotlineIcon() {
  const { t } = useLanguage();

  const handleHotlineClick = () => {
    window.location.href = 'tel:1900123456';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleHotlineClick}
            size="icon"
            variant="secondary"
            className="fixed bottom-24 right-6 size-14 rounded-full shadow-lg z-50"
          >
            <Phone className="size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('common.hotline')}: 1900 123 456</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
