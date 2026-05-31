import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FR_ROLE, frRole } from '../../../../core/i18n/fr-labels';
import { Role } from '../../../../core/models/role.enum';
import { UserProfile } from '../../../../core/models/user-profile.model';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly users = signal<UserProfile[]>([]);
  readonly roleControl = new FormControl<string>('ALL', { nonNullable: true });
  readonly displayedColumns = ['name', 'email', 'role'];

  readonly roleOptions = [
    { label: 'Tous les rôles', value: 'ALL' },
    { label: FR_ROLE[Role.ADMIN], value: Role.ADMIN },
    { label: FR_ROLE[Role.CLIENT], value: Role.CLIENT },
    { label: FR_ROLE[Role.FREELANCER], value: Role.FREELANCER },
  ];

  readonly filteredUsers = computed(() => {
    const role = this.roleControl.value;
    if (role === 'ALL') return this.users();
    return this.users().filter((u) => u.role === role);
  });

  ngOnInit(): void {
    const role = this.route.snapshot.queryParamMap.get('role') ?? 'ALL';
    this.roleControl.setValue(role, { emitEvent: false });

    this.roleControl.valueChanges.subscribe((value) => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { role: value === 'ALL' ? null : value },
        queryParamsHandling: 'merge',
      });
    });

    this.loadUsers();
  }

  private loadUsers(): void {
    this.userApi.listUsers().subscribe({
      next: (users) => this.users.set(users),
    });
  }
}
