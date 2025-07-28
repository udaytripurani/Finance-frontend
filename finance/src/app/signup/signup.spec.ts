import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SignupComponent } from './signup';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SignupComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatSnackBarModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
    
    // Mock form reset to prevent errors
    spyOn(component.form, 'reset');
    
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.form.get('username')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const usernameControl = component.form.get('username');
    const emailControl = component.form.get('email');
    const passwordControl = component.form.get('password');
    
    usernameControl?.setValue('');
    emailControl?.setValue('');
    passwordControl?.setValue('');
    
    expect(usernameControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
    expect(passwordControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);
    
    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate username length', () => {
    const usernameControl = component.form.get('username');
    
    usernameControl?.setValue('ab'); // too short
    expect(usernameControl?.hasError('minlength')).toBe(true);
    
    usernameControl?.setValue('validusername');
    expect(usernameControl?.valid).toBe(true);
  });

  it('should validate password length', () => {
    const passwordControl = component.form.get('password');
    
    passwordControl?.setValue('123'); // too short
    expect(passwordControl?.hasError('minlength')).toBe(true);
    
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

  it('should handle successful signup', () => {
    const mockResponse = { message: 'User registered successfully' };
    
    spyOn(router, 'navigate');
    spyOn(snackBar, 'open');
    
    component.form.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    const req = httpMock.expectOne('http://localhost:3000/api/auth/signup/');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    
    expect(snackBar.open).toHaveBeenCalledWith('User registered successfully', 'Close', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.loading).toBe(false);
  });

  it('should handle signup error', () => {
    spyOn(snackBar, 'open');
    
    component.form.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    component.onSubmit();
    
    const req = httpMock.expectOne('http://localhost:3000/api/auth/signup/');
    req.flush({ detail: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    
    expect(component.loading).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('Error: Email already exists', 'Close', { duration: 5000 });
  });
});
