import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateServiceRequest, MarketplaceService } from '../../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/services`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<MarketplaceService[]> {
    return this.http.get<MarketplaceService[]>(this.baseUrl);
  }

  create(request: CreateServiceRequest): Observable<MarketplaceService> {
    return this.http.post<MarketplaceService>(this.baseUrl, request);
  }

  approve(serviceId: number): Observable<MarketplaceService> {
    return this.http.put<MarketplaceService>(`${this.baseUrl}/${serviceId}/approve`, {});
  }
}
