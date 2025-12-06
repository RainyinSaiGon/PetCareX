import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/auth.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[]; // Roles that can see this item
  children?: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl z-20"
        [class.w-64]="!sidebarCollapsed()"
        [class.w-20]="sidebarCollapsed()"
      >
        <!-- Sidebar Header -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/50">
          <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <span class="font-bold text-white text-lg">P</span>
            </div>
            <span *ngIf="!sidebarCollapsed()" class="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">PetCareX</span>
          </div>
          <button 
            (click)="toggleSidebar()"
            class="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <span class="text-lg leading-none">{{ sidebarCollapsed() ? '»' : '«' }}</span>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          @for (item of filteredNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
              [routerLinkActiveOptions]="{exact: false}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group relative"
              [title]="item.label"
            >
              <!-- Dot indicator for active state/hover -->
              <span class="w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" [class.opacity-100]="router.isActive(item.route, false)"></span>
              
              <span *ngIf="!sidebarCollapsed()" class="font-medium text-sm truncate">{{ item.label }}</span>
              
              <!-- Tooltip for collapsed state -->
              <div *ngIf="sidebarCollapsed()" class="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {{ item.label }}
              </div>
            </a>
          }
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/30">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold shrink-0 border-2 border-slate-600">
              {{ getInitials(authService.getCurrentUser()?.fullName) }}
            </div>
            <div *ngIf="!sidebarCollapsed()" class="flex-1 min-w-0 overflow-hidden">
              <p class="text-sm font-medium text-white truncate">{{ authService.getCurrentUser()?.fullName || 'User' }}</p>
              <p class="text-xs text-slate-400 truncate">{{ authService.userRoleDisplay() }}</p>
            </div>
            <button 
              (click)="logout()" 
              class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors ml-auto"
              title="Đăng xuất"
            >
              <span class="text-sm font-bold">✕</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Wrapper -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        <!-- Header -->
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div>
            <h1 class="text-xl font-bold text-slate-800 tracking-tight">{{ currentPageTitle() }}</h1>
            <p class="text-xs text-slate-500 mt-0.5">{{ currentDate | date:'EEEE, dd MMMM yyyy' }}</p>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- Add header actions here if needed -->
            <div class="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
              {{ getInitials(authService.getCurrentUser()?.fullName) }}
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div class="max-w-7xl mx-auto animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    /* Custom Scrollbar for Sidebar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class LayoutComponent implements OnInit {
  authService = inject(AuthService);
  public router = inject(Router);

  sidebarCollapsed = signal(false);
  currentPageTitle = signal('Dashboard');
  currentDate = new Date();

  // All nav items with role permissions
  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '', route: '/dashboard' }, // All roles
    { label: 'Khách hàng', icon: '', route: '/khach-hang', roles: [Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN] },
    { label: 'Thú cưng', icon: '', route: '/thu-cung' }, // All roles
    { label: 'Lịch hẹn', icon: '', route: '/lich-hen' }, // All roles
    { label: 'Dịch vụ Y tế', icon: '', route: '/y-te', roles: [Role.ADMIN, Role.QUAN_LY, Role.BAC_SI] },
    { label: 'Sản phẩm', icon: '', route: '/san-pham', roles: [Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN] },
    { label: 'Hóa đơn', icon: '', route: '/hoa-don', roles: [Role.ADMIN, Role.QUAN_LY, Role.NHAN_VIEN] },
    { label: 'Nhân viên', icon: '', route: '/nhan-vien', roles: [Role.ADMIN, Role.QUAN_LY] },
    { label: 'Chi nhánh', icon: '', route: '/chi-nhanh', roles: [Role.ADMIN, Role.QUAN_LY] },
    { label: 'Báo cáo', icon: '', route: '/bao-cao', roles: [Role.ADMIN, Role.QUAN_LY] },
  ];

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  // Filtered nav items based on user role
  filteredNavItems = computed(() => {
    const userRole = this.authService.userRole();
    if (!userRole) return [];
    
    return this.allNavItems.filter(item => {
      // If no roles specified, visible to all
      if (!item.roles || item.roles.length === 0) return true;
      // Check if user has required role
      return this.authService.hasRole(item.roles);
    });
  });

  // For backward compatibility
  get navItems() {
    return this.filteredNavItems();
  }

  ngOnInit() {
    this.updatePageTitle();
    this.router.events.subscribe(() => {
      this.updatePageTitle();
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updatePageTitle() {
    const path = this.router.url.split('/')[1];
    const item = this.allNavItems.find((n) => n.route === '/' + path);
    this.currentPageTitle.set(item?.label || 'Dashboard');
  }
}
