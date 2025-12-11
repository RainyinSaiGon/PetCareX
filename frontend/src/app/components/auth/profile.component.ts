import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  loading = true;
  error: string | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.profile().subscribe({ next: (p) => { this.profile = p; this.loading = false; }, error: (e) => { this.error = 'Không thể tải hồ sơ'; this.loading = false; } });
  }
}
