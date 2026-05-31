import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

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
    NotificationBellComponent,
  ],
  templateUrl: './freelancer-layout.component.html',
  styleUrl: './freelancer-layout.component.scss',
})
export class FreelancerLayoutComponent {
  protected readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/freelancer/dashboard', icon: 'dashboard' },
    { label: 'Profil', route: '/freelancer/profile', icon: 'person' },
    { label: 'Mon portfolio', route: '/freelancer/portfolio', icon: 'collections' },
    { label: 'Mes services', route: '/freelancer/services', icon: 'design_services' },
    { label: 'Projets assignés', route: '/freelancer/orders', icon: 'assignment' },
    { label: 'Mes feedbacks', route: '/freelancer/feedbacks', icon: 'rate_review' },
    { label: 'Messages', route: '/freelancer/messages', icon: 'forum' },
    { label: 'Notifications', route: '/freelancer/notifications', icon: 'notifications' },
  ];
}
