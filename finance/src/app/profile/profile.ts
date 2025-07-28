// profile-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// 1. Import the necessary modules to fix NG8103 and NG8002 errors
import { CommonModule } from '@angular/common'; // Required for *ngIf, *ngFor
import { FormsModule } from '@angular/forms';   // Required for [(ngModel)]

interface UserProfile {
  id?: number;
  email: string;
  full_name: string;
  phone?: string;
  location?: string;
}

interface NotificationSettings {
  dailyReminders: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  expenseUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

@Component({
  selector: 'app-profile-settings',
  // 2. Include the imported modules in the @Component imports array
  // This assumes you are using Standalone Components (Angular 14+)
  // If using NgModules, add these to your NgModule's imports instead.
  imports: [
    CommonModule, // <-- Add CommonModule here for *ngIf, *ngFor
    FormsModule   // <-- Add FormsModule here for [(ngModel)]
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
  // If using standalone components, you might also need:
  // standalone: true
})
export class ProfileSettingsComponent implements OnInit {
  // API Configuration
  private apiUrl = 'http://localhost:8000/api'; // Replace with your actual API URL
  private token = localStorage.getItem('access_token'); // Assuming token is stored in localStorage

  // Profile Data (from API)
  profile: UserProfile = {
    email: '',
    full_name: '',
    phone: '',
    location: ''
  };
  tempProfile: UserProfile = { ...this.profile };
  isEditing = false;
  isLoading = false;

  // Currency Settings (hardcoded)
  selectedCurrency = 'USD';
  currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
  ];

  // Notification Settings (hardcoded)
  notifications: NotificationSettings = {
    dailyReminders: true,
    budgetAlerts: true,
    weeklyReports: false,
    expenseUpdates: true,
    emailNotifications: true,
    pushNotifications: true
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadProfile();
    // Load local settings (currency, notifications) from localStorage
    this.loadLocalSettings();
  }

  // HTTP Headers with Authorization
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  // Load user profile from API
  loadProfile(): void {
    this.isLoading = true;
    this.http.get<UserProfile>(`${this.apiUrl}/users/profile/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.profile = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone || '',
          location: data.location || ''
        };
        this.tempProfile = { ...this.profile };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.isLoading = false;
        // Handle error (show toast, etc.)
      }
    });
  }

  // Update user profile via API
  updateProfile(): void {
    this.isLoading = true;
    const updateData = {
      full_name: this.tempProfile.full_name,
      phone: this.tempProfile.phone,
      location: this.tempProfile.location
    };
    this.http.put<UserProfile>(`${this.apiUrl}/users/profile/`, updateData, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.profile = { ...this.tempProfile };
        this.isEditing = false;
        this.isLoading = false;
        // Show success message
        console.log('Profile updated successfully');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.isLoading = false;
        // Handle error (show toast, etc.)
      }
    });
  }

  // Toggle edit mode
  toggleEdit(): void {
    if (this.isEditing) {
      this.updateProfile(); // Save changes when toggling off edit mode
    } else {
      this.tempProfile = { ...this.profile }; // Reset temp data when entering edit mode
      this.isEditing = true;
    }
  }

  // Cancel editing
  cancelEdit(): void {
    this.tempProfile = { ...this.profile }; // Revert temp data
    this.isEditing = false;
  }

  // Get user initials for avatar
  getUserInitials(): string {
    if (!this.profile.full_name) return 'U'; // Default if no name
    return this.profile.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Get selected currency details
  getSelectedCurrency() {
    return this.currencies.find(c => c.code === this.selectedCurrency);
  }

  // Handle notification toggle
  toggleNotification(key: keyof NotificationSettings): void {
    this.notifications[key] = !this.notifications[key];
    // Optionally save immediately on toggle
    // this.saveNotificationSettings();
  }

  // Save currency settings (hardcoded - just local storage)
  saveCurrencySettings(): void {
    localStorage.setItem('selectedCurrency', this.selectedCurrency);
    console.log('Currency settings saved');
    // TODO: Implement actual API call to save currency setting if needed
  }

  // Save notification settings (hardcoded - just local storage)
  saveNotificationSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.notifications));
    console.log('Notification settings saved');
    // TODO: Implement actual API call to save notification settings if needed
  }

  // Load settings from localStorage on init
  loadLocalSettings(): void {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && this.currencies.some(c => c.code === savedCurrency)) {
      this.selectedCurrency = savedCurrency;
    }
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      try {
        this.notifications = { ...this.notifications, ...JSON.parse(savedNotifications) };
      } catch (e) {
        console.error('Error parsing saved notification settings:', e);
        // Handle potential parsing errors (e.g., clear invalid data)
      }
    }
  }
}