import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminStats } from '../../models/admin-stats.model';

@Injectable({ providedIn: 'root' })
export class AdminStatsApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/admin/stats`;

  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(this.baseUrl);
  }
}
