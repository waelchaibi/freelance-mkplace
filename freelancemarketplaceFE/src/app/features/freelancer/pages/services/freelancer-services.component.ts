import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MarketplaceService } from '../../../../core/models/service.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceApiService } from '../../../../core/services/api/service-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-freelancer-services',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    DecimalPipe,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './freelancer-services.component.html',
  styleUrl: './freelancer-services.component.scss',
})
export class FreelancerServicesComponent implements OnInit {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly auth = inject(AuthService);

  readonly services = signal<MarketplaceService[]>([]);

  readonly myServices = computed(() => {
    const userId = this.auth.getUser()?.userId;
    return this.services().filter((s) => s.freelancerId === userId);
  });

  ngOnInit(): void {
    this.serviceApi.getAll().subscribe({
      next: (data) => this.services.set(data),
    });
  }
}
