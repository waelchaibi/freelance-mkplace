import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AvailabilityStatus,
  UserProfile,
} from '../../../../core/models/user-profile.model';
import { FR_ERR, FR_SNACK } from '../../../../core/i18n/fr-labels';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-profile',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './freelancer-profile.component.html',
  styleUrl: './freelancer-profile.component.scss',
})
export class FreelancerProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userApi = inject(UserApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly profile = signal<UserProfile | null>(null);
  readonly cvPreviewUrl = computed(() => {
    const url = this.profile()?.cvUrl;
    if (!url) return null;
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  });
  readonly availabilityOptions: AvailabilityStatus[] = ['AVAILABLE', 'BUSY', 'UNAVAILABLE'];
  profileSaving = false;
  passwordSaving = false;

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    specialty: ['', Validators.maxLength(120)],
    yearsOfExperience: [null as number | null, Validators.min(0)],
    dailyRate: [null as number | null, Validators.min(0)],
    availability: [null as AvailabilityStatus | null],
    skills: ['', Validators.maxLength(1000)],
    cvUrl: ['', Validators.maxLength(500)],
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
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          specialty: profile.specialty ?? '',
          yearsOfExperience: profile.yearsOfExperience,
          dailyRate: profile.dailyRate,
          availability: profile.availability,
          skills: profile.skills ?? '',
          cvUrl: profile.cvUrl ?? '',
        });
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.profileSaving) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    this.profileSaving = true;
    this.userApi
      .updateMe({
        name: raw.name,
        email: raw.email,
        specialty: raw.specialty || null,
        yearsOfExperience: raw.yearsOfExperience,
        dailyRate: raw.dailyRate,
        availability: raw.availability,
        skills: raw.skills || null,
        cvUrl: raw.cvUrl || null,
      })
      .subscribe({
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

  handleCvUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.userApi.uploadCv(file).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.profileForm.patchValue({ cvUrl: updated.cvUrl ?? '' });
        this.snackBar.open(FR_SNACK.cvUploaded, FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? FR_ERR.cvUploadFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
    input.value = '';
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
