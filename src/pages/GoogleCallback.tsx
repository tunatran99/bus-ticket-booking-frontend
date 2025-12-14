import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../services/tokenStore';

type PostMessageWindow = Pick<Window & typeof globalThis, 'postMessage'>;

function hasPostMessage(target: unknown): target is PostMessageWindow {
  return (
    typeof target === 'object' &&
    target !== null &&
    'postMessage' in target &&
    typeof (target as { postMessage?: unknown }).postMessage === 'function'
  );
}

export function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('accessToken') || '';
    const refreshToken = url.searchParams.get('refreshToken') || '';

    if (accessToken) {
      tokenStore.setAccessToken(accessToken);
    }
    if (refreshToken) {
      tokenStore.setRefreshToken(refreshToken);
    }

    const openerCandidate: unknown = window.opener;
    if (hasPostMessage(openerCandidate)) {
      try {
        openerCandidate.postMessage({ type: 'google-auth-success' }, window.location.origin);
      } catch {
        // ignore cross-origin errors
      }
      window.close();
      return;
    }

    void navigate('/');
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Completing Google login…</p>
    </div>
  );
}
