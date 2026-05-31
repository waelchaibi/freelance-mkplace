import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Feedback } from '../../../core/models/feedback.model';
import { FR_ERR, FR_SNACK } from '../../../core/i18n/fr-labels';
import { FeedbackApiService } from '../../../core/services/api/feedback-api.service';

@Component({
  selector: 'app-order-feedback',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './order-feedback.component.html',
})
export class OrderFeedbackComponent implements OnInit {
  readonly orderId = input.required<number>();
  readonly submitted = output<Feedback>();

  private readonly fb = inject(FormBuilder);
  private readonly feedbackApi = inject(FeedbackApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly existing = signal<Feedback | null>(null);
  readonly ratingOptions = [1, 2, 3, 4, 5];
  saving = false;

  readonly form = this.fb.nonNullable.group({
    rating: [5, Validators.required],
    qualityScore: [5, Validators.required],
    communicationScore: [5, Validators.required],
    timelinessScore: [5, Validators.required],
    comment: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.feedbackApi.getByOrder(this.orderId()).subscribe({
      next: (feedback) => this.existing.set(feedback),
      error: () => this.existing.set(null),
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const v = this.form.getRawValue();
    this.feedbackApi
      .create({
        orderId: this.orderId(),
        rating: v.rating,
        qualityScore: v.qualityScore,
        communicationScore: v.communicationScore,
        timelinessScore: v.timelinessScore,
        comment: v.comment,
      })
      .subscribe({
        next: (feedback) => {
          this.saving = false;
          this.existing.set(feedback);
          this.submitted.emit(feedback);
          this.snackBar.open(FR_SNACK.feedbackThanks, FR_SNACK.close, { duration: 2500 });
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(err?.error?.error ?? FR_ERR.feedbackSend, FR_SNACK.close, { duration: 4000 });
        },
      });
  }
}
