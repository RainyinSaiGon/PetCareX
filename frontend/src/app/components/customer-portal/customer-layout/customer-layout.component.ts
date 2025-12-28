import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerPortalService } from '../../../services/customer-portal.service';
import { NotificationComponent } from '../../notification/notification.component';

@Component({
    selector: 'app-customer-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, NotificationComponent],
    templateUrl: './customer-layout.component.html',
    styleUrls: ['./customer-layout.component.css'],
})
export class CustomerLayoutComponent {
    constructor(public customerService: CustomerPortalService) { }

    getCartCount(): number {
        return this.customerService.getCartCount();
    }
}
