import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateAdminFeedbackRequest,
  CreateFeedbackRequest,
  Feedback,
} from '../../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/feedbacks`;

  constructor(private readonly http: HttpClient) {}

  create(request: CreateFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, request);
  }

  getByOrder(orderId: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/order/${orderId}`);
  }

  getByFreelancer(freelancerId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/freelancer/${freelancerId}`);
  }

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.baseUrl);
  }

  getMyFeedbacks(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/me`);
  }

  createByAdmin(request: CreateAdminFeedbackRequest): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.baseUrl}/admin`, request);
  }
}
