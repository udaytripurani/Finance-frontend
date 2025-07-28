import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar';
import { Router } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user info from localStorage', () => {
    spyOn(localStorage, 'getItem').and.returnValue('{"name": "testuser"}');
    
    // Trigger the getter
    const user = component.user;
    
    expect(user.name).toBe('testuser');
  });

  it('should handle missing user info', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    // Trigger the getter
    const user = component.user;
    
    expect(user).toBe(null);
  });

  it('should logout and clear localStorage', () => {
    spyOn(localStorage, 'removeItem');
    spyOn(router, 'navigate');
    
    component.logout();
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBe(false);
    
    component.toggleMenu();
    
    expect(component.isMenuOpen).toBe(true);
    
    component.toggleMenu();
    
    expect(component.isMenuOpen).toBe(false);
  });

  it('should close mobile menu', () => {
    component.isMenuOpen = true;
    
    component.closeMobileMenu();
    
    expect(component.isMenuOpen).toBe(false);
  });

  it('should check if user is logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
    
    expect(component.isLoggedIn).toBe(true);
  });

  it('should check if user is not logged in', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    expect(component.isLoggedIn).toBe(false);
  });
});
