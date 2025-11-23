import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { ChatbotIcon } from './ChatbotIcon';
import { HotlineIcon } from './HotlineIcon';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFloatingIcons?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showFloatingIcons = true, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      {showFloatingIcons && (
        <>
          <ChatbotIcon />
          <HotlineIcon />
        </>
      )}
    </div>
  );
}