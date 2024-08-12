import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
    ]
})

export class HeaderComponent implements OnInit, OnDestroy {
    usdRate: string = '0';
    eurRate: string = '0';
    private ratesSubscription: Subscription|undefined = undefined;

    constructor(private currencyService: CurrencyService) {}

    ngOnInit() {
        this.ratesSubscription = this.currencyService.rates$.subscribe(rates => {
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