import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Feedback } from '../../../../core/models/feedback.model';
import { Role } from '../../../../core/models/role.enum';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { FR_ERR, FR_SNACK } from '../../../../core/i18n/fr-labels';
import { FeedbackApiService } from '../../../../core/services/api/feedback-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-feedbacks',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  templateUrl: './admin-feedbacks.component.html',
})
export class AdminFeedbacksComponent implements OnInit {
  private readonly feedbackApi = inject(FeedbackApiService);
  private readonly userApi = inject(UserApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly feedbacks = signal<Feedback[]>([]);
  readonly freelancers = signal<UserProfile[]>([]);
  readonly displayedColumns = [
    'freelancer',
    'rating',
    'qualityScore',
    'communicationScore',
    'timelinessScore',
    'comment',
    'date',
  ];
  readonly ratingOptions = [1, 2, 3, 4, 5];
  saving = false;

  readonly form = this.fb.nonNullable.group({
    freelancerId: [0, Validators.required],
    rating: [5, Validators.required],
    qualityScore: [5, Validators.required],
    communicationScore: [5, Validators.required],
    timelinessScore: [5, Validators.required],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.loadFeedbacks();
    this.userApi.listUsers(Role.FREELANCER).subscribe({
      next: (users) => this.freelancers.set(users),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.saving = true;
    this.feedbackApi
      .createByAdmin({
        freelancerId: v.freelancerId,
        rating: v.rating,
        qualityScore: v.qualityScore,
        communicationScore: v.communicationScore,
        timelinessScore: v.timelinessScore,
        comment: v.comment,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.form.reset({
            freelancerId: 0,
            rating: 5,
            qualityScore: 5,
            communicationScore: 5,
            timelinessScore: 5,
            comment: '',
          });
          this.snackBar.open(FR_SNACK.evaluationCreated, FR_SNACK.close, { duration: 2500 });
          this.loadFeedbacks();
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.error ?? FR_ERR.updateFailed, FR_SNACK.close, { duration: 4000 });
        },
      });
  }

  private loadFeedbacks(): void {
    this.feedbackApi.getAll().subscribe({
      next: (items) => this.feedbacks.set(items),
    });
  }
}
