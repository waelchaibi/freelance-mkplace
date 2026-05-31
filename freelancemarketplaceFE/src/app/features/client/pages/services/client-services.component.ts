import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MarketplaceService, ServiceStatus } from '../../../../core/models/service.model';
import { ServiceApiService } from '../../../../core/services/api/service-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-client-services',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    CurrencyPipe,
  ],
  templateUrl: './client-services.component.html',
  styleUrl: './client-services.component.scss',
})
export class ClientServicesComponent implements OnInit {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly services = signal<MarketplaceService[]>([]);
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly filteredServices = computed(() => {
    const q = this.searchControl.value.trim().toLowerCase();
    const approved = this.services().filter((s) => s.status === ServiceStatus.APPROVED);
    if (!q) return approved;
    return approved.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.freelancerName.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q') ?? '';
    this.searchControl.setValue(q, { emitEvent: false });

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: value.trim() || null },
        queryParamsHandling: 'merge',
      });
    });

    this.serviceApi.getAll().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
