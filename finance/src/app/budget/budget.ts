import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, forkJoin } from 'rxjs';
interface Category {
  id: number;
  name: string;
  type: string;
  description?: string;
}
interface Budget {
  id: number;
  name: string;
  amount: string;
  category: number;
  start_date: string;
  end_date: string;
}
interface BudgetAlert {
  category: string;
  spent: number;
  limit: number;
  status: 'Near Limit' | 'Exceeded' | 'Safe';
  percentage: number;
}
@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.scss']
})
export class BudgetsComponent implements OnInit {
  showCreateForm = false;
  editingBudget: Budget | null = null;
  budgetForm: FormGroup;
  showCategoryForm = false;
  editingCategory: Category | null = null;
  categoryForm: FormGroup;
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  expenseCategories: Category[] = [];
  budgets: Budget[] = [];
  budgetAlerts: BudgetAlert[] = [];
  // Updated API URLs to use Django backend
  private baseUrl = 'http://127.0.0.1:8000';
  private apiUrl = `${this.baseUrl}/api/budgets/`;
  private categoriesUrl = `${this.baseUrl}/api/categories/`;
  private transactionsUrl = `${this.baseUrl}/api/transactions/expense/`;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.budgetForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      description: ['']
    });
  }
  
  /**
   * Get authentication headers with Bearer token
   */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found in localStorage');
      // You might want to redirect to login here
    }
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  ngOnInit() {
    this.initializeFormDates();
    this.loadCategories();
    this.loadBudgets();
  }
  private initializeFormDates() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    this.budgetForm.patchValue({
      start_date: today.toISOString().split('T')[0],
      end_date: nextMonth.toISOString().split('T')[0]
    });
  }
  private loadCategories() {
    this.http.get<{results: Category[]} | Category[]>(`${this.categoriesUrl}?type=expense`, this.getAuthHeaders())
      .pipe(
        tap(response => {
          // Handle both paginated and non-paginated responses
          this.expenseCategories = Array.isArray(response) ? response : response.results;
        }),
        catchError(error => {
          console.error('Error fetching categories:', error);
          this.handleAuthError(error);
          this.showError('Failed to load categories');
          return throwError(() => error);
        })
      )
      .subscribe();
  }
  private loadBudgets() {
    this.http.get<Budget[]>(this.apiUrl, this.getAuthHeaders())
      .pipe(
        tap(budgets => {
          this.budgets = budgets;
          this.calculateBudgetAlerts();
        }),
        catchError(error => {
          console.error('Error fetching budgets:', error);
          this.handleAuthError(error);
          this.showError('Failed to load budgets');
          return throwError(() => error);
        })
      )
      .subscribe();
  }
  private calculateBudgetAlerts() {
    // Clear existing alerts
    this.budgetAlerts = [];
    // Get all expenses to calculate spent amounts
    this.http.get<any[]>(this.transactionsUrl, this.getAuthHeaders())
      .pipe(
        catchError(error => {
          console.error('Error fetching expenses:', error);
          this.handleAuthError(error);
          return [];
        })
      )
      .subscribe(expenses => {
        for (const budget of this.budgets) {
          // Find category name
          const category = this.expenseCategories.find(c => c.id === budget.category);
          if (!category) continue;
          // Parse dates
          const budgetStartDate = new Date(budget.start_date);
          const budgetEndDate = new Date(budget.end_date);
          // Calculate total spent in this budget period
          const spent = expenses
            .filter(expense => {
              const expenseDate = new Date(expense.date);
              return expense.category === budget.category &&
                     expenseDate >= budgetStartDate && 
                     expenseDate <= budgetEndDate;
            })
            .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
          const limit = parseFloat(budget.amount);
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          let status: 'Near Limit' | 'Exceeded' | 'Safe' = 'Safe';
          if (percentage >= 90 && percentage < 100) {
            status = 'Near Limit';
          } else if (percentage >= 100) {
            status = 'Exceeded';
          }
          this.budgetAlerts.push({
            category: category.name,
            spent: spent,
            limit: limit,
            status: status,
            percentage: Math.round(percentage)
          });
        }
      });
  }
  // BUDGET OPERATIONS
  onSubmitBudget() {
    if (this.budgetForm.valid) {
      const formData = this.budgetForm.value;
      const budgetData = {
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date
      };
      if (this.editingBudget) {
        // Update existing budget
        this.http.put(`${this.apiUrl}${this.editingBudget.id}/`, budgetData, this.getAuthHeaders())
          .pipe(
            catchError(error => {
              console.error('Error updating budget:', error);
              this.handleAuthError(error);
              this.handleApiError(error, 'Failed to update budget');
              return throwError(() => error);
            })
          )
          .subscribe(updatedBudget => {
            const index = this.budgets.findIndex(b => b.id === this.editingBudget!.id);
            if (index !== -1) {
              this.budgets[index] = updatedBudget as Budget;
            }
            this.resetBudgetForm();
            this.calculateBudgetAlerts();
            this.showSuccess('Budget updated successfully!');
          });
      } else {
        // Create new budget
        this.http.post(this.apiUrl, budgetData, this.getAuthHeaders())
          .pipe(
            catchError(error => {
              console.error('Error creating budget:', error);
              this.handleAuthError(error);
              this.handleApiError(error, 'Failed to create budget');
              return throwError(() => error);
            })
          )
          .subscribe(newBudget => {
            this.budgets.push(newBudget as Budget);
            this.resetBudgetForm();
            this.calculateBudgetAlerts();
            this.showSuccess('Budget created successfully!');
          });
      }
    }
  }
  editBudget(budget: Budget) {
    this.editingBudget = budget;
    this.showCreateForm = true;
    this.budgetForm.patchValue({
      name: budget.name,
      amount: parseFloat(budget.amount),
      category: budget.category,
      start_date: budget.start_date,
      end_date: budget.end_date
    });
  }
  deleteBudget(budgetId: number) {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.http.delete(`${this.apiUrl}${budgetId}/`, this.getAuthHeaders())
        .pipe(
          catchError(error => {
            console.error('Error deleting budget:', error);
            this.handleAuthError(error);
            this.handleApiError(error, 'Failed to delete budget');
            return throwError(() => error);
          })
        )
        .subscribe(() => {
          this.budgets = this.budgets.filter(b => b.id !== budgetId);
          this.calculateBudgetAlerts();
          this.showSuccess('Budget deleted successfully!');
        });
    }
  }
  cancelBudgetForm() {
    this.resetBudgetForm();
  }
  private resetBudgetForm() {
    this.showCreateForm = false;
    this.editingBudget = null;
    this.initializeFormDates();
    this.budgetForm.patchValue({
      name: '',
      amount: '',
      category: ''
    });
  }
  // CATEGORY OPERATIONS
  onSubmitCategory() {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;
      const categoryData = {
        name: formData.name,
        type: formData.type,
        description: formData.description
      };
      if (this.editingCategory) {
        // Update existing category
        this.http.put(`${this.categoriesUrl}${this.editingCategory.id}/`, categoryData, this.getAuthHeaders())
          .pipe(
            catchError(error => {
              console.error('Error updating category:', error);
              this.handleAuthError(error);
              this.handleApiError(error, 'Failed to update category');
              return throwError(() => error);
            })
          )
          .subscribe(updatedCategory => {
            const index = this.expenseCategories.findIndex(c => c.id === this.editingCategory!.id);
            if (index !== -1) {
              this.expenseCategories[index] = updatedCategory as Category;
            }
            this.resetCategoryForm();
            this.showSuccess('Category updated successfully!');
          });
      } else {
        // Create new category
        this.http.post(this.categoriesUrl, categoryData, this.getAuthHeaders())
          .pipe(
            catchError(error => {
              console.error('Error creating category:', error);
              this.handleAuthError(error);
              this.handleApiError(error, 'Failed to create category');
              return throwError(() => error);
            })
          )
          .subscribe(newCategory => {
            this.expenseCategories.push(newCategory as Category);
            this.resetCategoryForm();
            this.showSuccess('Category created successfully!');
          });
      }
    }
  }
  editCategory(category: Category) {
    this.editingCategory = category;
    this.showCategoryForm = true;
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
      description: category.description || ''
    });
  }
  deleteCategory(categoryId: number) {
    if (confirm('Are you sure you want to delete this category? This will also delete any budgets associated with it.')) {
      this.http.delete(`${this.categoriesUrl}${categoryId}/`, this.getAuthHeaders())
        .pipe(
          catchError(error => {
            console.error('Error deleting category:', error);
            this.handleAuthError(error);
            this.handleApiError(error, 'Failed to delete category');
            return throwError(() => error);
          })
        )
        .subscribe(() => {
          this.expenseCategories = this.expenseCategories.filter(c => c.id !== categoryId);
          this.showSuccess('Category deleted successfully!');
        });
    }
  }
  cancelCategoryForm() {
    this.resetCategoryForm();
  }
  private resetCategoryForm() {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      type: 'expense',
      description: ''
    });
  }
  // UTILITY METHODS
  getCategoryName(categoryId: number): string {
    const category = this.expenseCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'Exceeded': return 'exceeded';
      case 'Near Limit': return 'near-limit';
      case 'Safe': return 'safe';
      default: return '';
    }
  }
  
  /**
   * Handle authentication errors (401 Unauthorized)
   */
  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.error('Authentication failed - token may be expired or invalid');
      // Clear the invalid token
      localStorage.removeItem('access_token');
      // Redirect to login page
      window.location.href = '/login';
    }
  }
  
  private handleApiError(error: HttpErrorResponse, defaultMessage: string) {
    let errorMessage = defaultMessage;
    if (error.error && typeof error.error === 'object') {
      // Extract first error message from the response
      const firstKey = Object.keys(error.error)[0];
      const firstError = error.error[firstKey];
      errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
    }
    this.showError(errorMessage);
  }
  private showError(message: string) {
    alert(`Error: ${message}`);
  }
  private showSuccess(message: string) {
    alert(message);
  }
}