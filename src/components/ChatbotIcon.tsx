import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function ChatbotIcon() {
  const { t } = useLanguage();

  const handleChatClick = () => {
    // Mock chatbot functionality
    alert(t('common.chatbot'));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleChatClick}
            size="icon"
            className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg z-50"
          >
            <MessageCircle className="size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('common.chatbot')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
