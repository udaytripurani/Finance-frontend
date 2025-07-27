import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

// Response interfaces
interface LoginResponse {
  msg: string;
  tokens: {
    access: string;
    refresh: string;
  };
}

// Allows optional fields in error response
interface ErrorResponse {
  [key: string]: string | string[] | undefined;
  detail?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    const { email, password } = this.form.value;

    this.http.post<LoginResponse>('http://127.0.0.1:8000/api/users/login/', {
      email,
      password
    }).subscribe({
      next: (res) => {
        // Save tokens to localStorage
        localStorage.setItem('access_token', res.tokens.access);
        localStorage.setItem('refresh_token', res.tokens.refresh);

        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        let message = 'Login failed. Please try again.';
        const errorBody = err.error as ErrorResponse;

        if (err.status === 400) {
          message = 'Please fill in all fields correctly.';
        } else if (err.status === 401 && errorBody.detail) {
          message = errorBody.detail;
        } else {
          const fieldErrors = Object.keys(errorBody);
          if (fieldErrors.length > 0) {
            const firstField = fieldErrors[0];
            const firstError = errorBody[firstField];
            if (firstError) {
              message = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
        }

        this.snackBar.open(`Error: ${message}`, 'Close', { duration: 5000 });
      }
    });
  }
}
