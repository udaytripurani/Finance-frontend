import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';

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
  type: 'income' | 'expense';
  category: string;
  is_recurring: boolean;
  recurrence_type: string | null;
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
  isLoading = false;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  // Hardcoded data - replace with API calls later
  private mockTransactions: Transaction[] = [
    { id: 1, amount: 5000, description: 'Salary', date: '2025-07-01', type: 'income', category: 'Salary', is_recurring: true, recurrence_type: 'monthly' },
    { id: 2, amount: 980, description: 'Grocery shopping', date: '2025-07-05', type: 'expense', category: 'Groceries', is_recurring: false, recurrence_type: null },
    { id: 3, amount: 450, description: 'Electricity bill', date: '2025-07-10', type: 'expense', category: 'Utilities', is_recurring: true, recurrence_type: 'monthly' },
    { id: 4, amount: 220, description: 'Movie tickets', date: '2025-07-15', type: 'expense', category: 'Entertainment', is_recurring: false, recurrence_type: null },
    { id: 5, amount: 300, description: 'Gas bill', date: '2025-07-08', type: 'expense', category: 'Utilities', is_recurring: true, recurrence_type: 'monthly' },
    { id: 6, amount: 150, description: 'Coffee shop', date: '2025-07-12', type: 'expense', category: 'Food & Dining', is_recurring: false, recurrence_type: null },
    { id: 7, amount: 1200, description: 'Rent', date: '2025-07-01', type: 'expense', category: 'Housing', is_recurring: true, recurrence_type: 'monthly' },
    { id: 8, amount: 200, description: 'Freelance work', date: '2025-07-20', type: 'income', category: 'Side Income', is_recurring: false, recurrence_type: null },
  ];

  private mockBudgets = [
    { category: 'Groceries', limit: 1000 },
    { category: 'Utilities', limit: 600 },
    { category: 'Entertainment', limit: 300 },
    { category: 'Food & Dining', limit: 200 },
    { category: 'Housing', limit: 1500 }
  ];

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  years = [2023, 2024, 2025, 2026];

  constructor(private fb: FormBuilder) {
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

  loadAnalytics(): void {
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      this.loadMonthlySummary();
      this.loadCategoryBreakdown();
      this.isLoading = false;
    }, 500);
  }

  private loadMonthlySummary(): void {
    // Filter transactions for selected month/year
    const filteredTransactions = this.mockTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === this.selectedMonth && 
             transactionDate.getFullYear() === this.selectedYear;
    });

    const incomeTotal = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate budget alerts
    const categorySpending = this.calculateCategorySpending(filteredTransactions);
    const budgetAlerts = this.mockBudgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      let status = 'On Track';
      
      if (spent >= budget.limit) {
        status = 'Over Budget';
      } else if (spent >= budget.limit * 0.8) {
        status = 'Near Limit';
      }

      return {
        category: budget.category,
        spent,
        limit: budget.limit,
        status
      };
    }).filter(alert => alert.spent > 0);

    this.monthlySummary = {
      income_total: incomeTotal,
      expense_total: expenseTotal,
      net_savings: incomeTotal - expenseTotal,
      budget_alerts: budgetAlerts
    };
  }

  private loadCategoryBreakdown(): void {
    const filteredTransactions = this.mockTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() + 1 === this.selectedMonth && 
             transactionDate.getFullYear() === this.selectedYear &&
             t.type === 'expense';
    });

    const categorySpending = this.calculateCategorySpending(filteredTransactions);
    
    this.categoryBreakdown = Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateCategorySpending(transactions: Transaction[]): { [key: string]: number } {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });
  }

  exportToCsv(): void {
    // Simulate API call for CSV export
    this.isLoading = true;
    
    setTimeout(() => {
      const startDate = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-01`;
      const endDate = new Date(this.selectedYear, this.selectedMonth, 0).toISOString().split('T')[0];
      
      // Filter transactions for the selected period
      const filteredTransactions = this.mockTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === this.selectedMonth && 
               transactionDate.getFullYear() === this.selectedYear;
      });

      // Generate CSV content
      const csvHeader = 'ID,Amount,Description,Date,Type,Category,Is Recurring,Recurrence Type\n';
      const csvRows = filteredTransactions.map(t => 
        `${t.id},${t.amount},"${t.description}",${t.date},${t.type},"${t.category}",${t.is_recurring},${t.recurrence_type || ''}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Create and download file
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
    }, 1000);
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