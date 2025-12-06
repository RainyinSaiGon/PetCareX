import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerData = signal<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: ''
  });
  confirmPassword = signal('');
  loading = signal(false);
  error = signal('');
  success = signal('');

  onSubmit(): void {
    // Validate required fields
    const data = this.registerData();
    if (!data.username || !data.email || !data.password) {
      this.error.set('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (data.password.length < 6) {
      this.error.set('Password must be at least 6 characters long');
      return;
    }

    // Validate password confirmation
    if (data.password !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set('Registration successful! Redirecting...');
        console.log('Registration successful:', response);
        // Redirect to home after successful registration
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        console.error('Registration error:', err);
      }
    });
  }

  updateField(field: keyof RegisterRequest, value: string): void {
    this.registerData.update(data => ({ ...data, [field]: value }));
  }

  updateConfirmPassword(value: string): void {
    this.confirmPassword.set(value);
  }
}
