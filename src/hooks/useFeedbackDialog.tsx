import { useCallback, useMemo, useState } from 'react';
import { FeedbackDialog, FeedbackDialogProps } from '../components/FeedbackDialog';

type DialogContentState = Omit<FeedbackDialogProps, 'onOpenChange'>;

type ShowDialogPayload = Pick<
  FeedbackDialogProps,
  'title' | 'description' | 'confirmLabel' | 'onConfirm'
>;

export function useFeedbackDialog(defaults?: Partial<ShowDialogPayload>) {
  const [dialogState, setDialogState] = useState<DialogContentState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: defaults?.confirmLabel ?? 'Close',
  });

  const hideDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false, onConfirm: undefined }));
  }, []);

  const showDialog = useCallback(
    (payload: ShowDialogPayload) => {
      setDialogState({
        open: true,
        title: payload.title || defaults?.title || '',
        description: payload.description ?? defaults?.description,
        confirmLabel: payload.confirmLabel || defaults?.confirmLabel || 'Close',
        onConfirm: payload.onConfirm,
      });
    },
    [defaults],
  );

  const dialog = useMemo(
    () => (
      <FeedbackDialog
        open={dialogState.open}
        title={dialogState.title || defaults?.title || ''}
        description={dialogState.description || defaults?.description}
        confirmLabel={dialogState.confirmLabel || defaults?.confirmLabel || 'Close'}
        onConfirm={dialogState.onConfirm}
        onOpenChange={(open) => {
          if (!open) {
            hideDialog();
          } else {
            setDialogState((prev) => ({ ...prev, open }));
          }
        }}
      />
    ),
    [dialogState, defaults, hideDialog],
  );

  return { showDialog, hideDialog, dialog };
}
