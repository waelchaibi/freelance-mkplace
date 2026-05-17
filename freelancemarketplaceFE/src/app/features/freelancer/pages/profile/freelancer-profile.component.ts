import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-freelancer-profile',
  standalone: true,
  imports: [MatCardModule, PageHeaderComponent],
  templateUrl: './freelancer-profile.component.html',
  styleUrl: './freelancer-profile.component.scss',
})
export class FreelancerProfileComponent implements OnInit {
  private readonly userApi = inject(UserApiService);

  readonly profile = signal<UserProfile | null>(null);

  ngOnInit(): void {
    this.userApi.getMe().subscribe({
      next: (profile) => this.profile.set(profile),
    });
  }
}
