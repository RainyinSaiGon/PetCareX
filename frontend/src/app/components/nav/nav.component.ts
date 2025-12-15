import { Component, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements AfterViewInit {
  isOpen = false;
  dropdownOpen = false;
  accountDropdownOpen = false;

  constructor(private host: ElementRef<HTMLElement>, private auth: AuthService, private router: Router) {}

  ngAfterViewInit() {
    // nothing for now
  }

  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  logout() {
    this.auth.logout();
    this.close();
  }

  get isAuthRoute() {
    try {
      return this.router.url.startsWith('/auth');
    } catch (e) {
      return false;
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleAccountDropdown() {
    this.accountDropdownOpen = !this.accountDropdownOpen;
  }

  close() {
    this.isOpen = false;
    this.dropdownOpen = false;
    this.accountDropdownOpen = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {
    this.close();
  }
}
