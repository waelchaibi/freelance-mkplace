import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FR_ERR, FR_SNACK } from '../../../core/i18n/fr-labels';
import { Notification } from '../../../core/models/notification.model';
import { NotificationApiService } from '../../../core/services/api/notification-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatButtonModule, MatSnackBarModule, PageHeaderComponent],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationApi = inject(NotificationApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly notifications = signal<Notification[]>([]);

  ngOnInit(): void {
    this.loadNotifications();
  }

  markAllRead(): void {
    this.notificationApi.markAllAsRead().subscribe({
      next: () => this.loadNotifications(),
    });
  }

  openNotification(notification: Notification): void {
    if (!notification.read) {
      this.notificationApi.markAsRead(notification.id).subscribe();
    }

    const role = this.auth.getUser()?.role?.toLowerCase();
    if (!role || !notification.referenceId) {
      return;
    }

    if (notification.type.includes('ORDER') || notification.type === 'MESSAGE_RECEIVED') {
      void this.router.navigate([`/${role}/orders`, notification.referenceId]);
      return;
    }

    if (notification.type.includes('SERVICE')) {
      if (role === 'admin') {
        void this.router.navigate(['/admin/services']);
      } else if (role === 'freelancer') {
        void this.router.navigate(['/freelancer/services']);
      }
    }
  }

  private loadNotifications(): void {
    this.notificationApi.getAll().subscribe({
      next: (items) => this.notifications.set(items),
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? FR_ERR.loadNotifications, FR_SNACK.close, { duration: 4000 });
      },
    });
  }
}
