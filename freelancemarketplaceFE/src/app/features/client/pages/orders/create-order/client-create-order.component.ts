import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../../../../core/models/service.model';
import { ServiceApiService } from '../../../../../core/services/api/service-api.service';
import { FR_ERR, FR_SNACK } from '../../../../../core/i18n/fr-labels';
import { OrderApiService } from '../../../../../core/services/api/order-api.service';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-create-order',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './client-create-order.component.html',
  styleUrl: './client-create-order.component.scss',
})
export class ClientCreateOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderApi = inject(OrderApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedService = signal<MarketplaceService | null>(null);
  loading = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.maxLength(200)]],
    technology: ['', [Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    deadline: [''],
  });

  ngOnInit(): void {
    const serviceId = Number(this.route.snapshot.queryParamMap.get('serviceId'));
    if (!serviceId) return;

    this.serviceApi.getAll().subscribe({
      next: (services) => {
        const match = services.find((s) => s.id === serviceId) ?? null;
        this.selectedService.set(match);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const serviceId = this.selectedService()?.id;
    this.loading = true;

    this.orderApi
      .create({
        title: this.form.controls.title.value || null,
        technology: this.form.controls.technology.value || null,
        description: this.form.controls.description.value,
        serviceId: serviceId ?? null,
        deadline: this.form.controls.deadline.value || null,
      })
      .subscribe({
        next: (order) => {
          this.loading = false;
          void this.router.navigate(['/client/orders', order.id]);
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err?.error?.error ?? FR_ERR.createOrder, FR_SNACK.close, { duration: 4000 });
        },
      });
  }
}
