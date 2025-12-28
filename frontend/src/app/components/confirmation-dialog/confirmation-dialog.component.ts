import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService, ConfirmationDialog } from '../../services/confirmation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="confirmation-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="confirmation-dialog" [class.shake]="shake">
        <div class="dialog-header" [ngClass]="getHeaderClass()">
          <i class="dialog-icon" [ngClass]="getIconClass()"></i>
          <h3>{{ currentDialog?.title }}</h3>
        </div>
        <div class="dialog-body">
          <p>{{ currentDialog?.message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ currentDialog?.cancelText || 'Hủy' }}
          </button>
          <button class="btn btn-confirm" [ngClass]="getConfirmButtonClass()" (click)="onConfirm()">
            {{ currentDialog?.confirmText || 'Xác nhận' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .confirmation-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      min-width: 400px;
      max-width: 500px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .confirmation-dialog.shake {
      animation: shake 0.5s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }

    .dialog-header {
      padding: 24px 24px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .dialog-header.danger {
      background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
      border-bottom-color: #fecaca;
    }

    .dialog-header.warning {
      background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
      border-bottom-color: #fde68a;
    }

    .dialog-header.info {
      background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
      border-bottom-color: #bfdbfe;
    }

    .dialog-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .dialog-icon.danger {
      color: #ef4444;
    }

    .dialog-icon.warning {
      color: #f59e0b;
    }

    .dialog-icon.info {
      color: #3b82f6;
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .dialog-body {
      padding: 24px;
    }

    .dialog-body p {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
    }

    .dialog-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      outline: none;
    }

    .btn-cancel {
      background: #f3f4f6;
      color: #4b5563;
    }

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-confirm {
      color: white;
    }

    .btn-confirm.danger {
      background: #ef4444;
    }

    .btn-confirm.danger:hover {
      background: #dc2626;
    }

    .btn-confirm.warning {
      background: #f59e0b;
    }

    .btn-confirm.warning:hover {
      background: #d97706;
    }

    .btn-confirm.info {
      background: #3b82f6;
    }

    .btn-confirm.info:hover {
      background: #2563eb;
    }
  `]
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
    isVisible = false;
    currentDialog: ConfirmationDialog | null = null;
    shake = false;
    private subscription?: Subscription;

    constructor(private confirmationService: ConfirmationService) { }

    ngOnInit() {
        this.subscription = this.confirmationService.confirmation$.subscribe(
            (dialog) => {
                this.currentDialog = dialog;
                this.isVisible = true;
                this.shake = false;
            }
        );
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    onConfirm() {
        this.confirmationService.sendResult(true);
        this.isVisible = false;
    }

    onCancel() {
        this.confirmationService.sendResult(false);
        this.isVisible = false;
    }

    onOverlayClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.shake = true;
            setTimeout(() => this.shake = false, 500);
        }
    }

    getHeaderClass(): string {
        return this.currentDialog?.type || 'danger';
    }

    getIconClass(): string {
        const type = this.currentDialog?.type || 'danger';
        const icons = {
            danger: 'fa-solid fa-exclamation-triangle danger',
            warning: 'fa-solid fa-exclamation-circle warning',
            info: 'fa-solid fa-info-circle info'
        };
        return icons[type];
    }

    getConfirmButtonClass(): string {
        return this.currentDialog?.type || 'danger';
    }
}
