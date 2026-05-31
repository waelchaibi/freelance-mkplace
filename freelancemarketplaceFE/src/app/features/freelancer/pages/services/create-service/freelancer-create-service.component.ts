import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { FR_ERR, FR_SNACK } from '../../../../../core/i18n/fr-labels';
import { ServiceApiService } from '../../../../../core/services/api/service-api.service';
import { PageHeaderComponent } from '../../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-create-service',
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
  templateUrl: './freelancer-create-service.component.html',
  styleUrl: './freelancer-create-service.component.scss',
})
export class FreelancerCreateServiceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = false;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.serviceApi.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(FR_SNACK.serviceSubmitted, FR_SNACK.close, { duration: 3000 });
        void this.router.navigate(['/freelancer/services']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err?.error?.error ?? FR_ERR.publishService, FR_SNACK.close, { duration: 4000 });
      },
    });
  }
}
