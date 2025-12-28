import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<Notification>();
    public notifications$ = this.notificationSubject.asObservable();
    private idCounter = 0;

    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
        const notification: Notification = {
            id: ++this.idCounter,
            message,
            type,
            duration
        };
        this.notificationSubject.next(notification);
    }

    success(message: string, duration?: number) {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number) {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration?: number) {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration?: number) {
        this.show(message, 'info', duration);
    }
}
