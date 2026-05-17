import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-freelancer-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './freelancer-layout.component.html',
  styleUrl: './freelancer-layout.component.scss',
})
export class FreelancerLayoutComponent {
  protected readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/freelancer/dashboard', icon: 'dashboard' },
    { label: 'Profile', route: '/freelancer/profile', icon: 'person' },
    { label: 'My Services', route: '/freelancer/services', icon: 'design_services' },
    { label: 'Assigned Orders', route: '/freelancer/orders', icon: 'assignment' },
  ];
}
