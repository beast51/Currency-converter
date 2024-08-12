import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyService } from '../../services/currency.service';
import { Subscription } from 'rxjs/internal/Subscription';

const DIRECTION = {
  FORWARD: "FORWARD",
  BACKWARD: "BACKWARD"
} as const;

type DirectionType = keyof typeof DIRECTION;

@Component({
    selector: 'converter',
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
    ]
})
export class ConverterComponent implements OnInit, OnDestroy {
    amountFirst = 1;
    amountSecond = 0;
    currencyFirst = 'USD';
    currencySecond = 'UAH';
    rates: Record<string, number> = {};

    private ratesSubscription: Subscription|undefined = undefined;

    constructor(private currencyService: CurrencyService) {}

    ngOnDestroy(): void {
        if (this.ratesSubscription) {
            this.ratesSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this.ratesSubscription = this.currencyService.rates$.subscribe(data => {
            this.rates = data;
            this.convertCurrency(DIRECTION.FORWARD);
        });
    }

    convertCurrency(direction: DirectionType = DIRECTION.FORWARD) {
        if (direction === DIRECTION.FORWARD) {
          const rateFirstToUAH = this.rates[this.currencyFirst];
          const rateSecondToUAH = this.rates[this.currencySecond];
          if (rateFirstToUAH && rateSecondToUAH) {
            this.amountSecond = this.roundToNearest(this.amountFirst * (rateFirstToUAH / rateSecondToUAH));
          }
        } else {
          const rateFirstToUAH = this.rates[this.currencyFirst];
          const rateSecondToUAH = this.rates[this.currencySecond];
          if (rateFirstToUAH && rateSecondToUAH) {
            this.amountFirst = this.roundToNearest(this.amountSecond * (rateSecondToUAH / rateFirstToUAH));
          }
        }
      }

    getFilteredCurrencies(excludeCurrency: string): string[] {
      return Object.keys(this.rates).filter(currency => currency !== excludeCurrency);
    }

    roundToNearest(value: number, step: number = 0.01): number {
      const factor = 1 / step;
      return Math.round(value * factor) / factor;
    }
}