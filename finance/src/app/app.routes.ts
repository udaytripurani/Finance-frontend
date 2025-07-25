import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { DashboardComponent } from './dashboard/dashboard';
 import { ExpenseManagementComponent } from './expenses/expenses';
 import { AnalyticsComponent } from './analytics-component/analytics-component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {path: 'dashboard', component: DashboardComponent },
   {path: 'expenses',component:ExpenseManagementComponent},
   {path: 'analytics', component: AnalyticsComponent }
];
