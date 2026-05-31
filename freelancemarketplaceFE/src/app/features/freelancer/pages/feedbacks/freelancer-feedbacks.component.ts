import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Feedback } from '../../../../core/models/feedback.model';
import { FeedbackApiService } from '../../../../core/services/api/feedback-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-feedbacks',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatTableModule, PageHeaderComponent],
  templateUrl: './freelancer-feedbacks.component.html',
})
export class FreelancerFeedbacksComponent implements OnInit {
  private readonly feedbackApi = inject(FeedbackApiService);

  readonly feedbacks = signal<Feedback[]>([]);
  readonly displayedColumns = [
    'rating',
    'qualityScore',
    'communicationScore',
    'timelinessScore',
    'author',
    'comment',
    'createdAt',
  ];

  ngOnInit(): void {
    this.feedbackApi.getMyFeedbacks().subscribe({
      next: (items) => this.feedbacks.set(items),
    });
  }
}
