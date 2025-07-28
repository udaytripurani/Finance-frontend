import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description?: string;
}

interface Budget {
  id: number;
  name: string;
  amount: number;
  category: number;
  category_name?: string;
  start_date: string;
  end_date: string;
  spent_amount?: number;
  remaining_amount?: number;
  percentage_used?: number;
}

interface Transaction {
  id: number;
  amount: number;
  category: number;
  category_name?: string;
  description: string;
  date: string | Date;
  type: 'income' | 'expense';
  is_recurring?: boolean;
  recurrence_type?: string;
}

interface RecurringTransaction {
  id?: number;
  name: string;
  amount: number;
  day: string;
  month?: string;
  type: string;
}

interface ProcessedTransaction extends Transaction {
  date: Date;
  category_name: string;
}

// Updated interface to match actual API response
interface BalanceResponse {
  total_income: number;
  total_expense: number;
  balance: number;
  // These monthly fields are NOT in the API response
  // monthly_income?: number;
  // monthly_expense?: number;
  // monthly_balance?: number;
}

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
export class DashboardComponent implements OnInit {
  private apiUrl = environment.apiUrl; // Use environment variable for API URL
  private token = localStorage.getItem('access_token');
  
  // Dashboard data
  income = 0;
  expenses = 0;
  savings = 0;
  balance: BalanceResponse | null = null;
  
  // Collections
  categories: Category[] = [];
  budgets: Budget[] = [];
  incomeTransactions: Transaction[] = [];
  expenseTransactions: Transaction[] = [];
  recentTransactions: ProcessedTransaction[] = [];
  recurringTransactions: RecurringTransaction[] = [];
  
  // Chart configuration
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  
  // Chart view dimensions
  chartView: [number, number] = [380, 280];
  lineChartView: [number, number] = [500, 280];
  
  // Chart data
  categoryData: any[] = [];
  dailySpending: any[] = [];
  budgetCategories: any[] = [];
  
  // Loading state
  loading = true;
  error: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  private getHeaders(): HttpHeaders {
    if (!this.token) {
      this.error = 'Authentication token missing';
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }
  
  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Load all required data
    forkJoin({
      categories: this.getCategories().pipe(
        catchError(err => {
          console.error('Categories API error:', err);
          this.error = 'Failed to load categories';
          return of([]);
        })
      ),
      budgets: this.getBudgets().pipe(
        catchError(err => {
          console.error('Budgets API error:', err);
          return of([]);
        })
      ),
      income: this.getIncomeTransactions(currentYear, currentMonth).pipe(
        catchError(err => {
          console.error('Income API error:', err);
          return of([]);
        })
      ),
      expenses: this.getExpenseTransactions(currentYear, currentMonth).pipe(
        catchError(err => {
          console.error('Expenses API error:', err);
          return of([]);
        })
      ),
      balance: this.getBalance().pipe(
        catchError(err => {
          console.error('Balance API error:', err);
          return of({
            total_income: 0,
            total_expense: 0,
            balance: 0
            // No monthly fields here since they don't exist in the API
          });
        })
      )
    }).subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.budgets = data.budgets;
        this.incomeTransactions = data.income;
        this.expenseTransactions = data.expenses;
        this.balance = data.balance;
        this.processData();
        this.loadRecurringTransactions(); // Load recurring transactions
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard ', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }
  
  // ADDED: Method to load recurring transactions
  private loadRecurringTransactions(): void {
    this.getRecurringTransactions().subscribe({
      next: (transactions) => {
        this.recurringTransactions = transactions;
      },
      error: (error) => {
        console.error('Error loading recurring transactions:', error);
        // Don't fail the whole dashboard for this
        this.recurringTransactions = [];
      }
    });
  }
  
  // ADDED: API call for recurring transactions
  private getRecurringTransactions(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>(`${this.apiUrl}/recurring-transactions/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }
  
  private getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`, {
      headers: this.getHeaders()
    });
  }
  
  private getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budgets/`, {
      headers: this.getHeaders()
    });
  }
  
  private getIncomeTransactions(year?: number, month?: number): Observable<Transaction[]> {
    let url = `${this.apiUrl}/transactions/income/`;
    const params: string[] = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<Transaction[]>(url, {
      headers: this.getHeaders()
    });
  }
  
  private getExpenseTransactions(year?: number, month?: number): Observable<Transaction[]> {
    let url = `${this.apiUrl}/transactions/expense/`;
    const params: string[] = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<Transaction[]>(url, {
      headers: this.getHeaders()
    });
  }
  
  private getBalance(): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.apiUrl}/transactions/balance/`, {
      headers: this.getHeaders()
    });
  }
  
  private processData(): void {
    // Process balance data
    if (this.balance) {
      // FIX: Use the actual fields returned by the API
      // The API returns total_income/total_expense, not monthly_income/monthly_expense
      this.income = this.parseNumber(this.balance.total_income);
      this.expenses = this.parseNumber(this.balance.total_expense);
      this.savings = this.parseNumber(this.balance.balance);
    } else {
      this.income = 0;
      this.expenses = 0;
      this.savings = 0;
    }
    
    // Process categories for chart
    this.processCategoryData();
    
    // Process budget data
    this.processBudgetData();
    
    // Process recent transactions
    this.processRecentTransactions();
    
    // Process daily spending trend
    this.processDailySpending();
  }
  
  /**
   * Helper method to safely parse values to numbers
   * Handles numbers, strings, null, and undefined values
   */
  private parseNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    
    return 0;
  }
  
  private processCategoryData(): void {
    const categoryMap = new Map<number, { name: string; total: number }>();
    
    // Initialize categories
    this.categories.forEach(cat => {
      if (cat.type === 'expense') {
        categoryMap.set(cat.id, { name: cat.name, total: 0 });
      }
    });
    
    // Sum expenses by category
    this.expenseTransactions.forEach(transaction => {
      const category = categoryMap.get(transaction.category);
      if (category) {
        category.total += transaction.amount;
      }
    });
    
    // Convert to chart data
    this.categoryData = Array.from(categoryMap.values())
      .filter(cat => cat.total > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.total
      }));
  }
  
  private processBudgetData(): void {
    this.budgetCategories = this.budgets.map(budget => {
      const categoryName = this.categories.find(cat => cat.id === budget.category)?.name || 'Unknown';
      
      // Calculate spent amount for this budget's category
      const spent = this.expenseTransactions
        .filter(transaction => transaction.category === budget.category)
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      
      return {
        name: categoryName,
        used: spent,
        limit: budget.amount
      };
    });
  }
  
  private processRecentTransactions(): void {
    // Combine income and expense transactions
    const allTransactions: (Transaction & { type: 'income' | 'expense' })[] = [
      ...this.incomeTransactions.map(t => ({ ...t, type: 'income' as const })),
      ...this.expenseTransactions.map(t => ({ ...t, type: 'expense' as const }))
    ];
    
    // Sort by date (most recent first) and take top 5
    this.recentTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(transaction => {
        const category = this.categories.find(cat => cat.id === transaction.category);
        return {
          ...transaction,
          category_name: category?.name || 'Unknown',
          date: new Date(transaction.date)
        } as ProcessedTransaction;
      });
  }
  
  private processDailySpending(): void {
    // Group expenses by date
    const dailySpendingMap = new Map<string, number>();
    this.expenseTransactions.forEach(transaction => {
      const transactionDate = typeof transaction.date === 'string' ? 
        new Date(transaction.date) : transaction.date;
      const date = transactionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      });
      const current = dailySpendingMap.get(date) || 0;
      dailySpendingMap.set(date, current + transaction.amount);
    });
    
    // Convert to chart format
    const sortedEntries = Array.from(dailySpendingMap.entries())
      .sort((a, b) => {
        // Properly parse the date without hardcoding year
        const [monthA, dayA] = a[0].split(' ');
        const [monthB, dayB] = b[0].split(' ');
        const dateA = new Date(`${monthA} ${dayA}, ${new Date().getFullYear()}`);
        const dateB = new Date(`${monthB} ${dayB}, ${new Date().getFullYear()}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-7); // Last 7 days
    
    this.dailySpending = [{
      name: 'Daily Spending',
      series: sortedEntries.map(([date, amount]) => ({
        name: date,
        value: amount
      }))
    }];
  }
  
  // Utility methods
  getBudgetStatus(category: any): string {
    const percentage = (category.used / category.limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'safe';
  }
  
  getBudgetColor(category: any): string {
    const percentage = (category.used / category.limit) * 100;
    if (percentage >= 90) return 'warn';
    if (percentage >= 75) return 'accent';
    return 'primary';
  }
  
  getCategoryIcon(category: string | number): string {
    let categoryName: string;
    if (typeof category === 'number') {
      const cat = this.categories.find(c => c.id === category);
      categoryName = cat?.name || 'Unknown';
    } else {
      categoryName = category;
    }
    
    const icons: { [key: string]: string } = {
      'Food': 'restaurant',
      'Food & Dining': 'restaurant',
      'Transport': 'directions_car',
      'Shopping': 'shopping_bag',
      'Utilities': 'home',
      'Entertainment': 'movie',
      'Health': 'local_hospital',
      'Salary': 'account_balance_wallet',
      'Investment': 'trending_up'
    };
    
    return icons[categoryName] || 'category';
  }
  
  // Add these helper methods for the template
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  formatChange(value: number): string {
    const absValue = Math.abs(value);
    return value > 0 ? `+${absValue.toFixed(1)}%` : 
           value < 0 ? `-${absValue.toFixed(1)}%` : '0%';
  }
  
  trackTransaction(index: number, item: any): any {
    return item.id;
  }
  
  // Action methods
  onAddTransaction(): void {
    console.log('Add transaction clicked');
  }
  
  onPeriodChange(period: string): void {
    console.log('Period changed to:', period);
    this.loadDashboardData();
  }
  
  onChartPeriodChange(period: string): void {
    console.log('Chart period changed to:', period);
    this.loadDashboardData();
  }
  
  refreshData(): void {
    this.loadDashboardData();
  }
}