import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonToggleModule,
    RouterModule,
    NgxChartsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  // Monthly Summary
  income = 50000;
  expenses = 32000;
  savings = this.income - this.expenses;

  // Chart configuration
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  // Chart view dimensions
  chartView: [number, number] = [380, 280];
  lineChartView: [number, number] = [500, 280];

  // Pie Chart: Spending by Category
  categoryData = [
    { name: 'Food', value: 10000 },
    { name: 'Transport', value: 5000 },
    { name: 'Shopping', value: 7000 },
    { name: 'Utilities', value: 3000 },
    { name: 'Entertainment', value: 4000 },
    { name: 'Health', value: 3000 }
  ];

  // Line Chart: Daily Spending Trend
  dailySpending = [
    {
      name: 'Daily Spending',
      series: [
        { name: 'Jul 17', value: 4500 },
        { name: 'Jul 18', value: 3700 },
        { name: 'Jul 19', value: 4200 },
        { name: 'Jul 20', value: 3000 },
        { name: 'Jul 21', value: 5200 },
        { name: 'Jul 22', value: 6100 },
        { name: 'Jul 23', value: 3300 }
      ]
    }
  ];

  // Budget Progress
  budgetCategories = [
    { name: 'Food', used: 10000, limit: 12000 },
    { name: 'Transport', used: 5000, limit: 6000 },
    { name: 'Shopping', used: 7000, limit: 8000 },
    { name: 'Utilities', used: 3000, limit: 4000 },
    { name: 'Entertainment', used: 4000, limit: 5000 }
  ];

  // Recent Transactions
  recentTransactions = [
    { 
      date: new Date('2025-07-23'), 
      category: 'Food', 
      description: 'Grocery Shopping',
      amount: 1200, 
      type: 'expense' 
    },
    { 
      date: new Date('2025-07-22'), 
      category: 'Transport', 
      description: 'Uber Ride',
      amount: 800, 
      type: 'expense' 
    },
    { 
      date: new Date('2025-07-22'), 
      category: 'Salary', 
      description: 'Monthly Salary',
      amount: 50000, 
      type: 'income' 
    },
    { 
      date: new Date('2025-07-21'), 
      category: 'Shopping', 
      description: 'Clothing',
      amount: 2200, 
      type: 'expense' 
    },
    { 
      date: new Date('2025-07-20'), 
      category: 'Entertainment', 
      description: 'Movie Tickets',
      amount: 600, 
      type: 'expense' 
    }
  ];

  // Recurring Transactions
  recurringTransactions = [
    { 
      name: 'Netflix Subscription', 
      amount: 500, 
      day: '25',
      month: 'Jul',
      type: 'Monthly'
    },
    { 
      name: 'Gym Membership', 
      amount: 1000, 
      day: '28',
      month: 'Jul',
      type: 'Monthly'
    },
    { 
      name: 'Internet Bill', 
      amount: 1200, 
      day: '30',
      month: 'Jul',
      type: 'Monthly'
    },
    { 
      name: 'Phone Bill', 
      amount: 800, 
      day: '02',
      month: 'Aug',
      type: 'Monthly'
    }
  ];

  // Helper method to get budget status class
  getBudgetStatus(category: any): string {
    const percentage = (category.used / category.limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'safe';
  }

  // Helper method to get budget color for progress bar
  getBudgetColor(category: any): string {
    const percentage = (category.used / category.limit) * 100;
    if (percentage >= 90) return 'warn';
    if (percentage >= 75) return 'accent';
    return 'primary';
  }

  // Helper method to get category icon
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Food': 'restaurant',
      'Transport': 'directions_car',
      'Shopping': 'shopping_bag',
      'Utilities': 'home',
      'Entertainment': 'movie',
      'Health': 'local_hospital',
      'Salary': 'account_balance_wallet',
      'Investment': 'trending_up'
    };
    return icons[category] || 'category';
  }

  // Track by function for transactions list
  trackTransaction(index: number, item: any): any {
    return item.date + item.category + item.amount;
  }

  // Method to handle adding new transaction
  onAddTransaction(): void {
    // Implementation for adding new transaction
    console.log('Add transaction clicked');
  }

  // Method to handle period selection change
  onPeriodChange(period: string): void {
    console.log('Period changed to:', period);
    // Implementation to update data based on selected period
  }

  // Method to handle chart period toggle
  onChartPeriodChange(period: string): void {
    console.log('Chart period changed to:', period);
    // Implementation to update chart data based on selected period
  }
}