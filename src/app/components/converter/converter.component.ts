import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetCurrencyService } from '@services/getCurrency.service';
import { CurrencyConverterService, DIRECTION, DirectionType } from '@services/currencyConverter.service';
import { InputComponent } from '@components/ui/input/input.component';
import { SelectComponent } from '@components/ui/select/select.component';

@Component({
  selector: 'converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent
  ]
})
export class ConverterComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  rates: Record<string, number> = {};

  private ratesSubscription?: Subscription;

  constructor(
    private currencyConverterService: CurrencyConverterService,
    private getCurrencyService: GetCurrencyService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      inputCurrencyFirst: [1],
      inputCurrencySecond: [null],
      selectCurrencyFirst: ['USD'],
      selectCurrencySecond: ['UAH'],
    });

    this.ratesSubscription = this.getCurrencyService.rates$.subscribe(data => {
      this.rates = data;
      this.convertCurrency(DIRECTION.FORWARD); 
    });

    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.ratesSubscription) {
      this.ratesSubscription.unsubscribe();
    }
  }

  private setupFormSubscriptions(): void {
    const controls = [
      this.form.get('inputCurrencyFirst'),
      this.form.get('inputCurrencySecond'),
      this.form.get('selectCurrencyFirst'),
      this.form.get('selectCurrencySecond')
    ];

    controls.forEach(control => {
      control?.valueChanges.subscribe(() => {
        if (
          control === this.form.get('inputCurrencySecond') || 
          control === this.form.get('selectCurrencySecond')
        ) {
          this.convertCurrency(DIRECTION.BACKWARD);
        } else {
          this.convertCurrency(DIRECTION.FORWARD);
        }
      });
    });
  }

  private convertCurrency(direction: DirectionType): void {
    const inputCurrencyFirst = this.form.get('inputCurrencyFirst')
    const inputCurrencySecond = this.form.get('inputCurrencySecond')
    const rateFrom = this.rates[this.form.get('selectCurrencyFirst')!.value];
    const rateTo = this.rates[this.form.get('selectCurrencySecond')!.value];
    const amount = this.form.get(direction === DIRECTION.FORWARD 
      ? 'inputCurrencyFirst' 
      : 'inputCurrencySecond'
    )!.value

    const conversionParams = {
      amount, 
      rateFrom, 
      rateTo, 
      direction 
    }
      
    const convertedValue = this.currencyConverterService.convert(conversionParams)

    if (direction === DIRECTION.FORWARD) {
      inputCurrencySecond?.setValue(convertedValue, { emitEvent: false });
    } else {
      inputCurrencyFirst?.setValue(convertedValue, { emitEvent: false });
    }
  }

  getFilteredCurrencies(excludeCurrency: string): string[] {
    return Object.keys(this.rates).filter(currency => currency !== excludeCurrency);
  }
}
