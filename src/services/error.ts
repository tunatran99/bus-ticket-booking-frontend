interface ErrorWithResponse {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
      message?: string;
    };
  };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err !== 'object' || err === null) {
    return fallback;
  }

  const errorWithResponse = err as ErrorWithResponse;
  return (
    errorWithResponse?.response?.data?.error?.message ||
    errorWithResponse?.response?.data?.message ||
    errorWithResponse?.message ||
    fallback
  );
}
