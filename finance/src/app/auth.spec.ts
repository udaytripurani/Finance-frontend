import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signUp', () => {
    it('should send POST request to signup endpoint', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = { message: 'User created successfully' };

      service.signUp(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/signup/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });

    it('should handle signup errors', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const errorResponse = { detail: 'Email already exists' };

      service.signUp(userData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Email already exists');
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/signup/');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should send POST request to login endpoint', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = { 
        message: 'Login successful',
        token: 'mock-token'
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login errors', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const errorResponse = { detail: 'Invalid credentials' };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Invalid credentials');
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login/');
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
