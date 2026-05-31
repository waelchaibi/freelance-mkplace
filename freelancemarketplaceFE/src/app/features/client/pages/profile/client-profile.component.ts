import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { FR_ERR, FR_SNACK, frRole } from '../../../../core/i18n/fr-labels';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.scss',
})
export class ClientProfileComponent implements OnInit {
  readonly frRole = frRole;
  private readonly fb = inject(FormBuilder);
  private readonly userApi = inject(UserApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly profile = signal<UserProfile | null>(null);
  profileSaving = false;
  passwordSaving = false;

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.userApi.getMe().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({ name: profile.name, email: profile.email });
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.profileSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSaving = true;
    this.userApi.updateMe(this.profileForm.getRawValue()).subscribe({
      next: (updated) => {
        this.profileSaving = false;
        this.profile.set(updated);
        this.snackBar.open(FR_SNACK.profileUpdated, FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        this.profileSaving = false;
        this.snackBar.open(err?.error?.error ?? FR_ERR.updateFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.passwordSaving) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.snackBar.open(FR_SNACK.passwordsMismatch, FR_SNACK.close, { duration: 4000 });
      return;
    }

    this.passwordSaving = true;
    this.userApi.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordForm.reset();
        this.snackBar.open(FR_SNACK.passwordChanged, FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        this.passwordSaving = false;
        this.snackBar.open(err?.error?.error ?? FR_ERR.passwordChangeFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
  }
}
