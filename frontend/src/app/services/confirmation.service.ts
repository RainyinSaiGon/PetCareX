import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmationDialog {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmationResult {
    confirmed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    private confirmationSubject = new Subject<ConfirmationDialog>();
    private resultSubject = new Subject<ConfirmationResult>();

    public confirmation$ = this.confirmationSubject.asObservable();
    public result$ = this.resultSubject.asObservable();

    confirm(options: ConfirmationDialog): Observable<boolean> {
        return new Observable((observer) => {
            this.confirmationSubject.next(options);

            const subscription = this.result$.subscribe((result) => {
                observer.next(result.confirmed);
                observer.complete();
                subscription.unsubscribe();
            });
        });
    }

    sendResult(confirmed: boolean) {
        this.resultSubject.next({ confirmed });
    }
}
