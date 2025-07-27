import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, of, forkJoin } from 'rxjs';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  recurringType?: 'weekly' | 'monthly';
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface ApiTransaction {
  id: number;
  amount: string;
  description: string;
  date: string;
  type?: 'income' | 'expense';
  category: { id: number; name: string } | number;
  is_recurring: boolean;
  recurrence_type: 'weekly' | 'monthly' | null;
  recurrence_count?: number;
}

interface ApiCategory {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description?: string;
}

@Component({
  selector: 'app-expense-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.scss']
})
export class ExpenseManagementComponent implements OnInit {
  // Form and Modal Properties
  transactionForm: FormGroup;
  showModal = false;
  editingTransaction: Transaction | null = null;
  loading = false;
  
  // Filter Properties
  searchTerm = '';
  selectedType = 'all';
  selectedCategory = 'all';
  selectedDateRange = 'all';
  sortBy = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Data Properties
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];
  otherCategoryId: number = 12; // Will be updated with actual ID from API
  
  // API Configuration - MODIFIED TO USE DJANGO LOCALHOST URL
  private readonly INCOME_API_URL = 'http://127.0.0.1:8000/api/transactions/income/';
  private readonly EXPENSE_API_URL = 'http://127.0.0.1:8000/api/transactions/expense/';
  private readonly CATEGORIES_URL = 'http://127.0.0.1:8000/api/categories/';
  private readonly BALANCE_API_URL = 'http://127.0.0.1:8000/api/transactions/balance/';
  private readonly CSV_EXPORT_URL = 'http://127.0.0.1:8000/api/export/csv/';
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Handle missing token case
      console.error('No authentication token found');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      isRecurring: [false],
      recurringType: ['monthly']
    });
  }
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }
  
  // Computed properties for template
  get totalIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  get totalExpenses(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  get netBalance(): number {
    return this.totalIncome - this.totalExpenses;
  }
  
  get isBalancePositive(): boolean {
    return this.netBalance >= 0;
  }
  
  get isBalanceNegative(): boolean {
    return this.netBalance < 0;
  }
  
  // API Data Loading Methods
  private loadCategories(): void {
    this.http.get<ApiCategory[]>(this.CATEGORIES_URL, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error loading categories:', error);
          // Use fallback categories if API fails
          this.categories = [
            { id: 1, name: 'Food & Dining', icon: 'fas fa-utensils', color: '#FF6B6B' },
            { id: 2, name: 'Transportation', icon: 'fas fa-car', color: '#4ECDC4' },
            { id: 3, name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#45B7D1' },
            { id: 4, name: 'Entertainment', icon: 'fas fa-film', color: '#96CEB4' },
            { id: 5, name: 'Bills & Utilities', icon: 'fas fa-file-invoice-dollar', color: '#FFEAA7' },
            { id: 6, name: 'Healthcare', icon: 'fas fa-heartbeat', color: '#DDA0DD' },
            { id: 7, name: 'Education', icon: 'fas fa-graduation-cap', color: '#98D8C8' },
            { id: 8, name: 'Travel', icon: 'fas fa-plane', color: '#F7DC6F' },
            { id: 9, name: 'Salary', icon: 'fas fa-money-check-alt', color: '#82E0AA' },
            { id: 10, name: 'Freelance', icon: 'fas fa-laptop-code', color: '#85C1E9' },
            { id: 11, name: 'Investment', icon: 'fas fa-chart-line', color: '#F8C471' },
            { id: 12, name: 'Other', icon: 'fas fa-ellipsis-h', color: '#BDC3C7' }
          ];
          this.otherCategoryId = 12;
          return of([]);
        })
      )
      .subscribe(apiCategories => {
        if (apiCategories && apiCategories.length > 0) {
          // Map API categories to our UI format with icons and colors
          this.categories = apiCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: this.getCategoryIconFromName(cat.name),
            color: this.getCategoryColorFromName(cat.name)
          }));
          // Find the "Other" category ID
          const otherCategory = this.categories.find(c => c.name.toLowerCase() === 'other');
          this.otherCategoryId = otherCategory ? otherCategory.id : 12;
        }
      });
  }
  
  private loadTransactions(): void {
    this.loading = true;
    // Create observables for income and expense transactions
    const incomeObservable = this.http.get<ApiTransaction[]>(this.INCOME_API_URL, { 
      headers: this.getAuthHeaders(),
      params: this.getApiParams()
    });
    const expenseObservable = this.http.get<ApiTransaction[]>(this.EXPENSE_API_URL, { 
      headers: this.getAuthHeaders(),
      params: this.getApiParams()
    });
    // Combine both requests
    forkJoin({
      income: incomeObservable.pipe(catchError(() => of([]))),
      expenses: expenseObservable.pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        // Process income transactions
        const incomeTransactions = results.income.map(t => ({
          id: t.id.toString(),
          type: 'income' as const,
          amount: parseFloat(t.amount),
          category: this.getCategoryNameFromApi(t.category),
          description: t.description,
          date: new Date(t.date),
          isRecurring: t.is_recurring,
          recurringType: t.recurrence_type as 'weekly' | 'monthly' | undefined
        }));
        // Process expense transactions
        const expenseTransactions = results.expenses.map(t => ({
          id: t.id.toString(),
          type: 'expense' as const,
          amount: parseFloat(t.amount),
          category: this.getCategoryNameFromApi(t.category),
          description: t.description,
          date: new Date(t.date),
          isRecurring: t.is_recurring,
          recurringType: t.recurrence_type as 'weekly' | 'monthly' | undefined
        }));
        // Combine and sort transactions
        this.transactions = [...incomeTransactions, ...expenseTransactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.applyClientSideFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.showNotification('Failed to load transactions. Please try again.');
        this.loading = false;
      }
    });
  }
  
  private getApiParams(): HttpParams {
    let params = new HttpParams();
    // Apply date range filter
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      params = params.set('start_date', startDate.toISOString().split('T')[0]);
      params = params.set('end_date', now.toISOString().split('T')[0]);
    }
    // Apply sorting
    let ordering = this.sortBy;
    if (this.sortOrder === 'desc') {
      ordering = '-' + ordering;
    }
    params = params.set('ordering', ordering);
    return params;
  }
  
  private applyClientSideFilters(): void {
    let filtered = [...this.transactions];
    // Apply search filter (client-side)
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }
    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === this.selectedType);
    }
    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.selectedCategory);
    }
    this.filteredTransactions = filtered;
  }
  
  // Modal Methods
  openModal(): void {
    this.showModal = true;
    this.editingTransaction = null;
    // Use setValue instead of reset for more predictable behavior
    this.transactionForm.setValue({
      type: 'expense',
      amount: '',
      category: this.categories.length > 0 ? this.categories[0].name : '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurringType: 'monthly'
    });
  }
  
  closeModal(): void {
    this.showModal = false;
    this.editingTransaction = null;
    this.transactionForm.reset();
  }
  
  editTransaction(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.showModal = true;
    this.transactionForm.setValue({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date.toISOString().split('T')[0],
      isRecurring: transaction.isRecurring,
      recurringType: transaction.recurringType || 'monthly'
    });
  }
  
  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.loading = true;
      const formValue = this.transactionForm.value;
      // Find category ID from name
      const categoryId = this.getCategoryIdByName(formValue.category);
      if (!categoryId) {
        this.showNotification('Please select a valid category');
        this.loading = false;
        return;
      }
      // Prepare API payload
      const payload = {
        amount: formValue.amount,
        category: categoryId,
        description: formValue.description,
        date: formValue.date,
        is_recurring: formValue.isRecurring,
        recurrence_type: formValue.isRecurring ? formValue.recurringType : null,
        ...(formValue.isRecurring && { recurrence_count: 1 })
      };
      const apiUrl = formValue.type === 'income' ? this.INCOME_API_URL : this.EXPENSE_API_URL;
      if (this.editingTransaction) {
        // Update existing transaction
        const transactionId = this.editingTransaction.id;
        const updateUrl = `${apiUrl}${transactionId}/`;
        this.http.put<ApiTransaction>(updateUrl, payload, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error updating transaction:', error);
            this.showNotification('Failed to update transaction. Please try again.');
            this.loading = false;
            return throwError(() => error);
          })
        ).subscribe(() => {
          this.loadTransactions();
          this.closeModal();
        });
      } else {
        // Add new transaction
        this.http.post<ApiTransaction>(apiUrl, payload, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(error => {
            console.error('Error creating transaction:', error);
            this.showNotification('Failed to create transaction. Please check your data and try again.');
            this.loading = false;
            return throwError(() => error);
          })
        ).subscribe(() => {
          this.loadTransactions();
          this.closeModal();
        });
      }
    }
  }
  
  deleteTransaction(transaction: Transaction): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.loading = true;
      const apiUrl = transaction.type === 'income' ? this.INCOME_API_URL : this.EXPENSE_API_URL;
      const deleteUrl = `${apiUrl}${transaction.id}/`;
      this.http.delete(deleteUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error deleting transaction:', error);
          this.showNotification('Failed to delete transaction. Please try again.');
          this.loading = false;
          return throwError(() => error);
        })
      ).subscribe(() => {
        this.loadTransactions();
      });
    }
  }
  
  // Filter and Search Methods
  onFilterChange(): void {
    this.loadTransactions();
  }
  
  // Helper Methods
  private getCategoryIconFromName(categoryName: string): string {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('food') || nameLower.includes('dining')) return 'fas fa-utensils';
    if (nameLower.includes('transport') || nameLower.includes('car')) return 'fas fa-car';
    if (nameLower.includes('shop') || nameLower.includes('grocery')) return 'fas fa-shopping-bag';
    if (nameLower.includes('entertain')) return 'fas fa-film';
    if (nameLower.includes('bill') || nameLower.includes('utility')) return 'fas fa-file-invoice-dollar';
    if (nameLower.includes('health') || nameLower.includes('doctor')) return 'fas fa-heartbeat';
    if (nameLower.includes('educat')) return 'fas fa-graduation-cap';
    if (nameLower.includes('travel') || nameLower.includes('flight')) return 'fas fa-plane';
    if (nameLower.includes('salary') || nameLower.includes('income')) return 'fas fa-money-check-alt';
    if (nameLower.includes('freelance') || nameLower.includes('work')) return 'fas fa-laptop-code';
    if (nameLower.includes('invest')) return 'fas fa-chart-line';
    return 'fas fa-ellipsis-h';
  }
  
  private getCategoryColorFromName(categoryName: string): string {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('food') || nameLower.includes('dining')) return '#FF6B6B';
    if (nameLower.includes('transport') || nameLower.includes('car')) return '#4ECDC4';
    if (nameLower.includes('shop') || nameLower.includes('grocery')) return '#45B7D1';
    if (nameLower.includes('entertain')) return '#96CEB4';
    if (nameLower.includes('bill') || nameLower.includes('utility')) return '#FFEAA7';
    if (nameLower.includes('health') || nameLower.includes('doctor')) return '#DDA0DD';
    if (nameLower.includes('educat')) return '#98D8C8';
    if (nameLower.includes('travel') || nameLower.includes('flight')) return '#F7DC6F';
    if (nameLower.includes('salary') || nameLower.includes('income')) return '#82E0AA';
    if (nameLower.includes('freelance') || nameLower.includes('work')) return '#85C1E9';
    if (nameLower.includes('invest')) return '#F8C471';
    return '#BDC3C7';
  }
  
  private getCategoryIdByName(categoryName: string): number | null {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.id : this.otherCategoryId;
  }
  
  private getCategoryNameFromApi(category: any): string {
    // API returns either a category object or just an ID
    if (typeof category === 'object' && category !== null) {
      return category.name || 'Other';
    } else if (typeof category === 'number') {
      // Find category by ID in our local categories array
      const categoryObj = this.categories.find(c => c.id === category);
      return categoryObj ? categoryObj.name : 'Other';
    }
    return 'Other';
  }
  
  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : this.getCategoryIconFromName(categoryName);
  }
  
  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.color : this.getCategoryColorFromName(categoryName);
  }
  
  trackByFn(index: number, item: Transaction): string {
    return item.id;
  }
  
  exportToCsv(): void {
    this.loading = true;
    // Set date range based on selectedDateRange
    let params = new HttpParams();
    const now = new Date();
    if (this.selectedDateRange !== 'all') {
      let startDate: Date;
      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(2000, 0, 1); // Very old date
      }
      params = params.set('start_date', startDate.toISOString().split('T')[0]);
      params = params.set('end_date', now.toISOString().split('T')[0]);
    }
    // Fetch CSV directly - CORRECTED BLOB HANDLING
    this.http.get(this.CSV_EXPORT_URL, {
      headers: this.getAuthHeaders(),
      params,
      responseType: 'blob' // Correct response type without casting
    }).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error exporting CSV:', error);
        this.showNotification('Failed to export transactions. Please try again.');
        this.loading = false;
      }
    });
  }
  
  private showNotification(message: string): void {
    // In a real application, replace this with a proper notification service
    console.warn('Notification:', message);
    // Example with a proper service would be:
    // this.notificationService.show(message);
  }
}