import { memo, useMemo } from 'react';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';

export type SeatType = 'standard' | 'vip' | 'sleeper';
export type SeatStatus = 'available' | 'reserved';

export interface SeatDefinition {
  id: string;
  label: string;
  type: SeatType;
  status?: SeatStatus;
}

export type SeatLayoutRow = Array<SeatDefinition | null>;

const baseRow = (
  row: number,
  status: Partial<Record<'A' | 'B' | 'C' | 'D', SeatStatus>> = {},
): SeatLayoutRow => [
  {
    id: `${row}A`,
    label: `${row}A`,
    type: 'standard' as SeatType,
    status: status.A,
  },
  {
    id: `${row}B`,
    label: `${row}B`,
    type: 'standard' as SeatType,
    status: status.B,
  },
  null,
  {
    id: `${row}C`,
    label: `${row}C`,
    type: (row <= 2 ? 'vip' : 'standard') as SeatType,
    status: status.C,
  },
  {
    id: `${row}D`,
    label: `${row}D`,
    type: (row <= 2 ? 'vip' : 'standard') as SeatType,
    status: status.D,
  },
];

export const DEFAULT_SEAT_LAYOUT: SeatLayoutRow[] = [
  baseRow(1, { B: 'reserved' }),
  baseRow(2, { C: 'reserved' }),
  baseRow(3),
  baseRow(4),
  baseRow(5, { D: 'reserved' }),
  baseRow(6),
];

export const DEFAULT_SEAT_ORDER = DEFAULT_SEAT_LAYOUT.flatMap((row) =>
  row.filter((seat): seat is SeatDefinition => Boolean(seat)).map((seat) => seat.id),
);

export interface SeatMapProps {
  selectedSeatIds: string[];
  maxSelectable: number;
  onSelectionChange: (seatIds: string[]) => void;
  layout?: SeatLayoutRow[];
  reservedSeatIds?: string[];
}

const seatTypeLabel: Record<SeatType, string> = {
  standard: 'Standard',
  vip: 'VIP',
  sleeper: 'Sleeper',
};

export const SeatMap = memo(function SeatMap({
  selectedSeatIds,
  maxSelectable,
  onSelectionChange,
  layout = DEFAULT_SEAT_LAYOUT,
  reservedSeatIds = [],
}: SeatMapProps) {
  const reservedSet = useMemo(() => new Set(reservedSeatIds), [reservedSeatIds]);
  const normalizedLayout = useMemo(() => {
    return layout.map((row) =>
      row.map((seat) => {
        if (!seat) {
          return seat;
        }
        const isReserved = reservedSet.has(seat.id) || seat.status === 'reserved';
        return {
          ...seat,
          status: isReserved ? 'reserved' : seat.status,
        } as SeatDefinition;
      }),
    );
  }, [layout, reservedSet]);

  const seatOrder = useMemo(() => {
    return normalizedLayout.flatMap((row) =>
      row.filter((seat): seat is SeatDefinition => Boolean(seat)).map((seat) => seat.id),
    );
  }, [normalizedLayout]);

  const orderOf = (seatId: string) => {
    const index = seatOrder.indexOf(seatId);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  const handleToggle = (seat: SeatDefinition) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    if (seat.status === 'reserved' && !isSelected) {
      return;
    }

    if (isSelected) {
      onSelectionChange(selectedSeatIds.filter((id) => id !== seat.id));
      return;
    }

    if (selectedSeatIds.length >= maxSelectable) {
      return;
    }

    const next = [...selectedSeatIds, seat.id].sort((a, b) => orderOf(a) - orderOf(b));
    onSelectionChange(next);
  };

  const renderSeat = (seat: SeatDefinition | null, index: number) => {
    if (!seat) {
      return (
        <div
          key={`gap-${index}`}
          className="h-12 w-6 rounded-full border border-dashed border-border/70 bg-muted"
          aria-hidden
        ></div>
      );
    }

    const isSelected = selectedSeatIds.includes(seat.id);
    const isReserved = seat.status === 'reserved' && !isSelected;
    const disabled = isReserved || (!isSelected && selectedSeatIds.length >= maxSelectable);

    return (
      <button
        key={seat.id}
        type="button"
        className={cn(
          'relative flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          isSelected && 'border-primary bg-primary/10 text-primary',
          isReserved && 'border-dashed border-border text-muted-foreground opacity-60',
          seat.type === 'vip' && 'bg-secondary/20',
        )}
        onClick={() => handleToggle(seat)}
        disabled={disabled}
        aria-pressed={isSelected}
        aria-label={`Seat ${seat.label}${seat.status === 'reserved' ? ' reserved' : ''}`}
      >
        <span>{seat.label}</span>
        <span className="text-[0.6rem] font-medium text-muted-foreground">
          {seatTypeLabel[seat.type]}
        </span>
        {isSelected && (
          <span className="absolute -top-1 -right-1 inline-flex size-3 rounded-full bg-primary"></span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-semibold text-foreground">Coach Layout</p>
          <p className="text-muted-foreground">
            {selectedSeatIds.length} / {maxSelectable} selected
          </p>
        </div>
        <div className="space-y-3">
          {normalizedLayout.map((row, idx) => (
            <div key={`row-${idx}`} className="flex items-center justify-between gap-3">
              {row.map((seat, seatIdx) => renderSeat(seat, seatIdx))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend swatchClass="bg-primary" label="Selected" />
        <Legend swatchClass="bg-muted" label="Available" />
        <Legend swatchClass="bg-border" label="Reserved" dashed />
        <Legend swatchClass="bg-secondary/40" label="VIP" />
      </div>

      {selectedSeatIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Seats chosen:</span>
          {selectedSeatIds.map((seat) => (
            <Badge key={seat} variant="secondary">
              {seat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

function Legend({
  swatchClass,
  label,
  dashed,
}: {
  swatchClass: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn('inline-flex size-4 rounded-full border border-border', swatchClass, {
          'border-dashed': dashed,
        })}
      ></span>
      <span>{label}</span>
    </div>
  );
}
