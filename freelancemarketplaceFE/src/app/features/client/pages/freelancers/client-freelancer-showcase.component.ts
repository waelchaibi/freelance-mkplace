import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FR_SNACK, resolveApiFileUrl } from '../../../../core/i18n/fr-labels';
import { Feedback } from '../../../../core/models/feedback.model';
import { PortfolioItem } from '../../../../core/models/portfolio.model';
import { FeedbackApiService } from '../../../../core/services/api/feedback-api.service';
import { PortfolioApiService } from '../../../../core/services/api/portfolio-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-client-freelancer-showcase',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatSnackBarModule, PageHeaderComponent],
  templateUrl: './client-freelancer-showcase.component.html',
  styleUrl: './client-freelancer-showcase.component.scss',
})
export class ClientFreelancerShowcaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly feedbackApi = inject(FeedbackApiService);
  private readonly userApi = inject(UserApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly apiUrl = environment.apiUrl;
  readonly portfolio = signal<PortfolioItem[]>([]);
  readonly feedbacks = signal<Feedback[]>([]);
  readonly freelancerId = signal<number>(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.freelancerId.set(id);

    this.portfolioApi.getByFreelancer(id).subscribe({
      next: (items) => this.portfolio.set(items),
    });

    this.feedbackApi.getByFreelancer(id).subscribe({
      next: (items) => this.feedbacks.set(items),
    });
  }

  mediaUrl(path: string | null | undefined): string | null {
    return resolveApiFileUrl(path, this.apiUrl);
  }

  averageRating(): string {
    const items = this.feedbacks();
    if (!items.length) return '—';
    const avg = items.reduce((sum, f) => sum + f.rating, 0) / items.length;
    return avg.toFixed(1);
  }

  handleDownloadCv(): void {
    const id = this.freelancerId();
    if (!id) return;

    this.userApi.downloadCv(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => {
        this.snackBar.open('CV non disponible', FR_SNACK.close, { duration: 3000 });
      },
    });
  }
}
