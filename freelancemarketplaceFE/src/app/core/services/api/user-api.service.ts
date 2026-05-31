import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from '../../models/role.enum';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserListFilters,
  UserProfile,
} from '../../models/user-profile.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/users`;

  constructor(private readonly http: HttpClient) {}

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`);
  }

  updateMe(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/me`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/me/password`, request);
  }

  getAdmin(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/admin`);
  }

  listUsers(role?: Role, filters?: UserListFilters): Observable<UserProfile[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (filters?.specialty) params = params.set('specialty', filters.specialty);
    if (filters?.availability) params = params.set('availability', filters.availability);
    if (filters?.minRating != null) params = params.set('minRating', filters.minRating);
    return this.http.get<UserProfile[]>(this.baseUrl, { params });
  }

  setEnabled(userId: number, enabled: boolean): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/${userId}/enabled`, { enabled });
  }

  uploadCv(file: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UserProfile>(`${this.baseUrl}/me/cv`, formData);
  }

  downloadCv(userId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/api/files/cv/user/${userId}`, {
      responseType: 'blob',
    });
  }
}
