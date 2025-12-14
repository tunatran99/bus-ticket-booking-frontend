let timer: number | null = null;

export function scheduleAutoRefresh(secondsUntilExpiry: number, refreshFn: () => Promise<unknown>) {
  clearAutoRefresh();
  const delayMs = Math.max((secondsUntilExpiry - 20) * 1000, 5000);
  timer = window.setTimeout(() => {
    void (async () => {
      try {
        await refreshFn();
      } catch {
        // ignore; interceptor will handle redirect on failure
      }
    })();
  }, delayMs);
}

export function clearAutoRefresh() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
}
