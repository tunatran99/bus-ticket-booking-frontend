import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function ChatbotIcon() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => setIsOpen((prev) => !prev);
  const closeWidget = () => setIsOpen(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleWidget}
              size="icon"
              className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-40"
            >
              <MessageCircle className="size-6" />
              <span className="sr-only">{t('common.chatbot')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.chatbot')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(22rem,calc(100vw-2rem))] animate-in fade-in-0 slide-in-from-bottom-4">
          <Card className="shadow-2xl border bg-white">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{t('common.chatbot')}</CardTitle>
                <CardDescription>{t('common.chatbotComingSoon')}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={closeWidget}>
                <X className="size-4" />
                <span className="sr-only">{t('common.close')}</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
                {t('contact.infoCardDescription')}
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to="/contact">{t('nav.contact')}</Link>
                </Button>
                <Button variant="outline" className="flex-1" onClick={closeWidget}>
                  {t('common.close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
