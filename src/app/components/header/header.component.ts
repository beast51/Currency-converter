import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { GetCurrencyService } from '@services/getCurrency.service';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [
        MatToolbarModule,
    ]
})

export class HeaderComponent implements OnInit, OnDestroy {
  usdRate = '0';
  eurRate = '0';
  private ratesSubscription?: Subscription;

  constructor(private getCurrencyService: GetCurrencyService) {}

  ngOnInit() {
    this.ratesSubscription = this.getCurrencyService.rates$.subscribe(rates => {
      this.usdRate = (rates['USD'] ?? 0).toFixed(2);
      this.eurRate = (rates['EUR'] ?? 0).toFixed(2);
    });
  }

  ngOnDestroy(): void {
    if (this.ratesSubscription) {
      this.ratesSubscription.unsubscribe();
      }
    }
}