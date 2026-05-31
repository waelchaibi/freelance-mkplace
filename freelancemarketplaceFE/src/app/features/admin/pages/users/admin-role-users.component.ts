import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { FR_ERR, FR_SNACK, frAvailability } from '../../../../core/i18n/fr-labels';
import { Role } from '../../../../core/models/role.enum';
import { AvailabilityStatus, UserProfile } from '../../../../core/models/user-profile.model';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-role-users',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
  ],
  templateUrl: './admin-role-users.component.html',
  styleUrl: './admin-role-users.component.scss',
})
export class AdminRoleUsersComponent implements OnInit {
  readonly frAvailability = frAvailability;
  private readonly userApi = inject(UserApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly role = this.route.snapshot.data['role'] as Role;
  readonly apiUrl = environment.apiUrl;
  readonly title = this.route.snapshot.data['title'] as string;
  readonly subtitle = this.route.snapshot.data['subtitle'] as string;

  readonly users = signal<UserProfile[]>([]);
  readonly specialtyFilter = new FormControl('', { nonNullable: true });
  readonly availabilityFilter = new FormControl<AvailabilityStatus | ''>('', { nonNullable: true });
  readonly minRatingFilter = new FormControl<number | null>(null);

  readonly displayedColumns = computed(() => {
    if (this.role === Role.FREELANCER) {
      return ['name', 'email', 'specialty', 'availability', 'rating', 'enabled', 'actions'];
    }
    return ['name', 'email', 'enabled', 'actions'];
  });

  ngOnInit(): void {
    if (this.role === Role.FREELANCER) {
      this.specialtyFilter.valueChanges.subscribe(() => this.loadUsers());
      this.availabilityFilter.valueChanges.subscribe(() => this.loadUsers());
      this.minRatingFilter.valueChanges.subscribe(() => this.loadUsers());
    }
    this.loadUsers();
  }

  toggleEnabled(user: UserProfile, event: MatSlideToggleChange): void {
    const enabled = event.checked;
    this.userApi.setEnabled(user.id, enabled).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.snackBar.open(updated.enabled ? FR_SNACK.accountEnabled : FR_SNACK.accountDisabled, FR_SNACK.close, { duration: 2500 });
      },
      error: (err) => {
        event.source.checked = user.enabled;
        this.snackBar.open(err?.error?.error ?? FR_ERR.updateFailed, FR_SNACK.close, { duration: 4000 });
      },
    });
  }

  openClientMessages(user: UserProfile): void {
    void this.router.navigate(['/admin/messages'], { queryParams: { clientId: user.id } });
  }

  private loadUsers(): void {
    const filters =
      this.role === Role.FREELANCER
        ? {
            specialty: this.specialtyFilter.value || undefined,
            availability: this.availabilityFilter.value || undefined,
            minRating: this.minRatingFilter.value ?? undefined,
          }
        : undefined;

    this.userApi.listUsers(this.role, filters).subscribe({
      next: (users) => this.users.set(users),
    });
  }
}
