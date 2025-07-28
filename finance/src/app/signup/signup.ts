import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Import HttpClient and Http types

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';

interface ValidationError {
  [key: string]: string[] | string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  form: FormGroup;
  loading = false;

  // Inject HttpClient and other dependencies directly
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    // Direct HTTP call to the API
    this.http.post('http://localhost:8000/api/users/register/', this.form.value) // 🔥 Change URL as needed
      .subscribe({
        next: () => {
          this.snackBar.open('User registered successfully', 'Close', { duration: 3000 });
          this.loading = false;
          this.form.reset();
          this.router.navigate(['/login']); // Redirect to login
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          let errorMessage = 'Registration failed. Please try again.';

          if (err.status === 400 && err.error) {
            const validationErrors: ValidationError = err.error;
            const firstField = Object.keys(validationErrors)[0];
            if (firstField) {
              const firstError = Array.isArray(validationErrors[firstField])
                ? validationErrors[firstField][0]
                : validationErrors[firstField];
              errorMessage = firstError;
            }
          } else if (err.status === 409 && err.error?.detail) {
            errorMessage = err.error.detail;
          }

          this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
        }
      });
  }
}