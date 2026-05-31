import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreatePortfolioItemRequest,
  PortfolioItem,
  UploadResponse,
} from '../../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/portfolio`;

  constructor(private readonly http: HttpClient) {}

  getMyPortfolio(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/me`);
  }

  getByFreelancer(freelancerId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/freelancer/${freelancerId}`);
  }

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/me/upload/image`, formData);
  }

  uploadAttachment(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.baseUrl}/me/upload/attachment`, formData);
  }

  create(request: CreatePortfolioItemRequest): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, request);
  }

  update(id: number, request: CreatePortfolioItemRequest): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
