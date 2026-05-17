import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from '../../models/role.enum';
import { UserProfile } from '../../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/users`;

  constructor(private readonly http: HttpClient) {}

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  getAdmin(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/admin`);
  }

  listUsers(role?: Role): Observable<UserProfile[]> {
    const params = role ? { role } : undefined;
    return this.http.get<UserProfile[]>(this.baseUrl, { params });
  }
}
