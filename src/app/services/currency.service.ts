import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

interface Rate {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private apiUrl = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
    private ratesSubject = new BehaviorSubject<Record<string, number>>({});
    private availableRates = ['USD', 'EUR', 'GBP'] 
    public rates$ = this.ratesSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadRates();
    }

    private loadRates(): void {
        this.http.get<Rate[]>(this.apiUrl)
        .pipe(
            map(rates => {
                const ratesMap = rates
                .filter(rate => this.availableRates.includes(rate.cc))
                .reduce((acc: Record<string, number>, rate: Rate) => {
                    acc[rate.cc] = rate.rate;
                    return acc;
                }, {} as Record<string, number>);

                ratesMap['UAH'] = 1;

                return ratesMap;
            })
        ).subscribe(ratesMap => {
            this.ratesSubject.next(ratesMap);
        });
    }
}