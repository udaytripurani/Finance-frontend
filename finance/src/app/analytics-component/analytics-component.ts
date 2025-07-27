import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
interface MonthlySummary {
  income_total: number;
  expense_total: number;
  net_savings: number;
  budget_alerts: BudgetAlert[];
}
interface BudgetAlert {
  category: string;
  spent: number;
  limit: number;
  status: string;
}
interface CategoryBreakdown {
  category: string;
  amount: number;
}
interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type?: 'income' | 'expense';
  category: any; // Can be object or number
  is_recurring: boolean;
  recurrence_type: string | null;
}
interface Budget {
  id: number;
  name: string;
  amount: string;
  category: any; // Can be object or number
  start_date: string;
  end_date: string;
  spent_amount?: number;
  remaining_amount?: number;
  is_exceeded?: boolean;
}
interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description?: string;
}
@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './analytics-component.html',
  styleUrls: ['./analytics-component.scss']
})
export class AnalyticsComponent implements OnInit {
  filterForm: FormGroup;
  monthlySummary: MonthlySummary | null = null;
  categoryBreakdown: CategoryBreakdown[] = [];
  historicalData: any[] = [];
  comparisonData: any = null;
  recurringTransactions: Transaction[] = [];
  budgetWarnings: Budget[] = [];
  currentBalance: number = 0;
  isLoading = false;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  private baseUrl = 'http://localhost:8000/api'; // Update with your Django backend URL
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}` // Get token from localStorage or service
    })
  };
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = [2023, 2024, 2025, 2026];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      month: [this.selectedMonth, [Validators.required, Validators.min(1), Validators.max(12)]],
      year: [this.selectedYear, [Validators.required, Validators.min(2020), Validators.max(2030)]]
    });
  }
  ngOnInit(): void {
    this.loadAnalytics();
    // Watch for form changes
    this.filterForm.valueChanges.subscribe(values => {
      if (this.filterForm.valid) {
        this.selectedMonth = values.month;
        this.selectedYear = values.year;
        this.loadAnalytics();
      }
    });
  }
  private getAuthToken(): string {
    // Get token from localStorage, sessionStorage, or your auth service
    return localStorage.getItem('access_token') || '';
  }
  
  // ADD THIS MISSING METHOD (fixes original error)
  private getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }
  
  loadAnalytics(): void {
    this.isLoading = true;
    // Load all data concurrently
    forkJoin({
      incomes: this.getIncomeTransactions(),
      expenses: this.getExpenseTransactions(),
      budgets: this.getBudgets(),
      categories: this.getCategories(),  // Now this method exists
      balance: this.getCurrentBalance(),
      budgetWarnings: this.getBudgetWarnings(),
      historicalIncomes: this.getHistoricalIncomes(),
      historicalExpenses: this.getHistoricalExpenses()
    }).pipe(
      catchError(error => {
        console.error('Error loading analytics data:', error);
        this.isLoading = false;
        return of({ 
          incomes: [], expenses: [], budgets: [], categories: [], 
          balance: { current_balance: 0 }, budgetWarnings: [],
          historicalIncomes: [], historicalExpenses: []
        });
      })
    ).subscribe(data => {
      this.processAnalyticsData(data);
      this.isLoading = false;
    });
  }
  private getIncomeTransactions(): Observable<Transaction[]> {
    const params = `?year=${this.selectedYear}&month=${this.selectedMonth}`;
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/income/${params}`, this.httpOptions)
      .pipe(
        map(transactions => transactions.map(t => ({ ...t, type: 'income' as const }))),
        catchError(error => {
          console.error('Error fetching income transactions:', error);
          return of([]);
        })
      );
  }
  private getExpenseTransactions(): Observable<Transaction[]> {
    const params = `?year=${this.selectedYear}&month=${this.selectedMonth}`;
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/expense/${params}`, this.httpOptions)
      .pipe(
        map(transactions => transactions.map(t => ({ ...t, type: 'expense' as const }))),
        catchError(error => {
          console.error('Error fetching expense transactions:', error);
          return of([]);
        })
      );
  }
  private getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets/`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching budgets:', error);
          return of([]);
        })
      );
  }
  private getCurrentBalance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/transactions/balance/`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching balance:', error);
          return of({ current_balance: 0 });
        })
      );
  }
  private getBudgetWarnings(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.baseUrl}/budgets/warnings`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching budget warnings:', error);
          return of([]);
        })
      );
  }
  private getHistoricalIncomes(): Observable<Transaction[]> {
    // Get last 6 months of income data
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/income/`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching historical incomes:', error);
          return of([]);
        })
      );
  }
  private getHistoricalExpenses(): Observable<Transaction[]> {
    // Get last 6 months of expense data
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions/expense/`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error fetching historical expenses:', error);
          return of([]);
        })
      );
  }
  private getRecurringTransactions(): Observable<Transaction[]> {
    // Get all recurring transactions
    const incomeParams = '?is_recurring=true';
    const expenseParams = '?is_recurring=true';
    return forkJoin({
      recurringIncomes: this.http.get<Transaction[]>(`${this.baseUrl}/transactions/income/${incomeParams}`, this.httpOptions),
      recurringExpenses: this.http.get<Transaction[]>(`${this.baseUrl}/transactions/expense/${expenseParams}`, this.httpOptions)
    }).pipe(
      map(data => [
        ...data.recurringIncomes.map(t => ({ ...t, type: 'income' as const })),
        ...data.recurringExpenses.map(t => ({ ...t, type: 'expense' as const }))
      ]),
      catchError(error => {
        console.error('Error fetching recurring transactions:', error);
        return of([]);
      })
    );
  }
  
  // ADD THESE METHODS TO FIX TEMPLATE ERRORS
  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }
  
  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
  
  private processAnalyticsData(data: any): void {
    const { 
      incomes, expenses, budgets, categories, balance, 
      budgetWarnings, historicalIncomes, historicalExpenses 
    } = data;
    // Set current balance
    this.currentBalance = balance.current_balance || 0;
    // Set budget warnings
    this.budgetWarnings = budgetWarnings;
    // Create category lookup map
    const categoryMap = new Map<number, Category>();
    categories.forEach((cat: Category) => {
      categoryMap.set(cat.id, cat);
    });
    // Filter transactions for selected month/year
    const filteredIncomes = this.filterTransactionsByDate(incomes);
    const filteredExpenses = this.filterTransactionsByDate(expenses);
    // Calculate totals
    const incomeTotal = filteredIncomes.reduce((sum, t) => sum + Number(t.amount), 0);
    const expenseTotal = filteredExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
    // Calculate category breakdown
    this.calculateCategoryBreakdown(filteredExpenses, categoryMap);
    // Process historical data for trends
    this.processHistoricalData(historicalIncomes, historicalExpenses, categoryMap);
    // Calculate comparison with previous month
    this.calculateMonthComparison(historicalIncomes, historicalExpenses);
    // Filter and set recurring transactions
    this.getRecurringTransactions().subscribe(recurring => {
      this.recurringTransactions = recurring;
    });
    // Calculate budget alerts
    const budgetAlerts = this.calculateBudgetAlerts(filteredExpenses, budgets, categoryMap);
    this.monthlySummary = {
      income_total: incomeTotal,
      expense_total: expenseTotal,
      net_savings: incomeTotal - expenseTotal,
      budget_alerts: budgetAlerts
    };
  }
  private filterTransactionsByDate(transactions: Transaction[]): Transaction[] {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === this.selectedMonth && 
             transactionDate.getFullYear() === this.selectedYear;
    });
  }
  private calculateCategoryBreakdown(expenses: Transaction[], categoryMap: Map<number, Category>): void {
    const categorySpending = new Map<string, number>();
    expenses.forEach(expense => {
      const categoryId = typeof expense.category === 'object' ? expense.category.id : expense.category;
      const category = categoryMap.get(categoryId);
      const categoryName = category ? category.name : 'Unknown';
      const currentAmount = categorySpending.get(categoryName) || 0;
      categorySpending.set(categoryName, currentAmount + Number(expense.amount));
    });
    this.categoryBreakdown = Array.from(categorySpending.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }
  private calculateBudgetAlerts(expenses: Transaction[], budgets: Budget[], categoryMap: Map<number, Category>): BudgetAlert[] {
    const categorySpending = new Map<number, number>();
    // Calculate spending by category ID
    expenses.forEach(expense => {
      const categoryId = typeof expense.category === 'object' ? expense.category.id : expense.category;
      const currentSpending = categorySpending.get(categoryId) || 0;
      categorySpending.set(categoryId, currentSpending + Number(expense.amount));
    });
    // Filter budgets for current month and calculate alerts
    const currentDate = new Date();
    const budgetAlerts: BudgetAlert[] = [];
    budgets.forEach(budget => {
      const budgetStart = new Date(budget.start_date);
      const budgetEnd = new Date(budget.end_date);
      // Check if budget is active for selected month
      const selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      if (selectedDate >= budgetStart && selectedDate <= budgetEnd) {
        const categoryId = typeof budget.category === 'object' ? budget.category.id : budget.category;
        const category = categoryMap.get(categoryId);
        const categoryName = category ? category.name : 'Unknown';
        const spent = categorySpending.get(categoryId) || 0;
        const limit = Number(budget.amount);
        let status = 'On Track';
        if (spent >= limit) {
          status = 'Over Budget';
        } else if (spent >= limit * 0.8) {
          status = 'Near Limit';
        }
        if (spent > 0) {
          budgetAlerts.push({
            category: categoryName,
            spent,
            limit,
            status
          });
        }
      }
    });
    return budgetAlerts;
  }
  private processHistoricalData(incomes: Transaction[], expenses: Transaction[], categoryMap: Map<number, Category>): void {
    // Group transactions by month for the last 6 months
    const monthlyData = new Map<string, { income: number; expense: number; month: string }>();
    // Get last 6 months
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.set(monthKey, {
        income: 0,
        expense: 0,
        month: monthName
      });
    }
    // Process income data
    incomes.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        data.income += Number(transaction.amount);
      }
    });
    // Process expense data
    expenses.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        data.expense += Number(transaction.amount);
      }
    });
    this.historicalData = Array.from(monthlyData.values());
  }
  private calculateMonthComparison(incomes: Transaction[], expenses: Transaction[]): void {
    const currentDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const previousDate = new Date(currentDate);
    previousDate.setMonth(previousDate.getMonth() - 1);
    // Current month data (already calculated in monthlySummary)
    const currentIncome = incomes
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const currentExpense = expenses
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    // Previous month data
    const previousIncome = incomes
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === previousDate.getMonth() && date.getFullYear() === previousDate.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const previousExpense = expenses
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === previousDate.getMonth() && date.getFullYear() === previousDate.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
    this.comparisonData = {
      current: {
        income: currentIncome,
        expense: currentExpense,
        savings: currentIncome - currentExpense
      },
      previous: {
        income: previousIncome,
        expense: previousExpense,
        savings: previousIncome - previousExpense
      },
      changes: {
        income: previousIncome ? ((currentIncome - previousIncome) / previousIncome * 100) : 0,
        expense: previousExpense ? ((currentExpense - previousExpense) / previousExpense * 100) : 0,
        savings: previousIncome - previousExpense ? (((currentIncome - currentExpense) - (previousIncome - previousExpense)) / Math.abs(previousIncome - previousExpense) * 100) : 0
      }
    };
  }
  // Utility methods
  getComparisonIcon(change: number): string {
    if (change > 0) return 'fa-arrow-up text-success';
    if (change < 0) return 'fa-arrow-down text-danger';
    return 'fa-minus text-muted';
  }
  getComparisonClass(type: 'income' | 'expense' | 'savings', change: number): string {
    if (type === 'expense') {
      return change > 0 ? 'text-danger' : 'text-success';
    }
    return change > 0 ? 'text-success' : 'text-danger';
  }
  getBudgetUtilization(): number {
    if (!this.monthlySummary?.budget_alerts.length) return 0;
    const totalBudget = this.monthlySummary.budget_alerts.reduce((sum, alert) => sum + alert.limit, 0);
    const totalSpent = this.monthlySummary.budget_alerts.reduce((sum, alert) => sum + alert.spent, 0);
    return totalBudget ? (totalSpent / totalBudget * 100) : 0;
  }
  getTopExpenseCategory(): string {
    if (!this.categoryBreakdown.length) return 'N/A';
    return this.categoryBreakdown[0].category;
  }
  getAverageDailyExpense(): number {
    if (!this.monthlySummary) return 0;
    return this.monthlySummary.expense_total / this.getDaysInMonth(this.selectedYear, this.selectedMonth);
  }
  exportDetailedReport(): void {
    this.isLoading = true;
    forkJoin({
      incomes: this.getIncomeTransactions(),
      expenses: this.getExpenseTransactions(),
      budgets: this.getBudgets(),
      categories: this.getCategories(),
      balance: this.getCurrentBalance()
    }).subscribe(data => {
      const { incomes, expenses, budgets, categories, balance } = data;
      // Create comprehensive report
      const report = {
        reportDate: new Date().toISOString(),
        period: `${this.monthNames[this.selectedMonth - 1]} ${this.selectedYear}`,
        summary: this.monthlySummary,
        currentBalance: balance.current_balance,
        transactions: {
          incomes: this.filterTransactionsByDate(incomes),
          expenses: this.filterTransactionsByDate(expenses)
        },
        categoryBreakdown: this.categoryBreakdown,
        budgetAnalysis: budgets,
        comparison: this.comparisonData,
        historicalTrends: this.historicalData
      };
      // Generate detailed CSV
      const csvContent = this.generateDetailedCSV(report);
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${this.selectedYear}_${this.selectedMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      this.isLoading = false;
    }, error => {
      console.error('Error generating detailed report:', error);
      this.isLoading = false;
    });
  }
  private generateDetailedCSV(report: any): string {
    let csv = 'FINANCIAL ANALYTICS REPORT\n';
    csv += `Report Generated: ${new Date().toLocaleString()}\n`;
    csv += `Period: ${report.period}\n`;
    csv += 'SUMMARY\n';
    csv += 'Metric,Amount\n';
    csv += `Total Income,${report.summary.income_total}\n`;
    csv += `Total Expenses,${report.summary.expense_total}\n`;
    csv += `Net Savings,${report.summary.net_savings}\n`;
    csv += `Current Balance,${report.currentBalance}\n`;
    if (report.categoryBreakdown.length > 0) {
      csv += 'CATEGORY BREAKDOWN\n';
      csv += 'Category,Amount,Percentage\n';
      report.categoryBreakdown.forEach((item: any) => {
        const percentage = (item.amount / report.summary.expense_total * 100).toFixed(1);
        csv += `${item.category},${item.amount},${percentage}%\n`;
      });
      csv += '\n';
    }
    if (report.summary.budget_alerts.length > 0) {
      csv += 'BUDGET ALERTS\n';
      csv += 'Category,Spent,Limit,Status,Utilization\n';
      report.summary.budget_alerts.forEach((alert: any) => {
        const utilization = ((alert.spent / alert.limit) * 100).toFixed(1);
        csv += `${alert.category},${alert.spent},${alert.limit},${alert.status},${utilization}%\n`;
      });
      csv += '\n';
    }
    return csv;
  }
  exportToCsv(): void {
    this.isLoading = true;
    // Get all transactions for the selected month
    forkJoin({
      incomes: this.getIncomeTransactions(),
      expenses: this.getExpenseTransactions(),
      categories: this.getCategories()
    }).subscribe(data => {
      const { incomes, expenses, categories } = data;
      // Create category lookup
      const categoryMap = new Map<number, Category>();
      categories.forEach((cat: Category) => {
        categoryMap.set(cat.id, cat);
      });
      // Combine and filter transactions
      const allTransactions = [
        ...this.filterTransactionsByDate(incomes),
        ...this.filterTransactionsByDate(expenses)
      ];
      // Generate CSV content
      const csvHeader = 'ID,Amount,Description,Date,Type,Category,Is Recurring,Recurrence Type\n';
      const csvRows = allTransactions.map(t => {
        const categoryId = typeof t.category === 'object' ? t.category.id : t.category;
        const category = categoryMap.get(categoryId);
        const categoryName = category ? category.name : 'Unknown';
        return `${t.id},${t.amount},"${t.description}",${t.date},${t.type},"${categoryName}",${t.is_recurring},${t.recurrence_type || ''}`;
      }).join('\n');
      const csvContent = csvHeader + csvRows;
      // Create and download file
      const startDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = new Date(this.selectedYear, this.selectedMonth, 0).toISOString().split('T')[0];
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      this.isLoading = false;
    }, error => {
      console.error('Error exporting CSV:', error);
      this.isLoading = false;
    });
  }
  getBudgetAlertClass(status: string): string {
    switch (status) {
      case 'Over Budget':
        return 'alert-danger';
      case 'Near Limit':
        return 'alert-warning';
      default:
        return 'alert-success';
    }
  }
  getProgressBarClass(status: string): string {
    switch (status) {
      case 'Over Budget':
        return 'bg-danger';
      case 'Near Limit':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  }
  calculateProgressPercentage(spent: number, limit: number): number {
    return Math.min((spent / limit) * 100, 100);
  }
  getCategoryColor(index: number): string {
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', 
      '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'
    ];
    return colors[index % colors.length];
  }
}