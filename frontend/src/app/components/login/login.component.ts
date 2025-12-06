import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = signal<LoginRequest>({ username: '', password: '' });
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.credentials().username || !this.credentials().password) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.credentials()).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Login successful:', response);
        this.router.navigate(['/']); // Redirect to home
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
        console.error('Login error:', err);
      }
    });
  }

  updateUsername(value: string): void {
    this.credentials.update(creds => ({ ...creds, username: value }));
  }

  updatePassword(value: string): void {
    this.credentials.update(creds => ({ ...creds, password: value }));
  }
}
