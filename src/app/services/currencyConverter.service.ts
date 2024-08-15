import { Injectable } from '@angular/core';

export const DIRECTION = {
  FORWARD: "FORWARD",
  BACKWARD: "BACKWARD"
} as const;

export type DirectionType = keyof typeof DIRECTION;

interface ConversionParams {
  amount: number | null;
  rateFrom: number;
  rateTo: number;
  direction: DirectionType;
}

@Injectable({
  providedIn: 'root'
})

export class CurrencyConverterService {
  convert({ amount, rateFrom, rateTo, direction }: ConversionParams): number {
    if (!rateFrom || !rateTo || amount == null) {
      return 0
    }
    const result = direction === 'FORWARD'
      ? amount * (rateFrom / rateTo)
      : amount * (rateTo / rateFrom);
    return this.roundToNearest(result);
  }

  private roundToNearest(value: number, step = 0.01): number {
    const factor = 1 / step;
    return Math.round(value * factor) / factor;
  }
}