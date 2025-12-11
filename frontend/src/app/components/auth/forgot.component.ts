import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {
  form: any;
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.message = null; this.error = null;
    const email = this.form.value.email;
    this.auth.forgot(email).subscribe({ next: () => { this.loading = false; this.message = 'Kiểm tra email để đặt lại mật khẩu.'; }, error: (e: any) => { this.loading = false; this.error = 'Yêu cầu thất bại'; } });
  }
}
