import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NotificationApiService } from '../../../core/services/api/notification-api.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatBadgeModule],
  template: `
    <a
      mat-icon-button
      [routerLink]="notificationsRoute()"
      aria-label="Notifications non lues"
      [matBadge]="unreadCount() > 0 ? unreadCount() : null"
      matBadgeColor="warn"
      matBadgeSize="small"
    >
      <mat-icon>notifications</mat-icon>
    </a>
  `,
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  readonly notificationsRoute = input.required<string>();

  private readonly notificationApi = inject(NotificationApiService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly unreadCount = signal(0);

  ngOnInit(): void {
    this.refreshCount();
    this.intervalId = setInterval(() => this.refreshCount(), 30000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  refreshCount(): void {
    this.notificationApi.getUnreadCount().subscribe({
      next: ({ count }) => this.unreadCount.set(count),
    });
  }
}
