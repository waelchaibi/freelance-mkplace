import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminNotificationLog, Notification } from '../../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/notifications`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {});
  }

  getAdminSentHistory(): Observable<AdminNotificationLog[]> {
    return this.http.get<AdminNotificationLog[]>(`${this.baseUrl}/admin/sent`);
  }
}
