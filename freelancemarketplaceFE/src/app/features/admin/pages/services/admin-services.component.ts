import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MarketplaceService, ServiceStatus } from '../../../../core/models/service.model';
import { ServiceApiService } from '../../../../core/services/api/service-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../../../shared/components/status-chip/status-chip.component';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.scss',
})
export class AdminServicesComponent implements OnInit {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly services = signal<MarketplaceService[]>([]);
  readonly displayedColumns = ['title', 'freelancer', 'price', 'status', 'actions'];

  readonly pendingServices = computed(() =>
    this.services().filter((s) => s.status === ServiceStatus.PENDING)
  );

  ngOnInit(): void {
    this.loadServices();
  }

  approve(service: MarketplaceService): void {
    this.serviceApi.approve(service.id).subscribe({
      next: () => {
        this.snackBar.open('Service approved', 'Close', { duration: 2500 });
        this.loadServices();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error ?? 'Approval failed', 'Close', { duration: 4000 });
      },
    });
  }

  private loadServices(): void {
    this.serviceApi.getAll().subscribe({
      next: (data) => this.services.set(data),
    });
  }
}
