import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: any;

  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      
      // Find which field is invalid and show specific error
      const invalidFields = Object.keys(this.form.controls).filter(key => this.form.get(key)?.invalid);
      if (invalidFields.length > 0) {
        const fieldNames: any = {
          name: 'Họ & tên',
          email: 'Email',
          username: 'Tên đăng nhập',
          password: 'Mật khẩu',
          confirm: 'Xác nhận mật khẩu'
        };
        const invalidFieldName = fieldNames[invalidFields[0]] || invalidFields[0];
        
        // Check specific validation errors
        const field = this.form.get(invalidFields[0]);
        if (field?.errors?.['required']) {
          this.error = `Vui lòng nhập ${invalidFieldName.toLowerCase()}`;
        } else if (field?.errors?.['email']) {
          this.error = 'Email không đúng định dạng';
        } else if (field?.errors?.['minlength']) {
          this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          this.error = `${invalidFieldName} không hợp lệ`;
        }
      } else {
        this.error = 'Vui lòng điền đầy đủ thông tin';
      }
      return;
    }
    const { name, email, username, password, confirm } = this.form.value;
    if (password !== confirm) { 
      this.error = 'Mật khẩu xác nhận không khớp'; 
      return; 
    }
    if (password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }
    this.loading = true; this.error = null;
    this.auth.register({ full_name: name!, email: email!, username: username!, password: password! }).subscribe({
      next: () => { 
        this.loading = false; 
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/auth/login']); 
      },
      error: (err) => { 
        this.loading = false; 
        if (err.status === 409 || err.status === 400) {
          this.error = err?.error?.message || 'Tên đăng nhập hoặc email đã tồn tại';
        } else if (err.status === 0) {
          this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else {
          this.error = err?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        }
      }
    });
  }
}
