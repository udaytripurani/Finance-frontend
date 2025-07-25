import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Budget {
  id: number;
  category: Category;
  monthly_limit: string;
  month: number;
  year: number;
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
  currentYear = new Date().getFullYear();
  
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Hardcoded data based on API spec
  expenseCategories: Category[] = [
    { id: 2, name: 'Groceries', type: 'expense' },
    { id: 3, name: 'Utilities', type: 'expense' },
    { id: 4, name: 'Rent', type: 'expense' },
    { id: 5, name: 'Entertainment', type: 'expense' },
    { id: 6, name: 'Transportation', type: 'expense' },
    { id: 7, name: 'Healthcare', type: 'expense' },
    { id: 8, name: 'Dining Out', type: 'expense' }
  ];

  budgets: Budget[] = [
    {
      id: 1,
      category: { id: 2, name: 'Groceries', type: 'expense' },
      monthly_limit: '1000.00',
      month: 7,
      year: 2025
    },
    {
      id: 2,
      category: { id: 3, name: 'Utilities', type: 'expense' },
      monthly_limit: '500.00',
      month: 7,
      year: 2025
    },
    {
      id: 3,
      category: { id: 5, name: 'Entertainment', type: 'expense' },
      monthly_limit: '300.00',
      month: 7,
      year: 2025
    }
  ];

  budgetAlerts: BudgetAlert[] = [
    {
      category: 'Groceries',
      spent: 980.00,
      limit: 1000.00,
      status: 'Near Limit',
      percentage: 98
    },
    {
      category: 'Entertainment',
      spent: 350.00,
      limit: 300.00,
      status: 'Exceeded',
      percentage: 117
    },
    {
      category: 'Utilities',
      spent: 250.00,
      limit: 500.00,
      status: 'Safe',
      percentage: 50
    }
  ];

  constructor(private fb: FormBuilder) {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      monthly_limit: ['', [Validators.required, Validators.min(0.01)]],
      month: [new Date().getMonth() + 1, Validators.required],
      year: [this.currentYear, Validators.required]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.budgetForm.valid) {
      const formData = this.budgetForm.value;
      const categoryId = parseInt(formData.category);
      const category = this.expenseCategories.find(cat => cat.id === categoryId);
      
      if (this.editingBudget) {
        // Update existing budget
        const index = this.budgets.findIndex(b => b.id === this.editingBudget!.id);
        if (index !== -1) {
          this.budgets[index] = {
            ...this.editingBudget,
            category: category!,
            monthly_limit: formData.monthly_limit.toString(),
            month: formData.month,
            year: formData.year
          };
        }
        this.editingBudget = null;
      } else {
        // Create new budget
        const newBudget: Budget = {
          id: Math.max(...this.budgets.map(b => b.id), 0) + 1,
          category: category!,
          monthly_limit: formData.monthly_limit.toString(),
          month: formData.month,
          year: formData.year
        };
        this.budgets.push(newBudget);
      }
      
      this.resetForm();
      alert('Budget saved successfully!');
    }
  }

  editBudget(budget: Budget) {
    this.editingBudget = budget;
    this.showCreateForm = true;
    this.budgetForm.patchValue({
      category: budget.category.id,
      monthly_limit: parseFloat(budget.monthly_limit),
      month: budget.month,
      year: budget.year
    });
  }

  deleteBudget(budgetId: number) {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgets = this.budgets.filter(b => b.id !== budgetId);
      alert('Budget deleted successfully!');
    }
  }

  cancelForm() {
    this.resetForm();
  }

  private resetForm() {
    this.showCreateForm = false;
    this.editingBudget = null;
    this.budgetForm.reset({
      month: new Date().getMonth() + 1,
      year: this.currentYear
    });
  }

  getMonthName(monthNumber: number): string {
    return this.months[monthNumber - 1];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Exceeded': return 'exceeded';
      case 'Near Limit': return 'near-limit';
      case 'Safe': return 'safe';
      default: return '';
    }
  }
}