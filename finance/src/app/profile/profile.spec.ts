import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileSettingsComponent } from './profile';

describe('ProfileSettingsComponent', () => {
  let component: ProfileSettingsComponent;
  let fixture: ComponentFixture<ProfileSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileSettingsComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsComponent);
    component = fixture.componentInstance;
    
    // Mock localStorage to prevent authentication errors
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default profile data', () => {
    expect(component.profile.email).toBe('');
    expect(component.profile.full_name).toBe('');
    expect(component.isEditing).toBe(false);
  });

  it('should have currencies array', () => {
    expect(Array.isArray(component.currencies)).toBe(true);
    expect(component.currencies.length).toBeGreaterThan(0);
  });

  it('should have notifications object', () => {
    expect(component.notifications).toBeDefined();
    expect(typeof component.notifications).toBe('object');
  });

  it('should initialize selectedCurrency as USD', () => {
    expect(component.selectedCurrency).toBe('USD');
  });

  it('should initialize isEditing as false', () => {
    expect(component.isEditing).toBe(false);
  });

  it('should initialize isLoading as false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should have tempProfile object', () => {
    expect(component.tempProfile).toBeDefined();
    expect(typeof component.tempProfile).toBe('object');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditing).toBe(false);
    
    component.toggleEdit();
    
    expect(component.isEditing).toBe(true);
  });

  it('should cancel edit mode', () => {
    component.isEditing = true;
    
    component.cancelEdit();
    
    expect(component.isEditing).toBe(false);
  });

  it('should get user initials', () => {
    component.profile.full_name = 'John Doe';
    
    const initials = component.getUserInitials();
    
    expect(initials).toBe('JD');
  });

  it('should get user initials for single name', () => {
    component.profile.full_name = 'John';
    
    const initials = component.getUserInitials();
    
    expect(initials).toBe('J');
  });

  it('should get user initials for empty name', () => {
    component.profile.full_name = '';
    
    const initials = component.getUserInitials();
    
    // The method might return 'U' for empty names (User)
    expect(initials).toBe('U');
  });
});
