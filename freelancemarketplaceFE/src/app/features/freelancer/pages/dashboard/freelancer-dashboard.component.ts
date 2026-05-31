import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { FR_ERR } from '../../../../core/i18n/fr-labels';
import { FreelancerStats } from '../../../../core/models/dashboard-stats.model';
import { DashboardStatsApiService } from '../../../../core/services/api/dashboard-stats-api.service';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [DecimalPipe, MatCardModule, MatButtonModule, MatProgressSpinnerModule, RouterLink, PageHeaderComponent],
  templateUrl: './freelancer-dashboard.component.html',
  styleUrl: './freelancer-dashboard.component.scss',
})
export class FreelancerDashboardComponent implements OnInit {
  private readonly statsApi = inject(DashboardStatsApiService);
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<FreelancerStats | null>(null);
  readonly availability = signal<string>('—');

  ngOnInit(): void {
    this.userApi.getMe().subscribe({
      next: (profile) => this.availability.set(profile.availability ?? '—'),
    });

    this.statsApi.getFreelancerStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? FR_ERR.loadDashboard);
        this.loading.set(false);
      },
    });
  }

  openMessages(): void {
    void this.router.navigate(['/freelancer/messages']);
  }
}
