import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  name: string;
  icon: string;
  color: string;
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
  categories: Category[] = [
    { name: 'Food & Dining', icon: 'fas fa-utensils', color: '#FF6B6B' },
    { name: 'Transportation', icon: 'fas fa-car', color: '#4ECDC4' },
    { name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#45B7D1' },
    { name: 'Entertainment', icon: 'fas fa-film', color: '#96CEB4' },
    { name: 'Bills & Utilities', icon: 'fas fa-file-invoice-dollar', color: '#FFEAA7' },
    { name: 'Healthcare', icon: 'fas fa-heartbeat', color: '#DDA0DD' },
    { name: 'Education', icon: 'fas fa-graduation-cap', color: '#98D8C8' },
    { name: 'Travel', icon: 'fas fa-plane', color: '#F7DC6F' },
    { name: 'Salary', icon: 'fas fa-money-check-alt', color: '#82E0AA' },
    { name: 'Freelance', icon: 'fas fa-laptop-code', color: '#85C1E9' },
    { name: 'Investment', icon: 'fas fa-chart-line', color: '#F8C471' },
    { name: 'Other', icon: 'fas fa-ellipsis-h', color: '#BDC3C7' }
  ];

  constructor(private fb: FormBuilder) {
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
    this.loadHardcodedData();
    this.onFilterChange();
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

  // Hardcoded data until API is available
  private loadHardcodedData(): void {
    this.transactions = [
      {
        id: '1',
        type: 'expense',
        amount: 850.00,
        category: 'Food & Dining',
        description: 'Dinner at restaurant',
        date: new Date('2024-07-20'),
        isRecurring: false
      },
      {
        id: '2',
        type: 'income',
        amount: 5000.00,
        category: 'Salary',
        description: 'Monthly salary payment',
        date: new Date('2024-07-15'),
        isRecurring: true,
        recurringType: 'monthly'
      },
      {
        id: '3',
        type: 'expense',
        amount: 1200.00,
        category: 'Transportation',
        description: 'Fuel and maintenance',
        date: new Date('2024-07-18'),
        isRecurring: false
      },
      {
        id: '4',
        type: 'expense',
        amount: 2500.00,
        category: 'Shopping',
        description: 'Grocery shopping',
        date: new Date('2024-07-22'),
        isRecurring: false
      },
      {
        id: '5',
        type: 'income',
        amount: 1500.00,
        category: 'Freelance',
        description: 'Web development project',
        date: new Date('2024-07-19'),
        isRecurring: false
      },
      {
        id: '6',
        type: 'expense',
        amount: 3200.00,
        category: 'Bills & Utilities',
        description: 'Electricity and internet bill',
        date: new Date('2024-07-10'),
        isRecurring: true,
        recurringType: 'monthly'
      },
      {
        id: '7',
        type: 'expense',
        amount: 750.00,
        category: 'Entertainment',
        description: 'Movie tickets and snacks',
        date: new Date('2024-07-21'),
        isRecurring: false
      },
      {
        id: '8',
        type: 'expense',
        amount: 450.00,
        category: 'Healthcare',
        description: 'Doctor consultation',
        date: new Date('2024-07-16'),
        isRecurring: false
      }
    ];
  }

  // Modal Methods
  openModal(): void {
    this.showModal = true;
    this.editingTransaction = null;
    this.transactionForm.reset({
      type: 'expense',
      amount: '',
      category: '',
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
    
    this.transactionForm.patchValue({
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
      
      // Simulate API call delay
      setTimeout(() => {
        const formValue = this.transactionForm.value;
        const transactionData: Transaction = {
          id: this.editingTransaction ? this.editingTransaction.id : Date.now().toString(),
          type: formValue.type,
          amount: parseFloat(formValue.amount),
          category: formValue.category,
          description: formValue.description,
          date: new Date(formValue.date),
          isRecurring: formValue.isRecurring,
          recurringType: formValue.isRecurring ? formValue.recurringType : undefined
        };

        if (this.editingTransaction) {
          // Update existing transaction
          const index = this.transactions.findIndex(t => t.id === this.editingTransaction!.id);
          if (index !== -1) {
            this.transactions[index] = transactionData;
          }
        } else {
          // Add new transaction
          this.transactions.push(transactionData);
        }

        this.onFilterChange();
        this.closeModal();
        this.loading = false;
      }, 1000);
    }
  }

  deleteTransaction(transaction: Transaction): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactions = this.transactions.filter(t => t.id !== transaction.id);
      this.onFilterChange();
    }
  }

  // Filter and Search Methods
  onFilterChange(): void {
    let filtered = [...this.transactions];

    // Apply search filter
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

    // Apply date range filter
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        switch (this.selectedDateRange) {
          case 'today':
            return transactionDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredTransactions = filtered;
  }

  // Helper Methods
  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : 'fas fa-ellipsis-h';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.color : '#BDC3C7';
  }

  trackByFn(index: number, item: Transaction): string {
    return item.id;
  }

  exportToCsv(): void {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring'];
    const csvContent = [
      headers.join(','),
      ...this.filteredTransactions.map(t => [
        t.date.toISOString().split('T')[0],
        t.type,
        t.category,
        `"${t.description}"`,
        t.amount.toFixed(2),
        t.isRecurring ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}