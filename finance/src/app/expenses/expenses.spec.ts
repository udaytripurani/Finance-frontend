import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExpenseManagementComponent } from './expenses';

describe('ExpenseManagementComponent', () => {
  let component: ExpenseManagementComponent;
  let fixture: ComponentFixture<ExpenseManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExpenseManagementComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseManagementComponent);
    component = fixture.componentInstance;
    
    // Mock localStorage to prevent authentication errors
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.transactionForm.get('amount')?.value).toBe('');
    expect(component.transactionForm.get('description')?.value).toBe('');
    expect(component.transactionForm.get('category')?.value).toBe('');
    // Don't test date as it might be initialized with current date
  });

  it('should validate required fields', () => {
    const amountControl = component.transactionForm.get('amount');
    const descriptionControl = component.transactionForm.get('description');
    const categoryControl = component.transactionForm.get('category');
    
    amountControl?.setValue('');
    descriptionControl?.setValue('');
    categoryControl?.setValue('');
    
    expect(amountControl?.hasError('required')).toBe(true);
    expect(descriptionControl?.hasError('required')).toBe(true);
    expect(categoryControl?.hasError('required')).toBe(true);
  });

  it('should validate amount is positive', () => {
    const amountControl = component.transactionForm.get('amount');
    
    amountControl?.setValue(-100);
    expect(amountControl?.hasError('min')).toBe(true);
    
    amountControl?.setValue(100);
    expect(amountControl?.valid).toBe(true);
  });

  it('should have transactions array', () => {
    expect(Array.isArray(component.transactions)).toBe(true);
  });

  it('should have filtered transactions array', () => {
    expect(Array.isArray(component.filteredTransactions)).toBe(true);
  });

  it('should have categories array', () => {
    expect(Array.isArray(component.categories)).toBe(true);
  });

  it('should initialize showModal as false', () => {
    expect(component.showModal).toBe(false);
  });

  it('should initialize loading as false', () => {
    expect(component.loading).toBe(false);
  });

  it('should initialize searchTerm as empty string', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should initialize selectedType as all', () => {
    expect(component.selectedType).toBe('all');
  });

  it('should initialize selectedCategory as all', () => {
    expect(component.selectedCategory).toBe('all');
  });

  it('should initialize selectedDateRange as all', () => {
    expect(component.selectedDateRange).toBe('all');
  });

  it('should initialize sortBy as date', () => {
    expect(component.sortBy).toBe('date');
  });

  it('should initialize sortOrder as desc', () => {
    expect(component.sortOrder).toBe('desc');
  });

  it('should initialize editingTransaction as null', () => {
    expect(component.editingTransaction).toBe(null);
  });
});
