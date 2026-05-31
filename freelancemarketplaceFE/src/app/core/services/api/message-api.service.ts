import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConversationSummary } from '../../models/conversation.model';
import { Message, SendMessageRequest } from '../../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/messages`;

  constructor(private readonly http: HttpClient) {}

  getInbox(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${this.baseUrl}/inbox`);
  }

  getByOrder(orderId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${orderId}`);
  }

  send(request: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(this.baseUrl, request);
  }

  markAsRead(orderId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${orderId}/read`, {});
  }
}
