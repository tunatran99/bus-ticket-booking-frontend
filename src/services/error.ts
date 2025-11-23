export function getErrorMessage(err: unknown, fallback = 'Something went wrong') {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.error?.message ||
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    fallback
  );
}
