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
  selector: 'app-client-layout',
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
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss',
})
export class ClientLayoutComponent {
  protected readonly auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/client/dashboard', icon: 'dashboard' },
    { label: 'Services', route: '/client/services', icon: 'storefront' },
    { label: 'Mes projets', route: '/client/orders', icon: 'assignment' },
    { label: 'Messages', route: '/client/messages', icon: 'forum' },
    { label: 'Profil', route: '/client/profile', icon: 'person' },
    { label: 'Notifications', route: '/client/notifications', icon: 'notifications' },
  ];
}
