import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { AdminNotificationLog } from '../../../../core/models/notification.model';
import { NotificationApiService } from '../../../../core/services/api/notification-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-notification-log',
  standalone: true,
  imports: [DatePipe, MatTableModule, PageHeaderComponent],
  templateUrl: './admin-notification-log.component.html',
})
export class AdminNotificationLogComponent implements OnInit {
  private readonly notificationApi = inject(NotificationApiService);

  readonly logs = signal<AdminNotificationLog[]>([]);
  readonly displayedColumns = [
    'recipient',
    'title',
    'emailDeliveryStatus',
    'read',
    'createdAt',
  ];

  ngOnInit(): void {
    this.notificationApi.getAdminSentHistory().subscribe({
      next: (items) => this.logs.set(items),
    });
  }
}
