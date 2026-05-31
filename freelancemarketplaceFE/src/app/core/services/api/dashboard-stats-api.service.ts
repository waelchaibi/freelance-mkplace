import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClientStats, FreelancerStats } from '../../models/dashboard-stats.model';

@Injectable({ providedIn: 'root' })
export class DashboardStatsApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getClientStats(): Observable<ClientStats> {
    return this.http.get<ClientStats>(`${this.baseUrl}/client`);
  }

  getFreelancerStats(): Observable<FreelancerStats> {
    return this.http.get<FreelancerStats>(`${this.baseUrl}/freelancer`);
  }
}
