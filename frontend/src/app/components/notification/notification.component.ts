import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class.notification-success]="notification.type === 'success'"
        [class.notification-error]="notification.type === 'error'"
        [class.notification-warning]="notification.type === 'warning'"
        [class.notification-info]="notification.type === 'info'"
        [@slideIn]
      >
        <i class="notification-icon" 
           [class.fa-check-circle]="notification.type === 'success'"
           [class.fa-exclamation-circle]="notification.type === 'error'"
           [class.fa-exclamation-triangle]="notification.type === 'warning'"
           [class.fa-info-circle]="notification.type === 'info'"
        ></i>
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" (click)="remove(notification.id)">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
    </div>
  `,
    styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      border-left-color: #10b981;
      background: #f0fdf4;
    }

    .notification-error {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .notification-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .notification-info {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }

    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .notification-success .notification-icon {
      color: #10b981;
    }

    .notification-error .notification-icon {
      color: #ef4444;
    }

    .notification-warning .notification-icon {
      color: #f59e0b;
    }

    .notification-info .notification-icon {
      color: #3b82f6;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
    }

    .notification-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #6b7280;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      color: #1f2937;
    }

    .notification-close i {
      font-size: 16px;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    private subscription?: Subscription;

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.subscription = this.notificationService.notifications$.subscribe(
            (notification) => {
                this.notifications.push(notification);

                if (notification.duration && notification.duration > 0) {
                    setTimeout(() => {
                        this.remove(notification.id);
                    }, notification.duration);
                }
            }
        );
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    remove(id: number) {
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
}
