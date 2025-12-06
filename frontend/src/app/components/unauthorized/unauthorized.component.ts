import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <h1>Truy cập bị từ chối</h1>
        <p class="message">Bạn không có quyền truy cập trang này.</p>
        <p class="role-info">
          Vai trò hiện tại: <strong>{{ authService.userRoleDisplay() || 'Chưa đăng nhập' }}</strong>
        </p>
        <div class="actions">
          <a routerLink="/dashboard" class="btn-primary">Về trang chủ</a>
          <a routerLink="/login" class="btn-secondary" (click)="authService.logout()">Đăng nhập tài khoản khác</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .unauthorized-card {
      background: white;
      border-radius: 20px;
      padding: 48px;
      text-align: center;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1a1f3c;
      font-size: 28px;
      margin: 0 0 16px;
    }
    .message {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .role-info {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .role-info strong {
      color: #667eea;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn-primary {
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary {
      padding: 14px 24px;
      background: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(public authService: AuthService) {}
}
