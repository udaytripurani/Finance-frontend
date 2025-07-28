import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginComponent } from './login';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatSnackBarModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    
    // Mock localStorage to prevent authentication errors
    spyOn(localStorage, 'setItem');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should validate email field', () => {
    const emailControl = component.form.get('email');
    
    // Test required validation
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);
    
    // Test email format validation
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    // Test valid email
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field', () => {
    const passwordControl = component.form.get('password');
    
    // Test required validation
    passwordControl?.setValue('');
    expect(passwordControl?.hasError('required')).toBe(true);
    
    // Test valid password
    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    spyOn(component['http'], 'post');
    
    component.onSubmit();
    
    expect(component['http'].post).not.toHaveBeenCalled();
  });

  it('should not submit when already loading', () => {
    component.loading = true;
    spyOn(component['http'], 'post');
    
    component.onSubmit();
    
    expect(component['http'].post).not.toHaveBeenCalled();
  });

  it('should handle successful login', () => {
    const mockResponse = {
      msg: 'Login successful',
      tokens: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token'
      }
    };
    
    spyOn(router, 'navigate');
    spyOn(snackBar, 'open');
    
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/users/login/');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'mock-access-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
    expect(snackBar.open).toHaveBeenCalledWith('Login successful!', 'Close', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error with detail message', () => {
    spyOn(snackBar, 'open');
    
    component.form.patchValue({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/users/login/');
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    
    expect(component.loading).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('Error: Invalid credentials', 'Close', { duration: 5000 });
  });

  it('should handle generic login error', () => {
    spyOn(snackBar, 'open');
    
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    const req = httpMock.expectOne('http://127.0.0.1:8000/api/users/login/');
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    
    expect(component.loading).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('Error: An error occurred', 'Close', { duration: 5000 });
  });
});
