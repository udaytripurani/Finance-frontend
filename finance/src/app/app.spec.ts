import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { App } from './app';
import { Router, NavigationEnd } from '@angular/router';
import { of } from 'rxjs';

describe('App', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
    
    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title "finance"', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect((app as any).title()).toBe('finance');
  });

  it('should show navbar by default', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showNavbar).toBe(true);
  });

  it('should hide navbar on login route', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Simulate navigation to login
    const navigationEnd = new NavigationEnd(1, '/login', '/login');
    spyOn(router.events, 'pipe').and.returnValue(of(navigationEnd));
    
    // Trigger the constructor logic by creating a new instance
    const newApp = new App(router);
    expect(newApp.showNavbar).toBe(false);
  });

  it('should hide navbar on signup route', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Simulate navigation to signup
    const navigationEnd = new NavigationEnd(1, '/signup', '/signup');
    spyOn(router.events, 'pipe').and.returnValue(of(navigationEnd));
    
    // Trigger the constructor logic by creating a new instance
    const newApp = new App(router);
    expect(newApp.showNavbar).toBe(false);
  });

  it('should show navbar on other routes', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Simulate navigation to dashboard
    const navigationEnd = new NavigationEnd(1, '/dashboard', '/dashboard');
    spyOn(router.events, 'pipe').and.returnValue(of(navigationEnd));
    
    // Trigger the constructor logic by creating a new instance
    const newApp = new App(router);
    expect(newApp.showNavbar).toBe(true);
  });
});
